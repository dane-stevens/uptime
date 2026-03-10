import { db } from "~/utils/db.server";
import { Queue, } from 'bullmq'
import { env } from "./utils/env.server";
import { regions } from "./utils/regions";


const queueName = `${env.NODE_ENV}_monitor-checks`


const queues: Queue[] = []
regions?.map(region => {
  queues.push(new Queue(`${queueName}_${region}`, { connection: { url: env.REDIS_URL } }))
})

export { queues }

// export const monitorQueue = new Queue(queueName, {
//   connection: {
//     url: env.REDIS_URL
//   }
// });
export async function loadMonitors() {
  const monitors = await db.query.monitors.findMany({
    where: (monitors, { eq }) => eq(monitors.isActive, true)
  })

  for (const monitor of monitors) {
    for (const q of queues) {
      await q.upsertJobScheduler(
        monitor.hId,
        { every: 1000 * monitor.interval },
        {
          name: 'url-monitor',
          data: { monitorId: monitor.id, url: monitor.url },
        }
      )
    }
  }

}

loadMonitors()
