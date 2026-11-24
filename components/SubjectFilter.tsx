"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import { subjects } from "@/constants";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const SubjectFilter: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("subject") || "all";

  const [subject, setSubject] = useState(query);

  useEffect(() => {
    let newUrl = "";
    if (!subject || subject === "all") {
      newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["subject"],
      });
    } else {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "subject",
        value: subject,
      });
    }
    router.push(newUrl, { scroll: false });
  }, [subject, router, searchParams]);

  return (
    <div className="w-full sm:w-48">
      <Select onValueChange={setSubject} value={subject}>
        <SelectTrigger className="w-full bg-white border border-neutral-200/90 rounded-xl px-3.5 py-2 text-sm text-[#0F0F10] shadow-2xs hover:border-neutral-300 focus:border-[#FE5933] focus:ring-2 focus:ring-[#FE5933]/15 transition-all capitalize cursor-pointer flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <SelectValue placeholder="All Subjects" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border border-neutral-200 rounded-xl shadow-lg p-1 z-50">
          <SelectItem value="all" className="rounded-lg text-sm cursor-pointer">
            All Subjects
          </SelectItem>
          {subjects.map((sub) => (
            <SelectItem
              key={sub}
              value={sub}
              className="capitalize rounded-lg text-sm cursor-pointer"
            >
              {sub}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SubjectFilter;
