"use client";

import React from 'react';
import { PricingTable } from '@clerk/nextjs';

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-16 sm:py-24 relative bg-[#F8F8F7] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#E03E1A] uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E03E1A]" />
            <span>PRICING & PLANS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F0F10] tracking-tight mb-3">
            Simple, transparent pricing.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Start for free. Upgrade whenever you need higher companion limits and extended voice minutes.
          </p>
        </div>

        <div className="max-w-5xl mx-auto flex justify-center">
          <PricingTable />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
