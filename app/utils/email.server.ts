import { Resend, type CreateEmailOptions } from "resend"
import { env } from "./env.server";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async ({
  from,
  to,
  subject,
  html,
  attachments,
  replyTo
}: CreateEmailOptions) => {

  const res = await resend.emails.send({
    from: `${from}@${env.EMAIL_DOMAIN}`,
    to,
    subject,
    html,
    text: "",
    attachments,
    replyTo
  });

  const { data, error } = res;

  if (error) {
    console.error({ error });
  }
  if (data) {
    console.log({ data });
  }

  return res;
};
