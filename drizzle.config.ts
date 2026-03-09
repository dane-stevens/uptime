import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'sqlite',
  schema: './app/db',
  dbCredentials: {
    url: "./data/db.sqlite"
  }
})