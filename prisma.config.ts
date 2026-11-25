import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    // eslint-disable-next-line no-process-env
    url: process.env.DATABASE_URL,
  },
});
