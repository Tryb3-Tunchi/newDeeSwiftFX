import React from "react";

const FeatureSection = () => {
  const features = [
    {
      title: "Smart Portfolio Management",
      description:
        "Our AI-driven algorithms optimize your portfolio based on your risk tolerance and financial goals.",
      icon: "📊",
    },
    {
      title: "Real-time Market Analysis",
      description:
        "Stay ahead with our real-time market insights and data-driven investment recommendations.",
      icon: "📈",
    },
    {
      title: "Low Management Fees",
      description:
        "Enjoy competitive management fees that maximize your investment returns over time.",
      icon: "💰",
    },
    {
      title: "Secure & Compliant",
      description:
        "Your investments are protected with bank-level security and regulatory compliance.",
      icon: "🔒",
    },
  ];

  return (
    <div id="features" className="py-10 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          You don't need to be an expert to build your Portfolio and
          digital wealth
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            

Investing in cryptocurrency, stocks can be intimidating, especially for beginners. Sometimes managing a crypto investment is daunting due to the uncertainty and volatility of the market, as well as the time investment needed to be successful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-blue-50 rounded-lg p-8 hover:shadow-lg transition duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Trusted by over 10,000 investors worldwide
          </div>
          <div className="flex justify-center items-center space-x-8 mt-5 opacity-70">
            <div className="text-xl font-bold text-gray-500"><img src="./incom02.png" alt="" /></div>
            <div className="text-xl font-bold text-gray-500"><img src="./incom05.png" alt="" /></div>
            <div className="text-xl font-bold text-gray-500">
                <img src="./incom01.png" alt="" /></div>
            <div className="text-xl font-bold text-gray-500">
            <img src="./incom04.png" alt="" />
            </div>
            <div className="text-xl font-bold text-gray-500">
            <img src="./incom03.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
