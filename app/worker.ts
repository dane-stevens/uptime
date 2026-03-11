import { monitorLogs, monitors } from "./db/schema"
import { db } from "./utils/db.server"
import { env } from "./utils/env.server"
import { queueName } from "./utils/queues.server"
import https from 'node:https'
import { performance } from 'node:perf_hooks'
import { Worker } from "bullmq"
import { redis } from "./utils/redis.server"

const agent = new https.Agent({
  keepAlive: false
});

new Worker<typeof monitors.$inferSelect>(`${queueName}_${env.RAILWAY_REPLICA_REGION}`, async (job) => {
  const { id, hId, url, regions, failureQuorum, successQuorum } = job.data

  console.log('running worker----', regions, env.RAILWAY_REPLICA_REGION)
  if (!regions?.includes(env.RAILWAY_REPLICA_REGION)) return { skipped: true }


  const controller = new AbortController()

  const timeout = setTimeout(() => controller.abort(), 5000)

  const now = new Date()
  const start = performance.now()

  try {
    const res = await testUrl(url).then(res => res)

    const result = await processResult(
      {
        monitorId: hId,
        region: env.RAILWAY_REPLICA_REGION,
        success: res.success
      },
      {
        windowMs: 15000,
        failureQuorum,
        successQuorum
      }
    )

    if (result.status === "incident_opened") {
      // await sendAlert(monitorId)
      console.log('STATUS:', result.status)
    }

    if (result.status === "incident_resolved") {
      // await sendRecovery(monitorId)
      console.log('STATUS:', result.status)
    }

    // await db.insert(monitorLogs).values({
    //   monitorId: monitorId,
    //   statusCode: res.statusCode,
    //   responseTime: res.total,
    //   responseTimeDNS: res.dns,
    //   responseTimeFirstByte: res.firstByte,
    //   responseTimeTCP: res.tcp,
    //   responseTimeTLS: res.tls,
    //   region: env.RAILWAY_REPLICA_REGION,
    //   createdAt: now
    // })

    return {
      status: res.statusCode,
    }

  } catch (err: any) {

    clearTimeout(timeout)
    return {
      status: 0,
      error: err.message,
      responseTime: performance.now() - start
    }
  }

}, {
  connection: {
    url: env.REDIS_URL
  }
})

function testUrl(url: string): Promise<{ success: boolean; error?: string; firstByte: number; statusCode: number; total: number; dns: number; tcp: number; tls: number }> {
  return new Promise((resolve, reject) => {
    const timings: any = {};
    const start = performance.now();

    const req = https.request(url, { agent, headers: { 'User-Agent': 'uptime-monitor/1.0', 'X-Monitoring': 'true' } }, res => {
      timings.firstByte = performance.now() - start;
      timings.statusCode = res.statusCode

      res.once("end", () => {
        timings.total = performance.now() - start;
        resolve({
          success: res.statusCode && res.statusCode < 500,
          ...timings
        });
      });

      res.resume();
    });

    req.setTimeout(10000, () => {
      req.destroy(new Error("timeout"))
    })

    req.on("socket", socket => {
      socket.once("lookup", () => {
        timings.dns = performance.now() - start;
      });

      socket.once("connect", () => {
        timings.tcp = performance.now() - start;
      });

      socket.once("secureConnect", () => {
        timings.tls = performance.now() - start;
      });
    });

    req.on("error", err => {
      resolve({
        success: false,
        error: err.message,
        ...timings
      })
    });
    req.end();
  });
}


type CheckResult = {
  monitorId: number
  region: string
  success: boolean
}

type QuorumConfig = {
  windowMs: number,
  failureQuorum: number,
  successQuorum: number
}

export async function processResult(
  result: CheckResult,
  config: QuorumConfig
) {
  const { monitorId, region, success } = result
  const { windowMs, failureQuorum, successQuorum } = config

  const now = Date.now()
  const cutoff = now - windowMs

  const failuresKey = `monitor:${monitorId}:failures`
  const successesKey = `monitor:${monitorId}:successes`
  const incidentKey = `monitor:${monitorId}:incident`

  const key = success ? successesKey : failuresKey

  // 1️⃣ record result
  await redis.zAdd(key, { score: now, value: region })

  // 2️⃣ remove old entries outside window
  await redis.zRemRangeByScore(key, 0, cutoff)

  // 3️⃣ count recent results
  const count = await redis.zCount(key, cutoff, now)

  // 4️⃣ quorum evaluation
  if (!success && Number(count || 0) >= failureQuorum) {
    const opened = await redis.set(incidentKey, "1", {
      EX: 3600,
      NX: true
    })

    if (opened) {
      return { status: "incident_opened" }
    }
  }

  if (success && Number(count || 0) >= successQuorum) {
    const exists = await redis.get(incidentKey)

    if (exists) {
      await redis.del(incidentKey)
      return { status: "incident_resolved" }
    }
  }

  return { status: "noop" }
}