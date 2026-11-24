import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Recognized plan slugs for Pro / Pro Companion subscriptions.
 * In Clerk Billing, plans can be configured with custom slugs or auto-generated keys.
 */
const PRO_PLAN_SLUGS = [
  "pro",
  "pro_companion",
  "pro-companion",
  "pro_companions",
  "pro-companions",
  "pro_companion_plan",
  "pro-companion-plan",
  "pro_plan",
  "pro-plan",
  "pro_tutor",
  "pro-tutor",
  "unlimited",
  "unlimited_companions",
];

const PRO_FEATURE_SLUGS = [
  "unlimited_companions",
  "pro_companion",
  "pro",
  "pro_features",
  "pro_voice",
  "pro_tier",
];

/**
 * Determines whether the currently authenticated user has an active Pro / Pro Companion subscription.
 * Checks Clerk billing plan entitlements, feature flags, raw JWT session claims (pla / fea),
 * and user metadata fallbacks.
 */
export async function isUserProPlan(): Promise<boolean> {
  try {
    const { userId, has, sessionClaims } = await auth();

    if (!userId) {
      return false;
    }

    // 1. Check Clerk plan entitlements across all known Pro/Pro Companion plan slugs
    if (has) {
      for (const slug of PRO_PLAN_SLUGS) {
        try {
          if (has({ plan: slug })) {
            return true;
          }
        } catch {
          // Ignore and continue checking
        }
      }

      // 2. Check Clerk feature entitlements
      for (const feature of PRO_FEATURE_SLUGS) {
        try {
          if (has({ feature })) {
            return true;
          }
        } catch {
          // Ignore and continue checking
        }
      }
    }

    // 3. Check raw session claims for plans (pla) or features (fea)
    if (sessionClaims) {
      const plaClaim = typeof sessionClaims.pla === "string" ? sessionClaims.pla.toLowerCase() : "";
      if (plaClaim.includes("pro") || plaClaim.includes("companion")) {
        return true;
      }

      const feaClaim = typeof sessionClaims.fea === "string" ? sessionClaims.fea.toLowerCase() : "";
      if (feaClaim.includes("pro") || feaClaim.includes("unlimited")) {
        return true;
      }
    }

    // 4. Fallback check: inspect user public and unsafe metadata from Clerk
    try {
      const user = await currentUser();
      if (user) {
        const publicMeta = (user.publicMetadata || {}) as Record<string, unknown>;
        const unsafeMeta = (user.unsafeMetadata || {}) as Record<string, unknown>;
        const planValue = String(
          publicMeta.plan || unsafeMeta.plan || publicMeta.tier || unsafeMeta.tier || ""
        ).toLowerCase();

        if (planValue.includes("pro") || planValue.includes("companion")) {
          return true;
        }
      }
    } catch (userErr) {
      console.warn("Could not fetch Clerk currentUser metadata fallback:", userErr);
    }
  } catch (error) {
    console.error("Error evaluating user subscription status:", error);
  }

  return false;
}

