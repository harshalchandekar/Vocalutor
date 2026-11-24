"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import InteractiveDotCanvas from '@/components/landing/InteractiveDotCanvas';
import HeroSection from '@/components/landing/HeroSection';
import SubjectTicker from '@/components/landing/SubjectTicker';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';

export default function VocalutorLandingPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [activeSubject, setActiveSubject] = useState('maths');
  const [isSpeaking] = useState(false);

  // Directly redirect logged-in users to Tutors Library (/companions)
  useEffect(() => {
    if (isLoaded && userId) {
      router.replace('/companions');
    }
  }, [isLoaded, userId, router]);

  if (isLoaded && userId) {
    return null;
  }

  const handleSelectSubject = (subId: string) => {
    setActiveSubject(subId);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8F8F7] text-[#0F0F10] flex flex-col font-sans selection:bg-[#E03E1A]/20 selection:text-[#E03E1A] overflow-x-hidden pt-16">
      {/* 1. Global Interactive Dot Matrix Canvas */}
      <InteractiveDotCanvas />

      {/* 2. Main Landing Sections */}
      <div className="flex-1 relative z-10 w-full">
        {/* Hero Section */}
        <HeroSection
          activeSubject={activeSubject}
          onSelectSubject={handleSelectSubject}
          isSpeaking={isSpeaking}
        />

        {/* Continuous Subject Ticker */}
        <SubjectTicker activeSubject={activeSubject} onSelectSubject={handleSelectSubject} />

        {/* Section 2: 8 Core Subjects & Platform Capabilities */}
        <FeaturesSection />

        {/* Section 3: Three Steps to Learn Out Loud */}
        <HowItWorksSection />

        {/* Section 4: Real Clerk Pricing & Plans */}
        <PricingSection />
      </div>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
