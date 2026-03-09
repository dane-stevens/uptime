
import { env } from "./env.server";
import { singleton } from "./singleton.server";
import { createClient, RESP_TYPES } from "redis";

export const redis = singleton("redis-railway", () => {
  const client = createClient({
    url: env.REDIS_URL,
  })
    .withTypeMapping({
      [RESP_TYPES.BLOB_STRING]: Buffer,
    })
    .on("error", (err) => console.log("[REDIS_RAILWAY]:", err))
    .on("connect", (res) => console.log("[REDIS_CONNECT]:", res));
  client.connect();
  return client;
});
