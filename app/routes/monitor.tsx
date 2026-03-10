import { auth } from "~/utils/session.server";
import type { Route } from "./+types/monitor";
import { db } from "~/utils/db.server";
import { Container } from "~/components/Container";
import { H } from "~/components/Headings";

export async function loader({ request, params }: Route.LoaderArgs) {
  await auth(request)
  const monitor = await db.query.monitors.findFirst({
    where: (monitors, { eq }) => eq(monitors.hId, params.monitor_hId)
  })

  return {
    monitor
  }
}

export default function Monitor(props: Route.ComponentProps) {
  const { monitor } = props.loaderData
  return (
    <Container>
      <H.h1>{monitor.url}</H.h1>
      {JSON.stringify(monitor)}

    </Container>
  )
}