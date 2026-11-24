"use client";

import React, { useState } from 'react';
import { STEPS_DATA } from './data';

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const currentStepIndex = hoveredStep !== null ? hoveredStep : activeStep;

  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative bg-[#F4F4F2] border-y border-neutral-200/80 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#E03E1A] uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E03E1A]" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F0F10] tracking-tight leading-[1.08] mb-4">
            Three steps to <br className="hidden sm:inline" />
            <span className="text-neutral-400 font-extrabold">start learning out loud.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
            No pre-recorded videos or static lecture slides. Just interactive conversation with an AI tutor that listens, explains, and deepens your understanding through natural spoken dialogue.
          </p>
        </div>

        {/* Horizontal Cards Full-Width Stack */}
        <div className="max-w-5xl space-y-4">
          {STEPS_DATA.map((item, index) => {
            const isSelected = currentStepIndex === index;

            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(index)}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`group relative cursor-pointer rounded-3xl p-6 sm:p-7 transition-all duration-300 border overflow-hidden select-none ${
                  isSelected
                    ? 'bg-white shadow-xl border-[#E03E1A]/40 -translate-y-0.5'
                    : 'bg-white/70 hover:bg-white/90 border-neutral-200/80 shadow-2xs translate-y-0'
                }`}
              >
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all duration-300 ${
                    isSelected ? 'bg-[#E03E1A] opacity-100' : 'opacity-0'
                  }`}
                />

                <div className="flex items-start gap-5 sm:gap-7">
                  {/* Left: Step number + audio equalizer indicator */}
                  <div className="shrink-0 flex flex-col items-center pt-0.5">
                    <span
                      className={`font-mono text-2xl sm:text-3xl font-black tracking-tight transition-all duration-200 ${
                        isSelected ? 'text-[#E03E1A] scale-105' : 'text-neutral-400'
                      }`}
                    >
                      {item.step}
                    </span>

                    <div className="flex items-end gap-1 h-5 mt-2.5">
                      {[1, 2, 3, 4].map((bar) => {
                        const barHeight = isSelected
                          ? Math.sin(bar * 1.5 + (hoveredStep !== null ? 4 : 1)) * 6 + 10
                          : 4;
                        return (
                          <span
                            key={bar}
                            style={{ height: `${barHeight}px` }}
                            className={`w-1 rounded-full transition-all duration-200 ${
                              isSelected ? 'bg-[#E03E1A]' : 'bg-neutral-300'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Step details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold text-[#0F0F10] tracking-tight">
                        {item.title}
                      </h3>
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition-all ${
                          isSelected
                            ? 'text-[#E03E1A] bg-[#E03E1A]/10 border-[#E03E1A]/25'
                            : 'text-neutral-400 bg-neutral-50 border-neutral-200/50'
                        }`}
                      >
                        {item.tag}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal mb-1">
                      {item.description}
                    </p>

                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? 'max-h-36 opacity-100 mt-3 pt-3 border-t border-neutral-100'
                          : 'max-h-0 opacity-0 mt-0 pt-0 border-t-0'
                      }`}
                    >
                      <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
