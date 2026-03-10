import { monitorLogs } from "./db/schema"
import { db } from "./utils/db.server"
import { env } from "./utils/env.server"
import { queueName } from "./utils/queues.server"
import https from 'node:https'
import { performance } from 'node:perf_hooks'
import { Worker } from "bullmq"

const agent = new https.Agent({
  keepAlive: false
});



new Worker(`${queueName}_${env.RAILWAY_REPLICA_REGION}`, async (job) => {
  const { monitorId, url } = job.data

  const controller = new AbortController()

  const timeout = setTimeout(() => controller.abort(), 5000)

  const now = new Date()
  const start = performance.now()

  try {
    const res = await testUrl(url).then(res => res)
    console.log(res)
    await db.insert(monitorLogs).values({
      monitorId: monitorId,
      statusCode: res.statusCode,
      responseTime: res.total,
      responseTimeDNS: res.dns,
      responseTimeFirstByte: res.firstByte,
      responseTimeTCP: res.tcp,
      responseTimeTLS: res.tls,
      createdAt: now
    })

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

function testUrl(url: string) {
  return new Promise((resolve, reject) => {
    const timings: any = {};
    const start = performance.now();

    const req = https.request(url, { agent, headers: { 'User-Agent': 'uptime-monitor/1.0', 'X-Monitoring': 'true' } }, res => {
      timings.firstByte = performance.now() - start;
      timings.statusCode = res.statusCode

      res.once("end", () => {
        timings.total = performance.now() - start;
        resolve(timings);
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

    req.on("error", reject);
    req.end();
  });
}