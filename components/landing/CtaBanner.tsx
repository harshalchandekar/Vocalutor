"use client";

import React from 'react';
import { Volume2, ArrowUpRight } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

export const CtaBanner: React.FC<{
  onOpenDemo: () => void;
}> = ({ onOpenDemo }) => {
  return (
    <section className="py-12 sm:py-20 bg-[#F8F8F7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-6 sm:p-12 bg-gradient-to-br from-[#18181A] via-[#101012] to-[#141416] text-white overflow-hidden shadow-2xl border border-white/10">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E03E1A] text-xs font-mono tracking-widest uppercase mb-3 sm:mb-4 border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E03E1A]" />
                <span>START TODAY</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3">
                Talk your way to the top of the class.
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-xl">
                Experience real-time interactive Socratic dialogue with your private AI tutor across all 6 core subjects.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenDemo}
                className="px-5 py-3 rounded-xl text-xs font-mono font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-[#E03E1A]" />
                <span>Try Voice Demo</span>
              </button>

              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl text-xs font-mono font-bold text-[#0F0F10] bg-white hover:bg-[#E03E1A] hover:text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg group cursor-pointer"
                >
                  <span>Start for Free</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
