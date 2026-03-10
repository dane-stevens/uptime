import { auth } from "~/utils/session.server";
import type { Route } from "./+types/monitor";
import { db } from "~/utils/db.server";
import { Container } from "~/components/Container";
import { H } from "~/components/Headings";
import { Form } from "react-router";
import { Field } from "~/components/Forms";

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
      <Form method="POST">
        <Field name='url' label="URL" defaultValue={monitor.url} />
        <Field name='interval' type='select' label="Interval" defaultValue={monitor.interval} options={[
          ['60', '1 Minute'],
          ['180', '3 Minutes'],
          ['300', '5 Minutes'],
          ['1800', '30 Minutes'],
          ['3600', '60 Minutes'],
        ]} />
      </Form>

    </Container>
  )
}