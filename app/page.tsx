"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InteractiveDotCanvas from '@/components/landing/InteractiveDotCanvas';
import HeroSection from '@/components/landing/HeroSection';
import SubjectTicker from '@/components/landing/SubjectTicker';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import CtaBanner from '@/components/landing/CtaBanner';
import Footer from '@/components/landing/Footer';

export default function VocalutorLandingPage() {
  const router = useRouter();
  const [activeSubject, setActiveSubject] = useState('maths');
  const [isSpeaking] = useState(false);

  const handleSelectSubject = (subId: string) => {
    setActiveSubject(subId);
  };

  const handleOpenDemo = () => {
    // Navigate to companions library where users can start real voice sessions
    router.push('/companions');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8F8F7] text-[#0F0F10] flex flex-col font-sans selection:bg-[#E03E1A]/20 selection:text-[#E03E1A] overflow-x-hidden pt-16">
      {/* 1. Global Interactive Dot Matrix Canvas */}
      <InteractiveDotCanvas />

      {/* 2. Main Landing Sections */}
      <div className="flex-1 relative z-10 w-full">
        {/* Hero Section: Text Left, 3D Dandelion Right */}
        <HeroSection
          activeSubject={activeSubject}
          onSelectSubject={handleSelectSubject}
          onOpenDemo={handleOpenDemo}
          isSpeaking={isSpeaking}
        />

        {/* Continuous Subject Ticker & Metrics */}
        <SubjectTicker activeSubject={activeSubject} onSelectSubject={handleSelectSubject} />

        {/* Section 2: 6 Core Subjects with Disappearing Box Bubble Effect */}
        <FeaturesSection
          onOpenDemo={handleOpenDemo}
          activeSubject={activeSubject}
          onSelectSubject={handleSelectSubject}
        />

        {/* Section 3: Three Steps with Mutually Exclusive Hover Accordion */}
        <HowItWorksSection onOpenDemo={() => handleOpenDemo()} />

        {/* Section 4: Simple, Honest Pricing */}
        <PricingSection />

        {/* Section 5: Talk Your Way to Top CTA Banner */}
        <CtaBanner onOpenDemo={() => handleOpenDemo()} />
      </div>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}