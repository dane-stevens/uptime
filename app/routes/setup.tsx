import { Form, href, redirect, useActionData } from "react-router"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/setup"
import { users } from "~/db/schema"
import { Field, Submit } from "~/components/Forms"
import { Container } from "~/components/Container"
import { parseFormData, validationError } from "~/utils/parse.server"
import z from "zod"

export async function loader({ request }: Route.LoaderArgs) {
  const userCount = await db.$count(users)
  if (userCount > 0) return redirect(href('/'))
  return null
}

export async function action({ request }: Route.ActionArgs) {
  const userCount = await db.$count(users)
  if (userCount > 0) return redirect(href('/'))

  const parsedData = await parseFormData(request, z.object({
    firstName: z.string().min(1).trim(),
    lastName: z.string().min(1).trim(),
    email: z.email().trim()
  }))

  if (!parsedData.success) return validationError(parsedData)
  const data = parsedData.data

  await db.insert(users).values({
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.email
  })

  return redirect(href("/login"))





}

export default function Setup() {
  const { error } = useActionData() || {}
  return (
    <Container as="create">
      {JSON.stringify(error)}
      <Form method="POST">
        <h1 className="text-center text-2xl">Let's setup your account!</h1>
        <div className="grid gap-2">
          <Field name="firstName" label='First Name' />
          <Field name="lastName" label='Last Name' />
          <Field name="email" label='Email' />
          <Submit>Create Account</Submit>
        </div>
      </Form>
    </Container>
  )
}