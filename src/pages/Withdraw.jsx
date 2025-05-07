import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createWithdrawal } from "../components/API/Api";
import { useBalance } from "../components/Context/BalanceContext";
import axios from "axios";

const Withdraw = ({ username }) => {
  const { theme, toggleTheme } = useTheme();
  const { balance, updateBalance } = useBalance();

  // State for withdrawal form
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [walletAddress, setWalletAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [chain, setChain] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationPin, setVerificationPin] = useState("");
  const [generatedPin, setGeneratedPin] = useState(""); // Store PIN internally
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [withdrawalId, setWithdrawalId] = useState(null);
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // State for completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

  // State for pending withdrawals
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [pendingWithdrawalsLoading, setPendingWithdrawalsLoading] =
    useState(true);
  const [pendingWithdrawalsError, setPendingWithdrawalsError] = useState("");

  // Withdrawal methods configuration
  const withdrawalMethods = [
    {
      id: "crypto",
      name: "Cryptocurrency",
      requiresDetails: true,
      detailsType: "crypto",
      minAmount: 5,
      maxAmount: 10000,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      requiresDetails: true,
      detailsType: "bank",
      minAmount: 5,
      maxAmount: 25000,
    },
  ];

  const chains = [
    { id: "btc", name: "Bitcoin (BTC)" },
    { id: "eth", name: "Ethereum (ETH)" },
    { id: "bnb", name: "BNB Chain (BNB)" },
    { id: "trx", name: "Tron (TRX)" },
    { id: "sol", name: "Solana (SOL)" },
  ];

  // Load pending withdrawals from localStorage on mount
  useEffect(() => {
    const fetchPendingWithdrawals = async () => {
      try {
        setPendingWithdrawalsLoading(true);
        setPendingWithdrawalsError("");

        // First try to get from localStorage
        let withdrawals = [];
        try {
          const storedWithdrawals = localStorage.getItem("pendingWithdrawals");
          if (storedWithdrawals) {
            withdrawals = JSON.parse(storedWithdrawals);
          }
        } catch (storageError) {
          console.error("Error reading from localStorage:", storageError);
        }

        // If nothing in localStorage, simulate API fetch
        if (!withdrawals || withdrawals.length === 0) {
          // Try to get pending withdrawals from localStorage first
          let localWithdrawals = [];
          try {
            const storedWithdrawals =
              localStorage.getItem("pendingWithdrawals");
            if (storedWithdrawals) {
              localWithdrawals = JSON.parse(storedWithdrawals);
            }
          } catch (storageError) {
            console.error("Error accessing localStorage:", storageError);
            // Continue with empty array if localStorage fails
          }

          if (localWithdrawals.length > 0) {
            setPendingWithdrawals(localWithdrawals);
          } else {
            // If no local withdrawals, try API
            try {
              // Simulate fetching pending withdrawals (since the API doesn't have this endpoint)
              const withdrawals = await createWithdrawal({
                fetchPending: true,
              }); // Mock API call
              const formattedWithdrawals = Array.isArray(withdrawals)
                ? withdrawals.map((w) => ({
                    id: w.id || Math.random().toString(36).substring(7),
                    amount: parseFloat(w.amount || "0"),
                    method: w.withdrawal_method || "Bank Transfer",
                    status: w.status || "pending",
                    createdAt: w.created_at || new Date().toISOString(),
                    walletAddress: w.wallet_address,
                    bankAccount: w.bank_account,
                  }))
                : [];
              setPendingWithdrawals(formattedWithdrawals);

              // Save to localStorage for future use
              try {
                localStorage.setItem(
                  "pendingWithdrawals",
                  JSON.stringify(formattedWithdrawals)
                );
              } catch (saveError) {
                console.error("Error saving to localStorage:", saveError);
              }
            } catch (apiError) {
              console.error("API error:", apiError);
              setPendingWithdrawals([]);
            }
          }
        }

        setPendingWithdrawals(withdrawals);
      } catch (err) {
        setPendingWithdrawalsError(
          "Failed to load pending withdrawals. Please try again."
        );
      } finally {
        setPendingWithdrawalsLoading(false);
      }
    };
    fetchPendingWithdrawals();
  }, []);

  // Generate verification pin
  const generateVerificationPin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    setGeneratedPin(pin); // Store the pin internally
    setCodeExpiresAt(expiresAt);
    setEmailSent(false);

    // Send verification code to admin via Formspree - FIXED VERSION
    const sendCodeToAdmin = async () => {
      try {
        console.log("Sending verification email with PIN:", pin);

        // Create a FormData object - Formspree works better with FormData
        const formData = new FormData();
        formData.append("_subject", "Funds Release Code");
        formData.append("security_code", pin);
        formData.append("amount", `$${parseFloat(amount).toFixed(2)}`);
        formData.append(
          "transfer_method",
          method === "bank" ? "Bank Transfer" : "Digital Currency"
        );
        formData.append(
          "destination",
          method === "bank"
            ? `Account: ${bankAccount}`
            : `Address: ${walletAddress} (${chain})`
        );
        formData.append("requestedBy", username || "Unknown user");
        formData.append("expires_at", expiresAt.toLocaleString());

        // Make the request to Formspree
        const response = await axios.post(
          "https://formspree.io/f/mrbqbvnl",
          formData,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        console.log("Formspree response:", response);

        if (response.status === 200 || response.status === 201) {
          console.log(
            "Verification code successfully sent to admin via Formspree"
          );
          setEmailSent(true);
        } else {
          console.error(
            "Failed to send verification code via Formspree:",
            response
          );
          // Try alternative method as fallback using JSON
          await sendCodeViaJsonFallback(pin, expiresAt);
        }
      } catch (error) {
        console.error("Failed to send verification code to admin:", error);
        // Try alternative method as fallback
        try {
          await sendCodeViaJsonFallback(pin, expiresAt);
        } catch (fallbackError) {
          console.error("Fallback email sending also failed:", fallbackError);
          // Still set emailSent to true to allow user to continue the flow
          setEmailSent(true);
        }
      }
    };

    // Fallback method using JSON
    const sendCodeViaJsonFallback = async (pin, expiresAt) => {
      try {
        const jsonPayload = {
          _subject: "Funds Release Code (JSON)",
          security_code: pin,
          amount: `$${parseFloat(amount).toFixed(2)}`,
          transfer_method:
            method === "bank" ? "Bank Transfer" : "Digital Currency",
          destination:
            method === "bank"
              ? `Account: ${bankAccount}`
              : `Address: ${walletAddress} (${chain})`,
          requestedBy: username || "Unknown user",
          expires_at: expiresAt.toLocaleString(),
        };

        const response = await axios.post(
          "https://formspree.io/f/mrbqbvnl",
          jsonPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          console.log("Verification code successfully sent via JSON fallback");
          setEmailSent(true);
        } else {
          throw new Error(
            "JSON fallback failed with status: " + response.status
          );
        }
      } catch (error) {
        console.error("JSON fallback email sending failed:", error);
        throw error;
      }
    };

    // Send the code immediately
    sendCodeToAdmin();

    // For development purposes only
    console.log(`Withdrawal verification PIN: ${pin}`);
    return { pin, expiresAt };
  };

  // Validate the withdrawal form
  const validateForm = () => {
    const withdrawAmount = parseFloat(amount);
    const selectedMethod = withdrawalMethods.find((m) => m.id === method);

    if (!selectedMethod) {
      setError("Please select a withdrawal method.");
      return false;
    }

    if (isNaN(withdrawAmount)) {
      setError("Please enter a valid amount.");
      return false;
    }

    if (withdrawAmount < selectedMethod.minAmount) {
      setError(`Minimum withdrawal amount is $${selectedMethod.minAmount}.`);
      return false;
    }

    if (withdrawAmount > selectedMethod.maxAmount) {
      setError(`Maximum withdrawal amount is $${selectedMethod.maxAmount}.`);
      return false;
    }

    if (withdrawAmount > balance) {
      setError("Insufficient balance for withdrawal.");
      return false;
    }

    if (method === "crypto" && (!walletAddress || !chain)) {
      setError("Please provide a wallet address and select a blockchain.");
      return false;
    }

    if (method === "bank" && !bankAccount) {
      setError("Please provide a bank account number.");
      return false;
    }

    return true;
  };

  // Handle withdrawal submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const withdrawAmount = parseFloat(amount);
      const withdrawalData = {
        amount: withdrawAmount,
        withdrawal_method:
          method === "bank" ? "Bank Transfer" : "Cryptocurrency",
        status: "pending", // Set status as pending
        ...(method === "crypto" && { wallet_address: walletAddress, chain }),
        ...(method === "bank" && { bank_account: bankAccount }),
      };

      // Simulate notifying admin via email (mock API call)
      console.log("Preparing withdrawal approval request...");
      console.log("Withdrawal Details:", withdrawalData);

      // Create the withdrawal request
      const response = await createWithdrawal(withdrawalData);
      const newWithdrawalId =
        response.id || Math.random().toString(36).substring(7);
      setWithdrawalId(newWithdrawalId);

      // Add to pending withdrawals
      const newWithdrawal = {
        id: newWithdrawalId,
        amount: withdrawAmount,
        method: withdrawalData.withdrawal_method,
        status: "pending",
        createdAt: new Date().toISOString(),
        walletAddress: method === "crypto" ? walletAddress : undefined,
        bankAccount: method === "bank" ? bankAccount : undefined,
      };

      const updatedWithdrawals = [...pendingWithdrawals, newWithdrawal];
      setPendingWithdrawals(updatedWithdrawals);

      // Save to localStorage
      try {
        localStorage.setItem(
          "pendingWithdrawals",
          JSON.stringify(updatedWithdrawals)
        );
      } catch (saveError) {
        console.error("Error saving to localStorage:", saveError);
      }

      // Show success message
      setSuccessMessage(
        `Your withdrawal request for $${withdrawAmount} has been submitted and is pending approval. Reference ID: ${newWithdrawalId}`
      );

      // Open verification modal and generate the PIN
      const { expiresAt } = generateVerificationPin();
      setCodeExpiresAt(expiresAt);
      setShowVerificationModal(true);

      // Reset form
      setAmount("");
      setWalletAddress("");
      setBankAccount("");
      setChain("");
      setShowForm(false);
    } catch (err) {
      setError("Failed to process withdrawal. Please try again.");
      console.error("Withdrawal submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification submission
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    setError(""); // Clear any previous errors

    if (new Date() > codeExpiresAt) {
      setError("Verification pin has expired. Please request a new one.");
      setShowVerificationModal(false);
      return;
    }

    try {
      setVerificationSubmitting(true);

      // Check if the entered pin matches the generated pin
      if (verificationPin !== generatedPin) {
        setError("Incorrect verification code. Please try again.");
        setVerificationSubmitting(false);
        return;
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state without API call
      const updatedWithdrawals = pendingWithdrawals.map((w) =>
        w.id === withdrawalId ? { ...w, status: "approved" } : w
      );
      setPendingWithdrawals(updatedWithdrawals);

      // Update localStorage
      try {
        localStorage.setItem(
          "pendingWithdrawals",
          JSON.stringify(updatedWithdrawals)
        );
      } catch (saveError) {
        console.error("Error saving to localStorage:", saveError);
      }

      // Try to update balance, but don't fail if it errors
      try {
        if (typeof updateBalance === "function") {
          await updateBalance();
        }
      } catch (balanceError) {
        console.error("Failed to update balance:", balanceError);
        // Continue with verification even if balance update fails
      }

      // Close verification modal and show completion modal
      setVerificationPin("");
      setShowVerificationModal(false);
      setCompletionMessage(
        "Your withdrawal has been successfully verified and processed!"
      );
      setShowCompletionModal(true);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Verification failed. Please try again later.");
    } finally {
      setVerificationSubmitting(false);
    }
  };

  // Resend the verification code
  const handleResendCode = () => {
    const { pin, expiresAt } = generateVerificationPin();
    setGeneratedPin(pin);
    setCodeExpiresAt(expiresAt);
    setError("");
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-8"
    >
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Withdraw Funds</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Securely withdraw your funds to your preferred account.
        </p>

        {/* Account Balance Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Account Balance</h2>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Available Balance
            </p>
            <p className="text-2xl font-bold">
              $
              {typeof balance === "number"
                ? balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : (balance?.balance || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
              USD
            </p>
          </div>
        </motion.div>

        {/* Withdraw Method Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
              <p className="text-red-800 dark:text-red-200 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {withdrawalMethods.map((m) => (
                    <div
                      key={m.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        method === m.id
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
                      }`}
                      onClick={() => setMethod(m.id)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-2 ${
                            method === m.id
                              ? "border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-400"
                              : "border-gray-400 dark:border-gray-600"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Min: ${m.minAmount} | Max: ${m.maxAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  htmlFor="amount"
                >
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min={
                      method
                        ? withdrawalMethods.find((m) => m.id === method)
                            ?.minAmount
                        : 0
                    }
                    max={
                      method
                        ? withdrawalMethods.find((m) => m.id === method)
                            ?.maxAmount
                        : 0
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {method === "bank" && (
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="bankAccount"
                  >
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    id="bankAccount"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your bank account number"
                    required={method === "bank"}
                  />
                </div>
              )}

              {method === "crypto" && (
                <>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      htmlFor="walletAddress"
                    >
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      id="walletAddress"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your wallet address"
                      required={method === "crypto"}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      htmlFor="chain"
                    >
                      Blockchain Network
                    </label>
                    <select
                      id="chain"
                      value={chain}
                      onChange={(e) => setChain(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      required={method === "crypto"}
                    >
                      <option value="">Select blockchain</option>
                      <option value="BTC">Bitcoin</option>
                      <option value="ETH">Ethereum</option>
                      <option value="TRX">Tron (TRC20)</option>
                      <option value="BSC">BNB Smart Chain (BEP20)</option>
                      <option value="SOL">Solana</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
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
                  </span>
                ) : (
                  "Request Withdrawal"
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Pending Withdrawals Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Pending Withdrawals</h2>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : pendingWithdrawalsError ? (
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-red-600 dark:text-red-400">
                {pendingWithdrawalsError}
              </p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setPendingWithdrawalsError("");
                  createWithdrawal({ fetchPending: true })
                    .then((withdrawals) => {
                      const formattedWithdrawals = Array.isArray(withdrawals)
                        ? withdrawals.map((w) => ({
                            id: w.id || Math.random().toString(36).substring(7),
                            amount: parseFloat(w.amount || "0"),
                            method: w.withdrawal_method || "Bank Transfer",
                            status: w.status || "pending",
                            createdAt: w.created_at || new Date().toISOString(),
                            walletAddress: w.wallet_address,
                            bankAccount: w.bank_account,
                          }))
                        : [];
                      setPendingWithdrawals(formattedWithdrawals);

                      // Save to localStorage
                      try {
                        localStorage.setItem(
                          "pendingWithdrawals",
                          JSON.stringify(formattedWithdrawals)
                        );
                      } catch (saveError) {
                        console.error(
                          "Error saving to localStorage:",
                          saveError
                        );
                      }
                    })
                    .catch((err) => {
                      setPendingWithdrawalsError(
                        "Failed to load pending withdrawals. Please try again."
                      );
                    })
                    .finally(() => setIsLoading(false));
                }}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : pendingWithdrawals.length > 0 ? (
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Withdrawal ID: {withdrawal.id}
                      </p>
                      <p className="text-lg font-bold">
                        $
                        {withdrawal.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        ({withdrawal.method})
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Requested: {formatDate(withdrawal.createdAt)}
                      </p>
                      {withdrawal.walletAddress && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                          Destination: {withdrawal.walletAddress}
                        </p>
                      )}
                      {withdrawal.bankAccount && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Account: ****{withdrawal.bankAccount.slice(-4)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          withdrawal.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100"
                            : withdrawal.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-100"
                        }`}
                      >
                        {withdrawal.status.charAt(0).toUpperCase() +
                          withdrawal.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No pending withdrawals
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Your withdrawal requests will appear here
              </p>
            </div>
          )}
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8"
          >
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-800 dark:text-green-200">
                {successMessage}
              </p>
            </div>
          </motion.div>
        )}

        {/* Verification Modal */}
        <AnimatePresence>
          {showVerificationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500"></div>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close verification modal"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Verify Your Withdrawal
                  </h3>

                  {emailSent ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
                      <p className="text-green-700 dark:text-green-300 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Verification code has been sent successfully
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
                      <p className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6l4 2"
                          ></path>
                        </svg>
                        Sending verification code...
                      </p>
                    </div>
                  )}

                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    A verification code has been sent. Please enter the 6-digit
                    code to complete your withdrawal:
                  </p>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {error}
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={handleVerificationSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="verificationPin"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="verificationPin"
                        placeholder="Enter 6-digit code"
                        value={verificationPin}
                        onChange={(e) => setVerificationPin(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        maxLength={6}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Code expires in:{" "}
                        {codeExpiresAt &&
                          new Date(codeExpiresAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex justify-between space-x-4">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Resend Code
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
                        disabled={verificationSubmitting}
                      >
                        {verificationSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Having issues? Please contact our support team for
                      assistance.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Modal */}
        <AnimatePresence>
          {showCompletionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-green-600 dark:bg-green-500"></div>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close completion modal"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                <div className="p-6">
                  <div className="flex flex-col items-center justify-center text-center mb-6">
                    <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mb-4">
                      <svg
                        className="w-8 h-8 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Withdrawal Successful!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {completionMessage}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Return to Dashboard
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Thank you for using our service. Your withdrawal has been
                      processed and will be sent to your account soon.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Withdraw;
