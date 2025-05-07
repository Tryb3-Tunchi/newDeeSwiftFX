import React from "react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      title: "Set Up Your Account",
      description:
        "Sign up securely and connect your trading account via our encrypted API. Your funds remain in your control, with DeeSwiftFx Trade only executing trades on your behalf. Our onboarding process is quick, secure, and user-friendly.",
      icon: "🔐",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Define Your Strategy",
      description:
        "Customize your trading strategy with ease. Choose your risk level, asset classes, and trading parameters. Use our backtesting tools to optimize your strategy and align it with your financial goals.",
      icon: "⚙️",
      image: "https://images.unsplash.com/photo-1551288049-b1f3a99c6b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Grow with Confidence",
      description:
        "Let our AI-driven platform manage your trades 24/7. Monitor performance with real-time analytics and maintain full ownership of your funds. Relax as our system works to maximize your returns.",
      icon: "📈",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const stats = [
    { value: "$500M+", label: "Assets Under Management" },
    { value: "50,000+", label: "Active Traders" },
    { value: "99.9%", label: "Platform Uptime" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-100 text-white py-24">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            How DeeSwiftFx Trade Works
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Transform from a beginner to a confident investor in minutes. Our platform simplifies trading with advanced technology and user-friendly tools.
          </p>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-blue-800 bg-opacity-70 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition duration-300 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="text-5xl mb-6">{step.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">{step.description}</p>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Video Placeholder Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-center mb-12">See It in Action</h2>
          <div className="max-w-4xl mx-auto bg-blue-800 bg-opacity-70 rounded-2xl shadow-xl p-6 backdrop-blur-sm">
            <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1551288049-b1f3a99c6b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Platform demo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl text-blue-300 opacity-80">▶</div>
              </div>
            </div>
            <p className="text-center text-blue-200 mt-4">
              Watch our platform demo to see how easy it is to start trading.
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-8 bg-blue-800 bg-opacity-70 rounded-2xl shadow-xl backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="text-5xl font-bold text-blue-300 mb-4">{stat.value}</div>
              <p className="text-blue-100">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-800 bg-opacity-70 rounded-2xl p-10 max-w-4xl mx-auto backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6">Ready to Begin Your Trading Journey?</h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Join thousands of traders leveraging DeeSwiftFx Trade to achieve their financial goals.
          </p>
          <Link
            to="/register"
            className="inline-block bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Create Your Account
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

export default HowItWorks;