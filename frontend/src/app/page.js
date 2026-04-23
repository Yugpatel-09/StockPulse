'use client';
import { useState } from 'react';
import TickerTape from '@/components/landing/TickerTape';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import NewsPreviewSection from '@/components/landing/NewsPreviewSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';
import AuthModal from '@/components/auth/AuthModal';

export default function LandingPage() {
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null

  const openPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="relative">
      <TickerTape />
      <Navbar
        onLoginClick={() => setAuthModal('login')}
        onSignupClick={() => setAuthModal('signup')}
      />
      <HeroSection
        onSignupClick={() => setAuthModal('signup')}
        onPricingClick={openPricing}
      />
      <FeaturesSection />
      <HowItWorksSection />
      <NewsPreviewSection onSignupClick={() => setAuthModal('signup')} />
      <PricingSection onSignupClick={() => setAuthModal('signup')} />
      <TestimonialsSection />
      <FAQSection />
      <Footer />

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={(mode) => setAuthModal(mode)}
        />
      )}
    </main>
  );
}
