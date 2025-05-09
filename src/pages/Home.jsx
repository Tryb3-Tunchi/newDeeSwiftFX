import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import TradingViewSection from "../components/TradingViewSection";
import PricingSection from "../components/PricingSection";
import FAQSection from "../components/FAQSection";
import TestimonialSection from "../components/TestimonialSection";
import CTASection from "../components/CTASection";

const PackageCarousel = () => {
  const packages = [
    {
      id: "basic",
      name: "Basic",
      price: 500,
      description: "Perfect for beginners",
      roi: "15% weekly",
      duration: "1 week",
      color: "blue",
    },
    {
      id: "standard",
      name: "Standard",
      price: 1500,
      description: "Most popular choice",
      roi: "30% weekly",
      duration: "2 weeks",
      color: "green",
      recommended: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: 5000,
      description: "For serious traders",
      roi: "65% weekly",
      duration: "4 weeks",
      color: "purple",
    },
    {
      id: "Exclusive",
      name: "Exclusive",
      price: 10000,
      description: "For very serious traders",
      roi: "85% weekly",
      duration: "6 weeks",
      color: "yellow",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % packages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + packages.length) % packages.length);
  };

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 text-gray-800 dark:text-gray-20">
          Explore Our Investment Packages
        </h2>
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="min-w-full flex justify-center px-4"
                >
                  <div
                    className={`relative bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-xl p-8 w-full max-w-md border-t-4 transform transition-all hover:scale-105 hover:shadow-2xl ${
                      pkg.recommended
                        ? "border-green-500 dark:border-green-400"
                        : pkg.color === "blue"
                        ? "border-blue-500 dark:border-blue-400"
                        : pkg.color === "purple"
                        ? "border-purple-500 dark:border-purple-400"
                        : "border-yellow-500 dark:border-yellow-400"
                    }`}
                  >
                    {pkg.recommended && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 dark:bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {pkg.description}
                    </p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        ${pkg.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {" "}
                        one-time
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
                      <strong>ROI:</strong> {pkg.roi} |{" "}
                      <strong>Duration:</strong> {pkg.duration}
                    </p>
                    <Link
                      to="/signup"
                      className={`w-full py-3 px-4 rounded-lg font-medium text-center block transition-colors shadow-md hover:shadow-lg ${
                        pkg.recommended
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : pkg.color === "blue"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : pkg.color === "purple"
                          ? "bg-purple-500 hover:bg-purple-600 text-white"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                    >
                      Subscribe Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-6 space-x-2">
            {packages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  currentSlide === index
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeatureSection />
      <TradingViewSection />
      <PricingSection />
      <FAQSection />
      <PackageCarousel />
      <TestimonialSection />
      <CTASection />
    </div>
  );
};

export default Home;