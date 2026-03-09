import { drizzle } from 'drizzle-orm/libsql/sqlite3'
import * as schema from '~/db/schema'
import { env } from './env.server'

export const db = drizzle({
  schema: schema,
  connection: {
    url: env.NODE_ENV === 'development' ? 'file:./data/db.sqlite' : 'file:/data/db.sqlite'
  }
})
