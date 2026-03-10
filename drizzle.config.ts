import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'postgresql',
  schema: './app/db',
  dbCredentials: {
    url: process.env.DATABASE_URL!
    // url: process.env.NODE_ENV === 'development' ? "./data/db.sqlite" : "/data/db.sqlite"
  }
})