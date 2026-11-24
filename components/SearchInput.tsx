"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/utils";

export const SearchInput: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("topic") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "topic",
          value: searchQuery.trim(),
        });
        router.push(newUrl, { scroll: false });
      } else if (searchParams.has("topic")) {
        const newUrl = removeKeysFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["topic"],
        });
        router.push(newUrl, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, searchParams, pathname]);

  const handleClear = () => {
    setSearchQuery("");
    const newUrl = removeKeysFromUrlQuery({
      params: searchParams.toString(),
      keysToRemove: ["topic"],
    });
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="relative flex items-center w-full sm:w-72 md:w-80 bg-white border border-neutral-200/90 rounded-xl px-3.5 py-2 shadow-2xs focus-within:border-[#FE5933] focus-within:ring-2 focus-within:ring-[#FE5933]/15 transition-all">
      <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2.5" />
      <input
        type="text"
        placeholder="Search tutors or topics..."
        className="w-full text-sm text-[#0F0F10] placeholder:text-neutral-400 bg-transparent outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
