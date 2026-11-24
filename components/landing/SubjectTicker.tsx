"use client";

import React from 'react';
import { SUBJECT_LIST } from './data';

export const SubjectTicker: React.FC<{
  onSelectSubject: (subId: string) => void;
  activeSubject: string;
}> = ({ onSelectSubject, activeSubject }) => {
  return (
    <section className="w-full border-y border-neutral-200/80 bg-white/70 backdrop-blur-sm py-4 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none text-xs font-mono text-neutral-600">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest shrink-0 pr-2">
            All Subjects:
          </span>
          {SUBJECT_LIST.map((sub) => {
            const isCurrent = sub.id === activeSubject;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubject(sub.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0F0F10] text-white border-[#0F0F10] shadow-xs'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#E03E1A]' : 'bg-neutral-300'}`} />
                <span className="font-semibold">{sub.name}</span>
                <span className="text-[10px] opacity-60 font-normal">({sub.stat.split(',')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubjectTicker;
