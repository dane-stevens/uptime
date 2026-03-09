import { auth } from "~/utils/session.server";
import type { Route } from "./+types/monitorStats";
import { db } from "~/utils/db.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  await auth(request)
  const logs = await db.query.monitorLogs.findFirst({
    where: (monitorLogs, { eq }) => eq(monitorLogs.monitorId, params.monitor_id),
    orderBy: (monitorLogs, { desc }) => desc(monitorLogs.id),
  })
  return {
    logs
  }
}