import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-900 to-indigo-800 text-white py-24 overflow-hidden">
      {/* Background Image with Happy Face */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1657214059233-5626b35eb349?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Happy investor"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
              Innovative Investment Solutions for the Modern Investor
            </h1>
            <p className="text-xl mb-8 text-blue-100 animate-fade-in-up animation-delay-200">
              DeeSwiftFx Trade provides cutting-edge investment strategies with a
              focus on long-term growth and risk management.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up animation-delay-400">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-center transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                to="#features"
                className="bg-transparent hover:bg-blue-800 text-white font-semibold py-4 px-8 border-2 border-blue-300 rounded-xl text-center transition duration-300 transform hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-blue-800 bg-opacity-90 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold mb-2 animate-fade-in">
                  Trade Performance
                </h3>
                <p className="text-blue-300">Historical Win Rates (%)</p>
              </div>
              <div className="relative h-64 mb-4">
                <svg className="w-full h-full" viewBox="0 0 500 200">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#4b5e8e" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#4b5e8e" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#4b5e8e" strokeWidth="1" />
                  
                  {/* Data Points and Lines */}
                  <polyline
                    points="50,150 150,100 250,50 350,120 450,30"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    className="animate-draw-line"
                  />
                  {/* Data Point Circles */}
                  <circle cx="50" cy="150" r="6" fill="#3b82f6" className="animate-pulse" />
                  <circle cx="150" cy="100" r="6" fill="#3b82f6" className="animate-pulse animation-delay-100" />
                  <circle cx="250" cy="50" r="6" fill="#3b82f6" className="animate-pulse animation-delay-200" />
                  <circle cx="350" cy="120" r="6" fill="#3b82f6" className="animate-pulse animation-delay-300" />
                  <circle cx="450" cy="30" r="6" fill="#3b82f6" className="animate-pulse animation-delay-400" />
                  
                  {/* Labels */}
                  <text x="50" y="180" fill="#e0e7ff" fontSize="12" textAnchor="middle">2019</text>
                  <text x="150" y="180" fill="#e0e7ff" fontSize="12" textAnchor="middle">2020</text>
                  <text x="250" y="180" fill="#e0e7ff" fontSize="12" textAnchor="middle">2021</text>
                  <text x="350" y="180" fill="#e0e7ff" fontSize="12" textAnchor="middle">2022</text>
                  <text x="450" y="180" fill="#e0e7ff" fontSize="12" textAnchor="middle">2023</text>
                  
                  {/* Y-Axis Labels */}
                  <text x="20" y="50" fill="#e0e7ff" fontSize="12" textAnchor="end">75%</text>
                  <text x="20" y="100" fill="#e0e7ff" fontSize="12" textAnchor="end">50%</text>
                  <text x="20" y="150" fill="#e0e7ff" fontSize="12" textAnchor="end">25%</text>
                </svg>
              </div>
              <p className="text-xs text-center text-blue-300">
                *Past performance is not indicative of future results
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Additional Styling with Tailwind Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes drawLine {
            from {
              stroke-dashoffset: 1000;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-draw-line {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: drawLine 2s ease-out forwards;
          }
          .animate-pulse {
            animation: pulse 2s infinite;
          }
          .animation-delay-100 {
            animation-delay: 0.1s;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
          .animation-delay-300 {
            animation-delay: 0.3s;
          }
          .animation-delay-400 {
            animation-delay: 0.4s;
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default HeroSection;