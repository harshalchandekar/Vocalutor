import React from "react";
import CompanionList from "@/components/CompanionList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getBookmarkedCompanions,
  getUserCompanions,
  getUserSessions,
} from "@/lib/actions/companion.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Bookmark,
  History,
  Bot,
  ArrowRight,
} from "lucide-react";

const Profile = async () => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const companions = await getUserCompanions(user.id);
  const sessionHistory = await getUserSessions(user.id);
  const bookmarkedCompanions = await getBookmarkedCompanions(user.id);

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Learner";
  const primaryEmail =
    user.emailAddresses?.[0]?.emailAddress || "Signed-in account";

  return (
    <main className="min-h-screen pb-16 max-w-5xl mx-auto w-full px-4 sm:px-6">
      {/* 1. Header Banner */}
      <section className="pb-6 border-b border-neutral-200/80">
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#E03E1A] uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Learner Profile & History</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F0F10]">
              My Journey
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Review your completed voice lessons, bookmarks, and custom companions.
            </p>
          </div>
          <Link
            href="/companions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-[#0F0F10] hover:bg-[#E03E1A] transition-colors shadow-sm w-fit"
          >
            <span>Explore Tutors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 2. User Identity & Stats Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden border-2 border-neutral-200/80 bg-neutral-100 shrink-0">
            <Image
              src={user.imageUrl || "/icons/cap.svg"}
              alt={fullName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-extrabold text-2xl sm:text-3xl text-[#0F0F10] tracking-tight">
              {fullName}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-neutral-500 mt-0.5">
              {primaryEmail}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active Student
            </span>
          </div>
        </div>

        {/* Metric Chips */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="bg-[#F8F8F7] border border-neutral-200/80 rounded-2xl p-4 min-w-[140px] flex flex-col gap-1 shadow-xs">
            <div className="flex items-center justify-between gap-2 text-[#FE5933]">
              <span className="text-2xl font-black">{sessionHistory.length}</span>
              <div className="size-7 rounded-lg bg-[#FE5933]/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#FE5933]" />
              </div>
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              Lessons Completed
            </span>
          </div>

          <div className="bg-[#F8F8F7] border border-neutral-200/80 rounded-2xl p-4 min-w-[140px] flex flex-col gap-1 shadow-xs">
            <div className="flex items-center justify-between gap-2 text-[#0F0F10]">
              <span className="text-2xl font-black">{companions.length}</span>
              <div className="size-7 rounded-lg bg-neutral-200/70 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-[#0F0F10]" />
              </div>
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              Companions Created
            </span>
          </div>
        </div>
      </section>

      {/* 3. Learning Accordions */}
      <Accordion
        type="multiple"
        defaultValue={["recent", "bookmarks", "companions"]}
        className="space-y-4"
      >
        {/* Bookmarked Companions */}
        <AccordionItem
          value="bookmarks"
          className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs px-6 py-2 overflow-hidden"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
                <Bookmark className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-[#0F0F10]">
                  Bookmarked Companions
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {bookmarkedCompanions.length}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <CompanionList
              companions={bookmarkedCompanions}
              title="Bookmarked Companions"
              hideTitle
            />
          </AccordionContent>
        </AccordionItem>

        {/* Recent Sessions */}
        <AccordionItem
          value="recent"
          className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs px-6 py-2 overflow-hidden"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700">
                <History className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-[#0F0F10]">
                  Recent Sessions
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {sessionHistory.length}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <CompanionList
              companions={sessionHistory}
              title="Recent Sessions"
              hideTitle
            />
          </AccordionContent>
        </AccordionItem>

        {/* My Created Companions */}
        <AccordionItem
          value="companions"
          className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs px-6 py-2 overflow-hidden"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-700">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-[#0F0F10]">
                  My Companions
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {companions.length}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <CompanionList
              companions={companions}
              title="My Companions"
              hideTitle
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
};

export default Profile;
