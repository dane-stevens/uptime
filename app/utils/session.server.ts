import { createCookieSessionStorage, href, redirect } from "react-router";
import { env } from "./env.server";
import { z } from "zod";
import { db } from "./db.server";
import { USER_TYPES, type users } from "~/db/schema";

type SessionData = {
  hId: string;
  userType: typeof users.$inferSelect.userType;
  username: string;
};


type SessionFlashData = {
  error?: string;
  message?: string;
};

export const session = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "__uptime_session__",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secrets: [env.SESSION_SECRET],
    secure: true,
  },
});

const { getSession, commitSession, destroySession } = session;
export { commitSession, destroySession, getSession };

export async function createUserSession(
  request: Request,
  redirectTo = "/",
  data: SessionData,
) {
  const session = await getSession(request.headers.get("Cookie"));
  Object.keys(session?.data)?.map((key) => session.unset(key));

  Object.keys(data).map((key) => session.set(key, data[key]));
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

const UserValidation = z.object({
  hId: z.string(),
  userType: z.enum(USER_TYPES),
  username: z.string(),
});
type ValueOf<Obj> = Obj[keyof Obj];
type Validations = {
  userType?: ValueOf<typeof users.userType.enumValues>[];
};

export async function auth(request: Request, validations?: Validations) {
  const session = await getSession(request.headers.get("Cookie"));

  validations &&
    Object.keys(validations)?.map((validation) => {
      if (validation === "userType") {
        if (!validations[validation].includes(session.get("userType")))
          throw redirect(href('/'));
      }
    });

  const parsed = UserValidation.safeParse(session.data);
  if (!parsed.success) {
    const url = new URL(request.url);
    if (url.pathname?.length > 1) {
      url.searchParams.append("redirectTo", url.pathname);
    }

    throw redirect(href('/login'));
  }

  const url = new URL(request.url);

  const user = await db.query.users.findFirst({
    where: (users, { and, eq }) =>
      and(eq(users.hId, parsed.data.hId), eq(users.isActive, true)),
  });
  if (!user) throw redirect(href('/login'));

  return {
    ...parsed.data,
  };
}

