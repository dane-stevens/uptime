import { db } from "~/utils/db.server";
import { Queue, Worker } from 'bullmq'
import { env } from "./utils/env.server";
import { performance } from 'node:perf_hooks'
import { monitorLogs } from "./db/schema";
import https from 'node:https'

const queueName = `${env.NODE_ENV}-monitor-checks`

export const monitorQueue = new Queue(queueName, {
  connection: {
    url: env.REDIS_URL
  }
});
export async function loadMonitors() {
  const monitors = await db.query.monitors.findMany({
    where: (monitors, { eq }) => eq(monitors.isActive, true)
  })

  for (const monitor of monitors) {
    await monitorQueue.upsertJobScheduler(
      monitor.hId,
      { every: 1000 * monitor.interval },
      {
        name: 'url-monitor',
        data: { monitorId: monitor.id, url: monitor.url },
      }
    )
  }

}

loadMonitors()

const worker = new Worker(queueName, async (job) => {
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

    const req = https.request(url, res => {
      timings.firstByte = performance.now() - start;
      timings.statusCode = res.statusCode

      res.once("end", () => {
        timings.total = performance.now() - start;
        resolve(timings);
      });

      res.resume();
    });

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