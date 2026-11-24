import React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Plus, Sparkles } from "lucide-react";
import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import {
  getAllCompanions,
  getUserBookmarkIds,
} from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";

interface CompanionRecord {
  id: string;
  name: string;
  subject: string;
  topic: string;
  duration: number;
  voice?: string;
  style?: string;
  author?: string;
}

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
  const filters = await searchParams;
  const subject = typeof filters.subject === "string" ? filters.subject : "";
  const topic = typeof filters.topic === "string" ? filters.topic : "";

  // 1. Fetch companions matching search and filter parameters (newest first, limit 50)
  const companions: CompanionRecord[] = await getAllCompanions({
    subject: subject === "all" ? "" : subject,
    topic,
    limit: 50,
  });

  // 2. Fetch authenticated user's bookmarked companion IDs
  const { userId } = await auth();
  const bookmarkedIds: string[] = userId
    ? await getUserBookmarkIds(userId)
    : [];

  const isFiltering = Boolean((subject && subject !== "all") || topic);

  return (
    <main className="min-h-screen pb-16">
      {/* 1. Header & Primary Action */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200/80">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#E03E1A] uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E03E1A]" />
            <span>AI TUTORS DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F0F10] tracking-tight">
            Tutors Library
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-xl">
            Choose an AI voice companion to start learning out loud, or build a personalized tutor customized to your syllabus.
          </p>
        </div>

        <Link href="/companions/new" className="shrink-0">
          <button className="inline-flex items-center gap-2 bg-[#FE5933] hover:bg-[#E03E1A] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Create Companion</span>
          </button>
        </Link>
      </section>

      {/* 2. Search & Filter Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput />
          <SubjectFilter />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono text-neutral-500">
          <span>
            {companions.length} {companions.length === 1 ? "tutor" : "tutors"} available
          </span>
          {isFiltering && (
            <Link
              href="/companions"
              className="text-[#FE5933] hover:underline font-semibold"
            >
              Reset filters
            </Link>
          )}
        </div>
      </section>

      {/* 3. Companions Grid */}
      {companions.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pt-2">
          {companions.map((companion) => (
            <CompanionCard
              key={companion.id}
              id={companion.id}
              name={companion.name}
              topic={companion.topic}
              subject={companion.subject}
              duration={companion.duration || 15}
              voice={companion.voice}
              style={companion.style}
              color={getSubjectColor(companion.subject)}
              bookmarked={bookmarkedIds.includes(companion.id)}
            />
          ))}
        </section>
      ) : (
        /* Empty State */
        <section className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white rounded-3xl border border-neutral-200/80 shadow-xs my-6">
          <div className="size-14 rounded-2xl bg-[#FE5933]/10 text-[#FE5933] flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#0F0F10] tracking-tight mb-1">
            No companions found
          </h2>
          <p className="text-sm text-neutral-600 max-w-md mb-6">
            We couldn&apos;t find any AI tutors matching your criteria. Try adjusting your search query, or build a custom companion.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isFiltering && (
              <Link
                href="/companions"
                className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Clear Filters
              </Link>
            )}
            <Link
              href="/companions/new"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0F0F10] hover:bg-[#FE5933] rounded-xl transition-colors"
            >
              Build Custom Tutor
            </Link>
          </div>
        </section>
      )}
    </main>
  );
};

export default CompanionsLibrary;
