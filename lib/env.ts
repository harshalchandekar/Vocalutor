/**
 * Validates critical environment variables at application initialization.
 * Fails fast with clear diagnostics rather than failing cryptically at runtime.
 */

const requiredServerEnv = [
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_VAPI_WEB_TOKEN",
] as const;

export function validateEnvironment(): void {
  // Only run in server environments (Node.js runtime)
  if (typeof window !== "undefined") return;

  const missing: string[] = [];

  for (const envVar of requiredServerEnv) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `[FATAL] Missing required environment variables:\n  - ${missing.join("\n  - ")}\nPlease verify your .env.local file or production deployment configuration.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

// Auto-run validation upon server module import
validateEnvironment();
