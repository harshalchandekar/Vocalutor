"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { SUBJECTS_CONFIG } from './data';
import Hero3DScene from './Hero3DScene';

export const HeroSection: React.FC<{
  activeSubject: string;
  onSelectSubject: (subjectId: string) => void;
  onOpenDemo?: (subjectId?: string) => void;
  isSpeaking: boolean;
}> = ({ activeSubject, onSelectSubject, isSpeaking }) => {
  const activeSubjectObj = SUBJECTS_CONFIG.find((s) => s.id === activeSubject) || SUBJECTS_CONFIG[0];

  return (
    <section className="relative w-full overflow-hidden bg-[#F8F8F7] py-10 sm:py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200/90 text-xs font-mono text-neutral-600 mb-5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#E03E1A]" />
              <span className="tracking-wide">AI VOICE TUTOR SYSTEM</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500 font-semibold">6 CORE SUBJECTS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0F0F10] leading-[1.08] mb-5">
              <span className="block drop-shadow-xs">LEARN BY TALKING.</span>
              <span className="block text-neutral-400">NOT BY READING.</span>
            </h1>

            <div className="flex items-center gap-2 text-sm font-mono tracking-wider text-neutral-500 mb-8">
              <span>Speak</span>
              <span className="text-neutral-300">→</span>
              <span>Learn</span>
              <span className="text-neutral-300">→</span>
              <span>Succeed</span>
            </div>

            <p className="text-base sm:text-lg text-neutral-600 mb-8 leading-relaxed max-w-xl">
              Pick a subject, start a voice session and let an AI tutor guide you through real-time conversation — across 6 subjects.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 mb-7 w-full sm:w-auto">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#E03E1A] hover:bg-[#c73413] rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Start for Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/companions"
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#E03E1A] hover:bg-[#c73413] rounded-xl transition-colors cursor-pointer"
                >
                  <span>Go to Tutor Library</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedIn>

              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 transition-colors cursor-pointer"
              >
                <span>How It Works</span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </a>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-100 text-sm font-mono text-neutral-600 mb-6">
              <span className="text-neutral-500">Now studying:</span>
              <span className="font-semibold text-[#0F0F10]">{activeSubjectObj.name}</span>
            </div>
          </div>

          <div className="lg:col-span-6 relative w-full h-[460px] sm:h-[520px] lg:h-[580px] flex items-center justify-center">
            <Hero3DScene activeSubject={activeSubject} onSelectSubject={onSelectSubject} isSpeaking={isSpeaking} />
          </div>
        </div>
      </div>

      <div className="lg:hidden w-full max-w-7xl mx-auto px-4 mt-6 pt-4 border-t border-neutral-200/60">
        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-2.5">
          Tap to Focus Subject:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
          {SUBJECTS_CONFIG.map((sub) => {
            const isActive = sub.id === activeSubject;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubject(sub.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all border cursor-pointer ${
                  isActive ? 'bg-[#0F0F10] text-white border-[#0F0F10]' : 'bg-white/90 text-neutral-700 border-neutral-200'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
