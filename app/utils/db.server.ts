import { drizzle } from 'drizzle-orm/libsql/sqlite3'
import * as schema from '~/db/schema'

export const db = drizzle({
  schema: schema,
  connection: {
    url: 'file:./db.sqlite'
  }
})
