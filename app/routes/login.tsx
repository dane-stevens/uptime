import type { Route } from "./+types/login";
import { Form, href, redirect, useSearchParams } from "react-router";
import { db } from "~/utils/db.server";
import { users } from "~/db/schema";
import { Field, Submit } from "~/components/Forms";
import { Container } from "~/components/Container";
import { parseFormData, validationError } from "~/utils/parse.server";
import z, { ZodError } from "zod";
import { generateCode } from "~/utils/auth.server";
import { eq } from "drizzle-orm";
import * as argon2 from "argon2";
import { addMinutes, isAfter } from 'date-fns'
import { sendEmail } from "~/utils/email.server";
import { createUserSession } from "~/utils/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userCount = await db.$count(users)

  if (userCount < 1) return redirect(href('/setup'))

  const url = new URL(request.url)
  const username = url.searchParams?.get('username')



  return {
    state: username ? 'CODE' : 'USERNAME'
  }
}

export async function action({ request }: Route.ActionArgs) {
  const parsedData = await parseFormData(request, z.discriminatedUnion('_action', [
    z.object({
      _action: z.literal('USERNAME'),
      username: z.string()
    }),
    z.object({
      _action: z.literal('CODE'),
      user_hId: z.string(),
      code: z.string()
    })


  ]))

  if (!parsedData.success) return validationError(parsedData)

  const data = parsedData.data

  if (data._action === 'USERNAME') {

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, data.username),
      orderBy: (users, { asc }) => asc(users.id)
    });

    if (!user) {
      const errors = new ZodError([
        { code: 'custom', message: 'Sorry, that user does not exist.', path: ['username'] }
      ])
      return {
        state: 'USERNAME',
        errors: z.treeifyError(errors)
      }
    }

    const authCode = await generateCode()
    const loginCodeHash = await argon2.hash(authCode);
    const loginCodeExpires = addMinutes(new Date(), 15);

    await db.update(users).set({
      loginCodeHash,
      loginCodeExpires,
    }).where(eq(users.username, data.username))

    await sendEmail({
      from: `auth`,
      to: [data.username],
      subject: 'Login',
      html: `
Your login code: ${authCode}
      `
    })

    return {
      state: 'CODE',
      user_hId: user.hId
    }

  }

  if (data._action == 'CODE') {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.hId, data.user_hId),
    });

    if (!user) {
      return {
        state: 'USERNAME',
        errors: z.treeifyError(new ZodError([
          {
            code: "custom",
            message: "Sorry, that user does not exist.",
            path: ["username"],
          },
        ]))
      };
    }

    const isExpired = isAfter(
      new Date(),
      new Date(String(user?.loginCodeExpires)),
    );
    if (isExpired) {
      return {
        state: 'USERNAME',
        errors: z.treeifyError(new ZodError([
          {
            code: "custom",
            message: "Sorry, your login code has expired.",
            path: ["code"],
          },
        ])),
      };
    }

    const isValidCode = await argon2.verify(
      String(user.loginCodeHash),
      data.code,
    );
    if (!isValidCode) {
      return {
        state: 'CODE',
        errors: z.treeifyError(new ZodError([
          {
            code: "custom",
            message: "Sorry, your login code is invalid.",
            path: ["code"],
          },
        ])),
      };
    }

    await db.update(users).set({ loginCodeHash: null, loginCodeExpires: null }).where(eq(users.hId, data.user_hId))

    return createUserSession(request, href('/'), {
      hId: user.hId,
      username: user.username,
      userType: user.userType
    })


  }

  return null

}

export default function Login(props: Route.ComponentProps) {
  const { state, user_hId } = props.actionData || props.loaderData
  return (
    <Container as="create">
      {
        state === 'CODE' ? (
          <Form method="POST">
            <input type='hidden' name='_action' value='CODE' />
            <input type='hidden' name='user_hId' value={user_hId} />
            <div className="grid gap-2">
              <Field name="code" label="Access Code" type='numeric' />
              <Submit>Log in</Submit>
            </div>
          </Form>
        ) : (
          <Form method="POST">
            <input type='hidden' name='_action' value='USERNAME' />
            <div className="grid gap-2">
              <Field name="username" label="Username" type='email' />
              <Submit>Log in</Submit>
            </div>
          </Form>
        )
      }
    </Container>
  )
}