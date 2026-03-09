import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from '@paralleldrive/cuid2'

export const USER_TYPES = [
  'OWNER',
  'MANAGER'
] as const

export const users = sqliteTable('users', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  hId: text().unique().notNull().$defaultFn(() => `usr_${createId()}`),
  username: text().unique().notNull(),
  userType: text({ enum: USER_TYPES }).default('OWNER'),
  firstName: text(),
  lastName: text(),
  loginCodeHash: text(),
  loginCodeExpires: integer({ mode: 'timestamp_ms' }),
  isActive: integer({ mode: 'boolean' }).default(true).notNull(),
})

export const monitors = sqliteTable('monitors', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  hId: text().unique().notNull().$defaultFn(() => `mon_${createId()}`),
  url: text(),
  interval: integer({ mode: 'number' }).notNull().default(300),
  isActive: integer({ mode: 'boolean' }).default(true).notNull(),
})

export const monitorLogs = sqliteTable('monitorLogs', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  monitorId: integer({ mode: 'number' }).notNull(),
  statusCode: integer({ mode: 'number' }).notNull(),
  responseTime: integer({ mode: 'number' }).notNull(),
  createdAt: integer({ mode: 'timestamp_ms' })
})