"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Mic, ArrowRight, Bookmark } from "lucide-react";
import { addBookmark, removeBookmark } from "@/lib/actions/companion.actions";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color?: string;
  voice?: string;
  style?: string;
  bookmarked?: boolean;
}

const SUBJECT_STYLES: Record<
  string,
  { pill: string; iconBg: string; borderHover: string }
> = {
  maths: {
    pill: "bg-amber-50 text-amber-900 border-amber-200/80",
    iconBg: "bg-amber-100/60 border-amber-200",
    borderHover: "hover:border-amber-400/60",
  },
  science: {
    pill: "bg-purple-50 text-purple-900 border-purple-200/80",
    iconBg: "bg-purple-100/60 border-purple-200",
    borderHover: "hover:border-purple-400/60",
  },
  language: {
    pill: "bg-sky-50 text-sky-900 border-sky-200/80",
    iconBg: "bg-sky-100/60 border-sky-200",
    borderHover: "hover:border-sky-400/60",
  },
  coding: {
    pill: "bg-rose-50 text-rose-900 border-rose-200/80",
    iconBg: "bg-rose-100/60 border-rose-200",
    borderHover: "hover:border-rose-400/60",
  },
  history: {
    pill: "bg-orange-50 text-orange-900 border-orange-200/80",
    iconBg: "bg-orange-100/60 border-orange-200",
    borderHover: "hover:border-orange-400/60",
  },
  economics: {
    pill: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
    iconBg: "bg-emerald-100/60 border-emerald-200",
    borderHover: "hover:border-emerald-400/60",
  },
};

const DEFAULT_SUBJECT_STYLE = {
  pill: "bg-neutral-100 text-neutral-800 border-neutral-200",
  iconBg: "bg-neutral-100 border-neutral-200",
  borderHover: "hover:border-[#FE5933]/50",
};

export const CompanionCard: React.FC<CompanionCardProps> = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  voice,
  style,
  bookmarked = false,
}) => {
  const pathname = usePathname();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(bookmarked);
  const [isPending, setIsPending] = useState<boolean>(false);

  const rawSubject = subject?.toLowerCase() || "";
  const styleConfig = SUBJECT_STYLES[rawSubject] || DEFAULT_SUBJECT_STYLE;
  const validSubjects = ["maths", "language", "science", "history", "coding", "economics"];
  const iconSrc = rawSubject && validSubjects.includes(rawSubject)
    ? `/icons/${rawSubject}.svg`
    : "/icons/cap.svg";
  const iconAlt = subject || name || "Subject icon";

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = isBookmarked;
    setIsBookmarked(!previousState);
    setIsPending(true);

    try {
      if (previousState) {
        await removeBookmark(id, pathname);
      } else {
        await addBookmark(id, pathname);
      }
    } catch (err) {
      console.error("Failed to update bookmark:", err);
      // Rollback on error
      setIsBookmarked(previousState);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <article
      className={`group relative bg-white rounded-3xl p-6 border border-neutral-200/90 ${styleConfig.borderHover} shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
    >
      {/* Top Header: Subject Badge + Icon & Bookmark Button */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`size-10 rounded-2xl flex items-center justify-center border ${styleConfig.iconBg} transition-transform group-hover:scale-105 duration-200`}
              style={color ? { backgroundColor: `${color}30` } : undefined}
            >
              <Image
                src={iconSrc}
                alt={iconAlt}
                width={20}
                height={20}
                className="opacity-90"
              />
            </div>
            <span
              className={`font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styleConfig.pill}`}
            >
              {subject}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            disabled={isPending}
            title={isBookmarked ? "Remove from bookmarks" : "Bookmark this tutor"}
            className={`size-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isBookmarked
                ? "bg-amber-50 text-amber-500 border border-amber-200/80 hover:bg-amber-100"
                : "bg-neutral-50 text-neutral-400 border border-neutral-200/70 hover:text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 transition-transform ${
                isBookmarked ? "fill-amber-500 scale-105" : "hover:scale-110"
              }`}
            />
          </button>
        </div>

        {/* Companion Title & Topic */}
        <div className="space-y-1.5 my-2">
          <h2 className="text-xl font-bold text-[#0F0F10] tracking-tight group-hover:text-[#FE5933] transition-colors line-clamp-1">
            {name}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2 min-h-[38px]">
            {topic}
          </p>
        </div>
      </div>

      {/* Footer Meta & Action Button */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-3.5 font-mono">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{duration} min session</span>
          </div>
          {(voice || style) && (
            <span className="capitalize text-neutral-400 text-[11px]">
              {[voice, style].filter(Boolean).join(" • ")}
            </span>
          )}
        </div>

        <Link href={`/companions/${id}`} className="w-full block">
          <button className="w-full py-2.5 px-4 rounded-xl bg-[#0F0F10] text-white font-medium text-sm flex items-center justify-center gap-2 group-hover:bg-[#FE5933] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer">
            <Mic className="w-4 h-4 opacity-80" />
            <span>Launch Lesson</span>
            <ArrowRight className="w-4 h-4 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </article>
  );
};

export default CompanionCard;
