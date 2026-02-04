import { defineConfig } from "prisma/config";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
