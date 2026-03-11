import { createId } from '@paralleldrive/cuid2'
import { pgTable, integer, bigserial, serial, timestamp, boolean, varchar, decimal, json } from "drizzle-orm/pg-core";

export const USER_TYPES = [
  'OWNER',
  'MANAGER'
] as const

export const users = pgTable('users', {
  id: serial().primaryKey(),
  hId: varchar({ length: 40 }).unique().notNull().$defaultFn(() => `usr_${createId()}`),
  username: varchar({ length: 255 }).unique(),
  userType: varchar({ length: 50, enum: USER_TYPES }).default('OWNER'),
  firstName: varchar({ length: 100 }),
  lastName: varchar({ length: 100 }),
  loginCodeHash: varchar({ length: 255 }),
  loginCodeExpires: timestamp({ withTimezone: true, precision: 6 }),
  isActive: boolean().default(true)
})

export const monitors = pgTable('monitors', {
  id: serial().primaryKey(),
  hId: varchar({ length: 40 }).unique().notNull().$defaultFn(() => `mon_${createId()}`),
  url: varchar({ length: 255 }),
  interval: integer().default(300),
  isActive: boolean().default(true),
  regions: json().$type<string[]>().default([]),
  failureQuorum: integer().default(2),
  successQuorum: integer().default(2)
})

export const monitorLogs = pgTable('monitorLogs', {
  id: serial().primaryKey(),
  monitorId: serial().notNull(),
  statusCode: integer(),
  responseTimeDNS: decimal({ precision: 8, scale: 4 }),
  responseTimeTCP: decimal({ precision: 8, scale: 4 }),
  responseTimeTLS: decimal({ precision: 8, scale: 4 }),
  responseTimeFirstByte: decimal({ precision: 8, scale: 4 }),
  responseTime: decimal({ precision: 8, scale: 4 }),
  region: varchar({ length: 50 }),
  createdAt: timestamp({ withTimezone: true, precision: 6 }),
})