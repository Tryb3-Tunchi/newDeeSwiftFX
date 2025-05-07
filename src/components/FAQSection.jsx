import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How do I get started with DeeSwiftFx Trade?",
      answer:
        "Getting started is simple. Create an account, complete your profile, and make your first deposit. Our team will guide you through the investment process.",
    },
    {
      question: "What are the minimum investment requirements?",
      answer:
        "Our minimum investment requirement varies by account type. Contact our support team for detailed information about investment tiers and requirements.",
    },
    {
      question: "How secure is my investment with DeeSwiftFx Trade?",
      answer:
        "We implement bank-level security measures and are fully compliant with financial regulations. Your investments are protected by advanced encryption and multi-factor authentication.",
    },
    {
      question: "What types of assets can I invest in?",
      answer:
        "We offer a diverse range of investment options including stocks, cryptocurrencies, forex, and commodities. Our platform allows you to build a well-diversified portfolio.",
    },
    {
      question: "How can I monitor my investment performance?",
      answer:
        "Our platform provides real-time portfolio tracking, detailed analytics, and performance reports. You can access your dashboard 24/7 to monitor your investments.",
    },
    {
      question: "What are the withdrawal procedures?",
      answer:
        "Withdrawals can be initiated through your dashboard. Processing times vary by method but typically take 1-3 business days. We ensure secure and efficient transactions.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about DeeSwiftFx Trade and our
            services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                className={`w-full px-6 py-4 text-left focus:outline-none ${
                  activeIndex === index ? "bg-blue-50" : ""
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {faq.question}
                  </h3>
                  <motion.span
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-blue-500"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.span>
                </div>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 py-4 border-t border-gray-100">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
