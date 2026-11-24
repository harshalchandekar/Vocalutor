"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createSupabaseClient } from "../supabase";
import { computeQuota, QuotaCalculation } from "../compute-quota";
import { PLAN_LIMITS, USAGE_GRACE_PERIOD_SECONDS, UserPlan } from "../limits";
import { isUserProPlan } from "../auth-plan";
import { revalidatePath } from "next/cache";

// Input schema for usage reporting with upper boundary protection
const recordUsageSchema = z.object({
  sessionId: z.string().optional(),
  seconds: z
    .number()
    .int()
    .min(0, "Seconds cannot be negative")
    .max(
      PLAN_LIMITS.pro.maxSessionSeconds + USAGE_GRACE_PERIOD_SECONDS,
      "Reported call duration exceeds maximum allowed session threshold"
    ),
});

export interface VoiceQuotaResponse extends QuotaCalculation {
  resetsAtFormatted?: string;
  error?: string;
}

/**
 * Determines whether the user has a Pro subscription plan via Clerk entitlements,
 * plan slugs, session claims, or user metadata.
 */
export async function getUserPlan(): Promise<UserPlan> {
  const isPro = await isUserProPlan();
  if (isPro) {
    return "pro";
  }
  return "free";
}

/**
 * Fetches the user's voice usage over the rolling 24-hour window and calculates remaining quota.
 */
export async function getVoiceQuota(): Promise<VoiceQuotaResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ...computeQuota("free", 0),
      allowed: false,
      error: "Authentication required",
    };
  }

  const plan = await getUserPlan();
  const supabase = createSupabaseClient();

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Sum total seconds in the last 24 hours
  const { data, error } = await supabase
    .from("voice_usage")
    .select("seconds, created_at")
    .eq("user_id", userId)
    .gte("created_at", twentyFourHoursAgo)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch voice usage:", error.message);
    // Graceful fallback to default tier quota on transient database errors
    return computeQuota(plan, 0);
  }

  const totalUsedSeconds = (data || []).reduce(
    (sum: number, row: { seconds: number }) => sum + (row.seconds || 0),
    0
  );

  const quota = computeQuota(plan, totalUsedSeconds);

  // Compute earliest expiration in the rolling window for user feedback
  let resetsAtFormatted = "in 24 hours";
  if (data && data.length > 0 && quota.remainingSeconds < quota.dailySeconds) {
    const oldestSessionDate = new Date(data[0].created_at);
    const resetTime = new Date(oldestSessionDate.getTime() + 24 * 60 * 60 * 1000);
    const msUntilReset = Math.max(0, resetTime.getTime() - Date.now());
    const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutes = Math.ceil((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      resetsAtFormatted = `in ~${hours}h ${minutes}m`;
    } else {
      resetsAtFormatted = `in ~${minutes}m`;
    }
  }

  return {
    ...quota,
    resetsAtFormatted,
  };
}

/**
 * Records completed voice session duration in Supabase.
 * Validates duration with Zod before database persistence.
 */
export async function recordVoiceUsage(input: {
  sessionId?: string;
  seconds: number;
  path?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: Please sign in to record voice usage.");
  }

  // Validate with Zod
  const validation = recordUsageSchema.safeParse({
    sessionId: input.sessionId,
    seconds: input.seconds,
  });

  if (!validation.success) {
    const issue = validation.error.issues[0]?.message || "Invalid usage payload";
    throw new Error(`Validation error: ${issue}`);
  }

  const { sessionId, seconds } = validation.data;

  // Skip recording zero-second abortive clicks
  if (seconds <= 0) {
    return { success: true, recordedSeconds: 0 };
  }

  const supabase = createSupabaseClient();
  let { data, error } = await supabase.from("voice_usage").insert({
    user_id: userId,
    session_id: sessionId || null,
    seconds,
  });

  // If a foreign key constraint violation occurs on session_id, retry with session_id: null
  if (error && (error.code === "23503" || error.message?.includes("foreign key constraint"))) {
    console.warn("FK constraint violation on voice_usage.session_id. Retrying with session_id: null");
    const retry = await supabase.from("voice_usage").insert({
      user_id: userId,
      session_id: null,
      seconds,
    });
    error = retry.error;
    data = retry.data;
  }

  if (error) {
    console.error("Failed to insert voice_usage record:", error.message);
    throw new Error(error.message);
  }

  if (input.path) {
    revalidatePath(input.path);
  }
  revalidatePath("/companions");
  revalidatePath("/my-journey");

  return { success: true, data };
}
