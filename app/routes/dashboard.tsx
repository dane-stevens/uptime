import { auth } from "~/utils/session.server";
import type { Route } from "./+types/dashboard";
import { Container } from "~/components/Container";
import { H } from "~/components/Headings";
import { Form, href, Link, useFetcher } from "react-router";
import { Field, Submit } from "~/components/Forms";
import { parseFormData, validationError } from "~/utils/parse.server";
import z from "zod";
import { db } from "~/utils/db.server";
import { monitors } from "~/db/schema";
import { useEffect } from "react";
import { useInterval } from "~/hooks/interval";
import { loadMonitors } from "~/monitors";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];

}

export async function loader({ request }: Route.LoaderArgs) {
  await auth(request)
  await loadMonitors()
  const monitors = await db.query.monitors.findMany()
  return { monitors }
}

export async function action({ request }: Route.ActionArgs) {
  const parsedData = await parseFormData(request, z.object({ url: z.url() }))

  if (!parsedData.success) return validationError(parsedData)

  const data = parsedData.data

  await db.insert(monitors).values({
    url: data.url,
    interval: 60
  })
  loadMonitors()
  return null
}

export default function Home(props: Route.ComponentProps) {
  const { monitors } = props.loaderData
  return (
    <Container>
      <H.h1>Dashboard</H.h1 >
      <Form method="POST">
        <Field name='url' label="URL" />
        <Submit>Add Monitor</Submit>
      </Form>
      <div className="grid gap-4 mt-8">
        {
          monitors?.map((monitor) => {
            return (
              <Monitor key={monitor.id} monitor={monitor} />
            )
          })
        }</div>
    </Container >
  )
}

function Monitor({ monitor }) {
  const fetcher = useFetcher()
  useInterval(() => {
    fetcher.load(`/monitorStats/${monitor.id}`)
  }, 5000)
  console.log(fetcher.data)
  return (
    <Link to={href("/monitor/:monitor_hId", { monitor_hId: monitor.hId })} className="border rounded-lg px-4 py-2 grid grid-cols-3">
      <CardSection title="URL">
        {monitor.url}
      </CardSection>
      <CardSection title="Status Code" right>
        {fetcher?.data?.logs?.statusCode || '---'}
      </CardSection>
      <CardSection title="Response Time" right>
        {fetcher?.data?.logs ? <>{Math.round(fetcher?.data?.logs?.responseTime)}</> : '---'}ms
      </CardSection>
    </Link>
  )
}

function CardSection({ title, children, right }) {
  return (
    <div className={`${right ? 'text-right' : ''}`}>
      <div className="text-xs">{title}</div>
      <div>{children}</div>
    </div>
  )
}
