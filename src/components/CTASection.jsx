import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <div className="py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Start Your Investment Journey?
        </h2>
        <p className="text-xl mb-10 max-w-3xl mx-auto">
          Join thousands of investors who are already growing their wealth with
          DeeSwiftFx Trade's innovative investment platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a
            href="/register"
            className="bg-white text-blue-900 hover:bg-blue-100 font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            Create Account
          </a>
          <a
            href="/login"
            className="bg-transparent hover:bg-blue-800 text-white font-semibold py-3 px-8 border border-white rounded-lg text-lg transition duration-300"
          >
            Sign In
          </a>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">$500M+</div>
            <p className="text-blue-300">Assets Under Management</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">10,000+</div>
            <p className="text-blue-300">Active Investors</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">15%</div>
            <p className="text-blue-300">Average Annual Return*</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-blue-300">
          *Past performance is not indicative of future results
        </p>
      </div>
    </div>
  );
};

export default CTASection;
