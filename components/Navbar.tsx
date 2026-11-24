"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, SignedOut, UserButton, SignedIn } from "@clerk/nextjs";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Logo from "./Logo";
import UsageMeter from "./UsageMeter";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8F8F7]/90 backdrop-blur-md border-b border-neutral-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-mono font-medium text-neutral-600">
          <SignedOut>
            {isHome ? (
              <>
                <a href="#features" className="hover:text-neutral-900 transition-colors py-1">
                  Features
                </a>
                <a href="#how-it-works" className="hover:text-neutral-900 transition-colors py-1">
                  How It Works
                </a>
                <a href="#pricing" className="hover:text-neutral-900 transition-colors py-1">
                  Pricing
                </a>
                <Link href="/companions" className="hover:text-neutral-900 transition-colors py-1">
                  Tutors Library
                </Link>
              </>
            ) : (
              <>
                <Link href="/#features" className="hover:text-neutral-900 transition-colors py-1">
                  Features
                </Link>
                <Link href="/#how-it-works" className="hover:text-neutral-900 transition-colors py-1">
                  How It Works
                </Link>
                <Link href="/#pricing" className="hover:text-neutral-900 transition-colors py-1">
                  Pricing
                </Link>
                <Link href="/companions" className="hover:text-neutral-900 transition-colors py-1">
                  Tutors Library
                </Link>
              </>
            )}
          </SignedOut>

          {/* When Logged In: Tutors Library, My Journey, Dashboard, Pricing */}
          <SignedIn>
            <Link
              href="/companions"
              className={cn(
                "hover:text-neutral-900 transition-colors py-1",
                pathname.startsWith("/companions") && "text-[#E03E1A] font-bold"
              )}
            >
              Tutors Library
            </Link>
            <Link
              href="/my-journey"
              className={cn(
                "hover:text-neutral-900 transition-colors py-1",
                pathname === "/my-journey" && "text-[#E03E1A] font-bold"
              )}
            >
              My Journey
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "hover:text-neutral-900 transition-colors py-1",
                pathname === "/dashboard" && "text-[#E03E1A] font-bold"
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/subscription"
              className={cn(
                "hover:text-neutral-900 transition-colors py-1",
                pathname === "/subscription" && "text-[#E03E1A] font-bold"
              )}
            >
              Pricing
            </Link>
          </SignedIn>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-3.5 py-1.5 text-xs font-mono font-medium text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold text-white bg-[#0F0F10] hover:bg-[#E03E1A] rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              >
                <span>Start for Free</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <UsageMeter />
              <UserButton />
            </div>
          </SignedIn>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <SignedOut>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-mono font-semibold text-white bg-[#0F0F10] rounded-lg"
              >
                Start Free
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-[#F8F8F7] border-b border-neutral-200 shadow-lg space-y-3">
          <nav className="flex flex-col space-y-2 text-xs font-mono text-neutral-700 pt-2">
            <SignedOut>
              <a href="#features" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-neutral-100">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-neutral-100">
                How It Works
              </a>
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-neutral-100">
                Pricing
              </a>
              <Link href="/companions" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded-lg hover:bg-neutral-100">
                Tutors Library
              </Link>
            </SignedOut>

            {/* When Logged In */}
            <SignedIn>
              <Link
                href="/companions"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-neutral-100 font-semibold text-[#0F0F10]"
              >
                Tutors Library
              </Link>
              <Link
                href="/my-journey"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-neutral-100 font-semibold text-[#0F0F10]"
              >
                My Journey
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-neutral-100 font-semibold text-[#0F0F10]"
              >
                Dashboard
              </Link>
              <Link
                href="/subscription"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-neutral-100 font-semibold text-[#0F0F10]"
              >
                Pricing
              </Link>
            </SignedIn>
          </nav>

          <div className="pt-3 border-t border-neutral-200/60 flex flex-col gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 text-xs font-mono font-medium text-neutral-700 bg-neutral-100 rounded-xl cursor-pointer"
                >
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 text-xs font-mono font-semibold text-white bg-[#0F0F10] hover:bg-[#E03E1A] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Start for Free</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center justify-between px-2 py-2">
                <UsageMeter />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
