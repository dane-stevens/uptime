import { db } from "~/utils/db.server";
import { Queue, Worker } from 'bullmq'
import { env } from "./utils/env.server";
import { performance } from 'node:perf_hooks'
import { monitorLogs } from "./db/schema";

const queueName = 'monitor-checks'

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
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    const responseTime = performance.now() - start
    await db.insert(monitorLogs).values({
      monitorId: monitorId,
      statusCode: res.status,
      responseTime,
      createdAt: now
    })
    return {
      status: res.status,
      ok: res.ok,
      responseTime
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
