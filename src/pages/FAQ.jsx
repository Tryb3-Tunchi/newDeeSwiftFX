import React, { useState } from "react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = [
    {
      question: "What is DeeSwiftFx Trade?",
      answer:
        "DeeSwiftFx Trade is a premier trading platform leveraging advanced AI and machine learning to deliver sophisticated trading strategies. Our mission is to empower investors with professional-grade tools, customizable strategies, and real-time market insights for optimal financial growth.",
    },
    {
      question: "How do I get started with DeeSwiftFx Trade?",
      answer:
        "Starting is seamless: 1) Sign up for an account on our secure platform, 2) Verify your identity and complete your profile, 3) Link your trading account via our encrypted API, 4) Select or customize your trading strategy, 5) Activate automated trading and monitor your progress in real-time.",
    },
    {
      question: "Is my investment secure with DeeSwiftFx Trade?",
      answer:
        "Absolutely. Your funds remain in your personal trading account, and we only execute trades via secure API permissions. We employ bank-grade encryption, multi-factor authentication, and comply with global financial regulations to ensure the highest security standards.",
    },
    {
      question: "What are the minimum investment requirements?",
      answer:
        "The minimum investment varies by strategy: our Core Strategies start at $500, while Premium Strategies may require $5,000 or more. Visit our platform or contact our team for tailored guidance on strategy-specific requirements.",
    },
    {
      question: "How does the automated trading system function?",
      answer:
        "Our cutting-edge system uses AI-driven algorithms to analyze market trends, identify opportunities, and execute trades based on your strategy. Operating 24/7, it optimizes trades, manages risk, and adapts to market conditions while adhering to your risk parameters.",
    },
    {
      question: "Can I customize my trading strategy?",
      answer:
        "Yes, our platform offers extensive customization. Adjust risk levels, asset allocations, trading pairs, and rebalancing schedules. Use our advanced backtesting tools to simulate strategies before deployment, ensuring alignment with your goals.",
    },
    {
      question: "What returns can I expect?",
      answer:
        "Returns depend on market conditions and strategy. Our platform provides historical performance data for transparency, but past results do not guarantee future gains. Our strategies aim for consistent growth with robust risk management.",
    },
    {
      question: "How can I track my trading performance?",
      answer:
        "Monitor your portfolio with our intuitive dashboard, featuring real-time analytics, trade history, risk metrics, and customizable reports. Access detailed insights anytime via our web or mobile app.",
    },
  ];

  const testimonials = [
    {
      quote: "DeeSwiftFx Trade transformed my investment journey with its intuitive platform and powerful automation.",
      author: "Emily R., Investor",
    },
    {
      quote: "The real-time analytics and customizable strategies gave me confidence to trade like a pro.",
      author: "James K., Trader",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-100 text-white py-24">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Discover everything you need to know about DeeSwiftFx Trade’s platform, services, and trading solutions.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto mb-20">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="mb-4 bg-blue-800 bg-opacity-50 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm"
            >
              <button
                className="w-full px-8 py-5 text-left focus:outline-none flex justify-between items-center transition duration-300 hover:bg-blue-700"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-xl font-semibold">{item.question}</span>
                <span
                  className={`transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  } text-blue-300`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`px-8 overflow-hidden transition-all duration-500 ${
                  openIndex === index ? "py-6 max-h-96" : "max-h-0"
                }`}
              >
                <p className="text-blue-100 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-blue-800 bg-opacity-50 p-6 rounded-xl shadow-lg backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <p className="text-blue-100 italic mb-4">“{testimonial.quote}”</p>
                <p className="text-blue-300 font-semibold">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center bg-blue-800 bg-opacity-70 rounded-2xl p-10 max-w-4xl mx-auto backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Our dedicated support team is available 24/7 to assist with any inquiries. Reach out via our contact form or live chat.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Contact Support
          </Link>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default FAQ;