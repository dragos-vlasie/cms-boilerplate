import { webcrypto } from "node:crypto";
import "@testing-library/jest-dom";

// Provide a crypto implementation for tests that rely on randomUUID.
if (!global.crypto) {
  Object.defineProperty(global, "crypto", { value: webcrypto });
}

process.env.AUTH_SECRET ??= "test-secret";
process.env.AUTH_DISCORD_ID ??= "discord-id";
process.env.AUTH_DISCORD_SECRET ??= "discord-secret";
process.env.DATABASE_URL ??= "file:./dev.db";
process.env.SUPABASE_URL ??= "http://localhost:54321";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "supabase-key";
process.env.SUPABASE_STORAGE_BUCKET ??= "supabase-bucket";
process.env.SKIP_ENV_VALIDATION = "1";
