import React from "react";
import { Link } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import TradingViewSection from "../components/TradingViewSection";
import PricingSection from "../components/PricingSection";
import FAQSection from "../components/FAQSection";
import TestimonialSection from "../components/TestimonialSection";
import CTASection from "../components/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeatureSection />
      <TradingViewSection />
      <PricingSection />
      <FAQSection />
      <TestimonialSection />
      <CTASection />
    </div>
  );
};

export default Home;
