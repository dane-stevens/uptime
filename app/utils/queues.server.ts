import { env } from "./env.server";

export const queueName = `${env.NODE_ENV}_monitor-checks`