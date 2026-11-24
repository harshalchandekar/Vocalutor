"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Logo from '@/components/Logo';


export const Footer: React.FC = () => {
  return (
    <footer id="about" className="border-t border-neutral-200/80 bg-[#EFEFEA] py-14 sm:py-16 text-neutral-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 mb-12">
          {/* Brand info */}
          <div className="md:col-span-4 space-y-3.5">
            <Link href="/" className="inline-flex items-center">
              <Logo size="md" />
            </Link>

            <p className="text-xs sm:text-sm text-neutral-600 max-w-sm leading-relaxed">
              Talk to AI. Learn anything. Spoken conversational tutoring across 6 subjects.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#0F0F10] font-bold mb-3 sm:mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600 font-mono">
              <li>
                <a href="#features" className="hover:text-neutral-900 transition-colors">
                  Features & Subjects
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-neutral-900 transition-colors">
                  Pricing & Plans
                </a>
              </li>
              <li>
                <Link href="/companions" className="hover:text-neutral-900 transition-colors">
                  Tutor Library
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-neutral-900 transition-colors">
                  Learning Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA Replacement: Talk your way to the top of the class */}
          <div className="md:col-span-5 flex flex-col justify-start">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col gap-3.5">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#E03E1A] font-semibold">
                START TODAY
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F0F10] tracking-tight leading-snug">
                Talk your way to the top of the class.
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Experience real-time interactive Socratic dialogue with your private AI tutor across all 6 core subjects.
              </p>
              <div className="pt-2">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold text-white bg-[#0F0F10] hover:bg-[#E03E1A] rounded-xl transition-colors cursor-pointer"
                    >
                      <span>Get Started for Free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <Link
                    href="/companions"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold text-white bg-[#0F0F10] hover:bg-[#E03E1A] rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Go to Tutor Library</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-neutral-300/60 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-3">
          <p>© 2026 Vocalutor. All rights reserved.</p>
          <p className="text-neutral-600">Built for real voice learning.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
