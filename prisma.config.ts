import 'dotenv/config'; // Add this at the very top
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // env('DATABASE_URL') will now find the variable because of the import above
    url: env('DATABASE_URL'),
  },
});