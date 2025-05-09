import React, { useState } from "react";
import { useTheme } from "../App";
import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useBalance } from "../components/Context/BalanceContext";

const InvestmentPackages = () => {
  const { theme } = useTheme();
  const { balance, updateBalance } = useBalance();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const packages = [
    {
      id: "basic",
      name: "Basic",
      price: 500,
      description: "Perfect for beginners",
      features: [
        "Access to basic trading tools",
        "Basic market analysis",
        "Email support",
        "2% weekly ROI",
        "1 month contract period",
      ],
      roi: "2% weekly",
      duration: "1 month",
      color: "blue",
    },
    {
      id: "standard",
      name: "Standard",
      price: 1500,
      description: "Most popular choice",
      features: [
        "Everything in Basic",
        "Advanced trading tools",
        "Priority email support",
        "3.5% weekly ROI",
        "3 months contract period",
        "Phone support",
      ],
      roi: "3.5% weekly",
      duration: "3 months",
      color: "green",
      recommended: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: 5000,
      description: "For serious traders",
      features: [
        "Everything in Standard",
        "Premium trading alerts",
        "24/7 dedicated support",
        "5% weekly ROI",
        "6 months contract period",
        "One-on-one consultations",
      ],
      roi: "5% weekly",
      duration: "6 months",
      color: "purple",
    },
    {
      id: "vip",
      name: "VIP",
      price: 10000,
      description: "Elite trading experience",
      features: [
        "Everything in Premium",
        "Custom investment strategies",
        "Personal account manager",
        "7% weekly ROI",
        "12 months contract period",
        "Exclusive market insights",
      ],
      roi: "7% weekly",
      duration: "12 months",
      color: "yellow",
    },
  ];

  const handleSubscribe = (pkg) => {
    setSelectedPackage(pkg);
    setShowConfirmModal(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (typeof balance === "number" && balance < selectedPackage.price) {
        setErrorMessage(
          `Insufficient balance. Please deposit at least $${
            selectedPackage.price - balance
          } more.`
        );
        setIsProcessing(false);
        return;
      }

      setSuccessMessage(
        `You have successfully subscribed to the ${selectedPackage.name} package. Your investment will start generating returns soon!`
      );
      setShowConfirmModal(false);
      setIsProcessing(false);

      if (typeof updateBalance === "function") {
        updateBalance(balance - selectedPackage.price);
      }
      window.location.href = "/deposit"; // Redirect to deposit page
    } catch (error) {
      setErrorMessage(
        "There was an error processing your subscription. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Investment Packages
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the investment package that fits your goals. Higher tiers
            offer better returns and more features.
          </p>
        </div>

        {successMessage && (
          <div className="max-w-3xl mx-auto mb-8 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">
              {successMessage}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ scale: 1.03 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-t-4 ${
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
                <div className="bg-green-500 dark:bg-green-600 text-white text-xs font-bold text-center py-1">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {pkg.description}
                </p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {" "}
                    one-time
                  </span>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon
                        className={`h-5 w-5 mr-2 flex-shrink-0 ${
                          pkg.recommended
                            ? "text-green-500 dark:text-green-400"
                            : pkg.color === "blue"
                            ? "text-blue-500 dark:text-blue-400"
                            : pkg.color === "purple"
                            ? "text-purple-500 dark:text-purple-400"
                            : "text-yellow-500 dark:text-yellow-400"
                        }`}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleSubscribe(pkg)}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
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
                  </button>
                </div>
              </div>
            </motion.div>
          ))
          }
        </div>

        <div className="max-w-3xl mx-auto mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                How do the returns work?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Returns are calculated weekly based on your investment package
                and are added to your account balance automatically.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Can I upgrade my package?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade to a higher tier package at any time. The
                remaining value of your current package will be applied to the
                new one.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                What happens after the contract period?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                After the contract period ends, you can withdraw your initial
                investment plus returns, or reinvest in another package.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Confirm Subscription</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You are about to subscribe to the{" "}
              <span className="font-semibold">{selectedPackage.name}</span>{" "}
              package for{" "}
              <span className="font-semibold">${selectedPackage.price}</span>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will be deducted from your current balance of{" "}
              <span className="font-semibold">
                ${typeof balance === "number" ? balance.toFixed(2) : 0}
              </span>
              .
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setErrorMessage("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubscription}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm Subscription"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default InvestmentPackages;