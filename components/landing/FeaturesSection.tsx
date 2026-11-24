"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { REAL_FEATURES_DATA } from './data';

export const FeaturesSection: React.FC = () => {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <section id="features" className="py-20 sm:py-28 relative overflow-hidden bg-[#F8F8F7]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#E03E1A] uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E03E1A]" />
              <span>CORE CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F0F10] tracking-tight leading-[1.08]">
              Every subject, <br className="hidden sm:inline" />
              <span className="text-neutral-400 font-extrabold">one voice interface.</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-neutral-600 max-w-md">
            Explore 6 academic disciplines, build personalized AI tutors, and track your progress with real-time learning analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {REAL_FEATURES_DATA.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredCard === item.id;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(item.href)}
                className={`group relative rounded-3xl p-6 sm:p-7 min-h-[300px] flex flex-col justify-between transition-all duration-300 cursor-pointer select-none bg-white border ${
                  isHovered
                    ? 'border-[#E03E1A]/40 shadow-xl -translate-y-1'
                    : 'border-neutral-200/80 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="relative z-10 pointer-events-none">
                  <div className="flex items-center justify-between mb-5">
                    <span className={`font-mono text-xs font-bold transition-colors ${isHovered ? 'text-[#E03E1A]' : 'text-neutral-400'}`}>
                      {item.index}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all border ${
                        isHovered ? 'bg-[#0F0F10] text-white border-[#0F0F10] shadow-xs' : 'text-neutral-600 bg-neutral-100 border-neutral-200/60'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center mb-4 ${
                        isHovered ? 'bg-[#0F0F10] text-white scale-105 shadow-md' : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F0F10] tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-2 border-t border-neutral-100/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-neutral-400 font-normal truncate max-w-[170px]">
                    {item.level}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold text-[11px] transition-transform duration-200 ${
                      isHovered ? 'text-[#E03E1A] translate-x-1' : 'text-neutral-600 group-hover:text-[#E03E1A]'
                    }`}
                  >
                    <span>Explore</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
