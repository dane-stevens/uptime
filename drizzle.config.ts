import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'sqlite',
  schema: './app/db',
  dbCredentials: {
    url: process.env.NODE_ENV === 'development' ? "./data/db.sqlite" : "/data/db.sqlite"
  }
})