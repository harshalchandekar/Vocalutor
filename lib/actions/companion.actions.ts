'use server'

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createSupabaseClient } from "../supabase";
import { revalidatePath } from "next/cache";
import { isUserProPlan } from "../auth-plan";

const createCompanionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  subject: z.enum(["maths", "science", "language", "coding", "history", "economics"], {
    message: "Invalid subject",
  }),
  topic: z.string().trim().min(1, "Topic is required").max(300, "Topic cannot exceed 300 characters"),
  voice: z.enum(["male", "female"], { message: "Invalid voice selection" }),
  style: z.enum(["formal", "casual"], { message: "Invalid style selection" }),
  duration: z.number().int().min(1, "Duration must be at least 1 minute").max(120, "Duration cannot exceed 120 minutes"),
});

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    if (!author) {
        throw new Error("Unauthorized: Please sign in to create a companion.");
    }

    // Server-side tier quota enforcement
    const canCreate = await newCompanionPermissions();
    if (!canCreate) {
        throw new Error("Companion limit reached. Upgrade to Pro for unlimited companion creation.");
    }

    // Server-side strict Zod schema validation
    const parsed = createCompanionSchema.safeParse(formData);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Invalid companion input provided.";
        throw new Error(`Validation Error: ${errorMsg}`);
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({ ...parsed.data, author })
        .select();

    if (error || !data) throw new Error(error?.message || 'Failed to create a companion');

    revalidatePath('/companions');
    revalidatePath('/my-journey');
    revalidatePath('/');

    return data[0];
}

export const getAllCompanions = async({limit = 50, page = 1, subject, topic}: GetAllCompanions) => {
    const supabase = createSupabaseClient();

    // Sanitize search inputs to prevent PostgREST filter string injection
    const cleanSubject = typeof subject === "string" ? subject.replace(/[,()]/g, "").trim() : "";
    const cleanTopic = typeof topic === "string" ? topic.replace(/[,()]/g, "").trim() : "";

    let query = supabase.from('companions').select();

    if (cleanSubject && cleanTopic) {
        query = query.ilike('subject', `%${cleanSubject}%`)
                .or(`topic.ilike.%${cleanTopic}%,name.ilike.%${cleanTopic}%`);
    } else if (cleanSubject) {
        query = query.ilike('subject', `%${cleanSubject}%`);
    } else if (cleanTopic) {
        query = query.or(`topic.ilike.%${cleanTopic}%,name.ilike.%${cleanTopic}%`);
    }

    // Order by created_at descending so newly created companions appear first
    query = query.order('created_at', { ascending: false });

    query = query.range((page - 1) * limit, page * limit - 1);

    const {data : companions,error} = await query;

    if(error) throw new Error(error.message);

    return companions;
}

export const getCompanion = async(id:string) =>{
    const supabase = createSupabaseClient();

    const{data, error} = await supabase
    .from('companions')
    .select()
    .eq('id', id);

    if(error) throw new Error(error.message);

    return data[0];
}

export const addToSessionHistory = async(companionId:string) => {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized: Sign in required to save session.");
    }
    const cleanCompanionId = companionId?.trim();
    if (!cleanCompanionId) {
        throw new Error("Invalid companion ID.");
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: cleanCompanionId,
            user_id: userId,
        })
        .select();

    if(error) throw new Error(error.message);

    return data?.[0] || null;
}

export const getRecentSessions = async(limit = 10) => {
    const supabase = createSupabaseClient();
    const {data, error} = await supabase
    .from('session_history')
    .select(`id, created_at, companions:companion_id(*)`)
    .order('created_at', {ascending: false})
    .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({id, created_at, companions}) => {
        const comp = (Array.isArray(companions) ? companions[0] : companions) || {};
        return {
            id: comp.id || "",
            name: comp.name || "Tutor Session",
            subject: comp.subject || "general",
            topic: comp.topic || "Completed Session",
            duration: comp.duration || 15,
            ...comp,
            sessionId: id,
            sessionCreatedAt: created_at,
        };
    });
}

export const getUserSessions = async(userId:string, limit = 10) => {
    try {
        const supabase = createSupabaseClient();
        const {data, error} = await supabase
        .from('session_history')
        .select(`id, created_at, companions:companion_id(*)`)
        .eq('user_id', userId)
        .order('created_at', {ascending: false})
        .limit(limit);

        if(error) {
            console.error("Error fetching user sessions:", error.message);
            return [];
        }

        if(!data) return [];

        return data.map(({id, created_at, companions}) => {
            const comp = (Array.isArray(companions) ? companions[0] : companions) || {};
            return {
                id: comp.id || "",
                name: comp.name || "Tutor Session",
                subject: comp.subject || "general",
                topic: comp.topic || "Completed Session",
                duration: comp.duration || 15,
                ...comp,
                sessionId: id,
                sessionCreatedAt: created_at,
            };
        });
    } catch (err) {
        console.error("Failed to retrieve user sessions:", err);
        return [];
    }
}

export const getUserCompanions = async(userId:string) => {
    try {
        const supabase = createSupabaseClient();
        const {data, error} = await supabase
        .from('companions')
        .select()
        .eq('author', userId);

        if(error) {
            console.error("Error fetching user companions:", error.message);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error("Failed to retrieve user companions:", err);
        return [];
    }
}

export const newCompanionPermissions = async() => {
    const {userId, has} = await auth();
    if (!userId) return false;

    // Pro / Pro Companion users: unlimited companion creation
    const isPro = await isUserProPlan();
    if (isPro) {
        return true;
    }

    const supabase = createSupabaseClient();

    // Determine tier limit for free/standard users
    let limit = 3; // Default free tier: 3 companions

    if (has) {
        if (has({feature: "3_companions_limit"})) {
            limit = 3;
        } else if (has({feature: "10_companions_limit"})) {
            limit = 10;
        }
    }

    // Count user's existing companions
    try {
        const {data, error} = await supabase
            .from('companions')
            .select('id', {count: 'exact'})
            .eq('author', userId);

        if (error) {
            console.error("Error querying user companions count:", error.message);
            // If Supabase encounters an RLS/read issue, don't lock the user out
            return true;
        }

        const companionCount = data?.length || 0;

        // Allow creation if under limit
        return companionCount < limit;
    } catch (err) {
        console.error("Supabase companion count check failed:", err);
        return true;
    }
}
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};
export const getBookmarkedCompanions = async(userId:string) => {
    try {
        const supabase = createSupabaseClient();
        const {data, error} = await supabase
            .from('bookmarks')
            .select(`id, companions:companion_id(*)`)
            .eq('user_id', userId);

        if (error) {
            console.error("Error fetching bookmarked companions:", error.message);
            return [];
        }

        if (!data) return [];

        return data.map(({id, companions}) => {
            const comp = (Array.isArray(companions) ? companions[0] : companions) || {};
            return {
                id: comp.id || "",
                name: comp.name || "Bookmarked Tutor",
                subject: comp.subject || "general",
                topic: comp.topic || "Discussion",
                duration: comp.duration || 15,
                ...comp,
                bookmarkId: id,
            };
        }).filter((c) => Boolean(c.id));
    } catch (err) {
        console.error("Failed to retrieve bookmarked companions:", err);
        return [];
    }
}

export const getUserBookmarkIds = async (userId: string): Promise<string[]> => {
    try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
            .from('bookmarks')
            .select('companion_id')
            .eq('user_id', userId);

        if (error || !data) return [];
        return data.map((b: { companion_id: string }) => b.companion_id);
    } catch {
        return [];
    }
}