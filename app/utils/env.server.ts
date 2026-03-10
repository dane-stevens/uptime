import { z } from "zod";

export const ENV = z.object({
	NODE_ENV: z.union([z.literal('development'), z.literal('test'), z.literal('production')]),
	SESSION_SECRET: z.string(),
	REDIS_URL: z.string(),
	DATABASE_URL: z.string(),
	EMAIL_DOMAIN: z.string(),
	RESEND_API_KEY: z.string().startsWith("re_"),
	RAILWAY_REPLICA_REGION: z.union([
		z.literal('us-west2'),
		z.literal('us-east4-eqdc4a'),
		z.literal('europe-west4-drams3a'),
		z.literal('asia-southeast1-eqsg3a')
	])
});
export type ENV = z.infer<typeof ENV>;
export const env = ENV.parse(process.env);
