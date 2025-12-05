// src/server/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

const supabaseUrl = env.SUPABASE_URL ?? "https://example.supabase.co";
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-service-role-key";

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
);
