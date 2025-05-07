import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { QRCodeSVG } from "qrcode.react";
import { createDeposit } from "../components/API/Api";
import { useBalance } from "../components/Context/BalanceContext";

const Deposit = ({ username }) => {
  const { theme, toggleTheme } = useTheme();
  const { balance, updateBalance } = useBalance();

  // State for deposit form
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [showCryptoOptions, setShowCryptoOptions] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for pending deposits
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [pendingDepositsError, setPendingDepositsError] = useState("");

  const depositMethods = [
    { name: "Bank Transfer", id: "bank", verified: true },
    { name: "Credit Card", id: "credit-card", verified: true },
    { name: "Cryptocurrency", id: "crypto", verified: false },
  ];

  const cryptoWallets = [
    {
      id: "btc",
      name: "Bitcoin",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    },
    {
      id: "eth",
      name: "Ethereum",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    },
    {
      id: "usdt",
      name: "USDT (TRC20)",
      address: "TWd2VEmjYpuEVG8HZqJjVx3uNvqvfXgAst",
    },
  ];

  // Load pending deposits on mount
  useEffect(() => {
    const fetchPendingDeposits = async () => {
      try {
        setIsLoading(true);
        setPendingDepositsError("");

        // Try to get pending deposits from localStorage first
        let localDeposits = [];
        try {
          const storedDeposits = localStorage.getItem("pendingDeposits");
          if (storedDeposits) {
            localDeposits = JSON.parse(storedDeposits);
          }
        } catch (storageError) {
          console.error("Error accessing localStorage:", storageError);
          // Continue with empty array if localStorage fails
        }

        if (localDeposits.length > 0) {
          setPendingDeposits(localDeposits);
        } else {
          // If no local deposits, try API
          try {
            // Simulate fetching pending deposits (since the API doesn't have this endpoint)
            const deposits = await createDeposit({ fetchPending: true }); // Mock API call
            const formattedDeposits = Array.isArray(deposits)
              ? deposits.map((d) => ({
                  id: d.id || Math.random().toString(36).substring(7),
                  amount: parseFloat(d.amount || "0"),
                  method: d.payment_method || "Bank Transfer",
                  cryptoType: d.cryptoType || undefined,
                  status: d.status || "pending",
                  createdAt: d.created_at || new Date().toISOString(),
                }))
              : [];
            setPendingDeposits(formattedDeposits);

            // Save to localStorage for future use
            try {
              localStorage.setItem(
                "pendingDeposits",
                JSON.stringify(formattedDeposits)
              );
            } catch (saveError) {
              console.error("Error saving to localStorage:", saveError);
            }
          } catch (apiError) {
            console.error("API error:", apiError);
            setPendingDeposits([]);
          }
        }
      } catch (err) {
        console.error("Error in fetchPendingDeposits:", err);
        setPendingDepositsError(
          "Failed to load pending deposits. Please try again."
        );
        setPendingDeposits([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingDeposits();
  }, []);

  // Handle method selection
  const handleMethodSelect = (methodId) => {
    setMethod(methodId);
    setError("");
    setSuccessMessage("");
    if (methodId === "crypto") {
      setShowCryptoOptions(true);
      setShowDepositForm(false);
    } else {
      setShowCryptoOptions(false);
      setShowDepositForm(true);
    }
  };

  // Handle crypto selection
  const handleCryptoSelect = (cryptoId) => {
    setSelectedCrypto(cryptoId);
    setShowCryptoOptions(false);
    setShowDepositForm(true);
  };

  // Validate deposit form
  const validateForm = () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount)) {
      setError("Please enter a valid amount.");
      return false;
    }
    if (depositAmount < 200) {
      setError("Minimum deposit amount is 200 USD.");
      return false;
    }
    if (!method) {
      setError("Please select a deposit method.");
      return false;
    }
    if (method === "crypto" && !selectedCrypto) {
      setError("Please select a cryptocurrency.");
      return false;
    }
    return true;
  };

  // Handle deposit submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (method === "crypto" && !selectedCrypto) {
      setShowCryptoOptions(true);
      return;
    }
    setShowConfirmationModal(true);
  };

  // Confirm deposit
  const confirmDeposit = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const depositAmount = parseFloat(amount);
      const depositData = {
        amount: depositAmount,
        payment_method:
          method === "bank"
            ? "Bank Transfer"
            : method === "credit-card"
            ? "Credit Card"
            : "Cryptocurrency",
        status: "pending", // Set status as pending
        ...(method === "crypto" && {
          wallet_id: selectedCrypto,
          wallet_address: cryptoWallets.find((w) => w.id === selectedCrypto)
            ?.address,
          cryptoType: cryptoWallets.find((w) => w.id === selectedCrypto)?.name,
        }),
      };

      // Simulate notifying admin via email (mock API call)
      console.log("Notifying admin via email for deposit approval...");
      console.log("Deposit Details:", depositData);

      // Notify admin via Formspree
      try {
        const formData = new FormData();
        formData.append("message", `New funds added`);
        formData.append("amount", depositAmount.toString());
        formData.append("method", depositData.payment_method);
        formData.append("requestedBy", username || "Unknown user");
        formData.append("timestamp", new Date().toISOString());

        if (method === "crypto") {
          formData.append(
            "asset",
            cryptoWallets.find((w) => w.id === selectedCrypto)?.name ||
              "Digital currency"
          );
          formData.append(
            "destination",
            cryptoWallets.find((w) => w.id === selectedCrypto)?.address || ""
          );
        }

        const response = await fetch("https://formspree.io/f/xgvkvbjv", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          console.log("Deposit notification sent successfully");
        } else {
          console.error("Failed to send deposit notification", response.status);
        }
      } catch (notifyError) {
        console.error("Error sending deposit notification:", notifyError);
        // Continue with the deposit process even if notification fails
      }

      // Create the deposit request
      const response = await createDeposit(depositData);
      const depositId = response.id || Math.random().toString(36).substring(7);

      // Add to pending deposits
      const newDeposit = {
        id: depositId,
        amount: depositAmount,
        method: depositData.payment_method,
        cryptoType: method === "crypto" ? depositData.cryptoType : undefined,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const updatedDeposits = [...pendingDeposits, newDeposit];
      setPendingDeposits(updatedDeposits);

      // Save to localStorage
      try {
        localStorage.setItem(
          "pendingDeposits",
          JSON.stringify(updatedDeposits)
        );
      } catch (saveError) {
        console.error("Error saving to localStorage:", saveError);
      }

      // Show success message
      const cryptoMessage = method === "crypto" ? ` via ${selectedCrypto}` : "";
      setSuccessMessage(
        `Your deposit of $${depositAmount}${cryptoMessage} is being processed. Reference ID: ${depositId}`
      );

      // Reset form
      setShowConfirmationModal(false);
      setAmount("");
      setMethod("");
      setSelectedCrypto("");
      setShowDepositForm(false);
      setShowCryptoOptions(false);
    } catch (err) {
      setError("Failed to process deposit. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold">Deposit Funds</h1>
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
          Add funds to your trading account securely and start investing.
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

        {/* Deposit Form or Method Selection - MOVED ABOVE PENDING DEPOSITS */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8"
        >
          {!showDepositForm && !showCryptoOptions ? (
            <>
              <h2 className="text-xl font-bold mb-4">Deposit Methods</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Select your preferred deposit method. All deposits are subject
                to review and approval.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {depositMethods.map((m) => (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMethodSelect(m.id)}
                    className={`flex items-center p-4 rounded-lg border ${
                      m.verified
                        ? "opacity-50 cursor-not-allowed"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    disabled={m.verified}
                    aria-label={`Select ${m.name}`}
                  >
                    {m.id === "bank" ? (
                      <BanknotesIcon className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                    ) : m.id === "credit-card" ? (
                      <CreditCardIcon className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <CurrencyDollarIcon className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                    )}
                    <div className="text-left">
                      <span className="text-sm font-medium">{m.name}</span>
                      {m.verified && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (Verified clients only)
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          ) : showCryptoOptions ? (
            <>
              <h2 className="text-xl font-bold mb-4">Select Cryptocurrency</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Please select the cryptocurrency you would like to deposit:
              </p>
              <div className="space-y-4">
                {cryptoWallets.map((wallet) => (
                  <motion.button
                    key={wallet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCryptoSelect(wallet.id)}
                    className="w-full p-4 text-left border rounded-lg hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400 transition-colors"
                    aria-label={`Select ${wallet.name}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {wallet.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {wallet.address}
                        </p>
                      </div>
                      <QRCodeSVG value={wallet.address} size={80} />
                    </div>
                  </motion.button>
                ))}
              </div>
              <button
                className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                onClick={() => {
                  setShowCryptoOptions(false);
                  setMethod("");
                }}
              >
                Back to Deposit Methods
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">
                Deposit via {depositMethods.find((m) => m.id === method)?.name}
                {selectedCrypto ? ` (${selectedCrypto})` : ""}
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <h3 className="font-medium flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <svg
                    className="w-5 h-5"
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
                  Important Information
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300 list-disc pl-6">
                  <li>
                    Please ensure all payments are made from an account
                    registered in the same name as your trading account.
                  </li>
                  {method === "crypto" ? (
                    <>
                      <li>
                        Cryptocurrency deposits typically require 1-6 network
                        confirmations before they are credited to your account.
                      </li>
                      <li>
                        The USD value will be calculated based on the exchange
                        rate at the time your deposit is received.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        All withdrawals, excluding profits, can only be paid
                        back to the original payment method, up to the deposited
                        amount.
                      </li>
                      <li>
                        We do not charge any commissions or fees for deposits
                        via {depositMethods.find((m) => m.id === method)?.name}.
                      </li>
                    </>
                  )}
                  <li>
                    By submitting a deposit request, you consent to your data
                    being shared with third parties as necessary to process your
                    payment.
                  </li>
                </ul>
              </div>
              {method === "crypto" && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    {selectedCrypto} Deposit Address:
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <code className="font-bold text-sm break-all text-gray-900 dark:text-gray-100">
                      {
                        cryptoWallets.find((w) => w.id === selectedCrypto)
                          ?.address
                      }
                    </code>
                    <button
                      className="ml-2 p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          cryptoWallets.find((w) => w.id === selectedCrypto)
                            ?.address
                        )
                      }
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Send only {selectedCrypto} to this address. Sending any
                    other cryptocurrency may result in permanent loss.
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="mb-4"
                >
                  <label
                    className="block text-gray-600 dark:text-gray-300 mb-2"
                    htmlFor="amount"
                  >
                    Deposit Amount (USD)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="200"
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                    required
                    aria-label="Deposit amount"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Minimum deposit: 200 USD | Remaining Deposit Limit for
                    Non-Verified Account: 2500 USD
                  </p>
                </motion.div>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition duration-300"
                    aria-label="Submit deposit"
                  >
                    {isLoading ? "Processing..." : "Submit Deposit"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      if (method === "crypto") {
                        setShowCryptoOptions(true);
                        setShowDepositForm(false);
                      } else {
                        setShowDepositForm(false);
                        setMethod("");
                      }
                    }}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
                    aria-label="Back"
                  >
                    Back
                  </motion.button>
                </div>
              </form>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 text-center">
                Deposits are processed instantly for most methods.{" "}
                <Link
                  to="/contact"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Contact support
                </Link>{" "}
                for assistance.
              </p>
            </>
          )}
        </motion.div>

        {/* Pending Deposits Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Pending Deposits</h2>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : pendingDepositsError ? (
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-red-600 dark:text-red-400">
                {pendingDepositsError}
              </p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setPendingDepositsError("");
                  createDeposit({ fetchPending: true })
                    .then((deposits) => {
                      const formattedDeposits = Array.isArray(deposits)
                        ? deposits.map((d) => ({
                            id: d.id || Math.random().toString(36).substring(7),
                            amount: parseFloat(d.amount || "0"),
                            method: d.payment_method || "Bank Transfer",
                            cryptoType: d.cryptoType || undefined,
                            status: d.status || "pending",
                            createdAt: d.created_at || new Date().toISOString(),
                          }))
                        : [];
                      setPendingDeposits(formattedDeposits);

                      // Save to localStorage
                      try {
                        localStorage.setItem(
                          "pendingDeposits",
                          JSON.stringify(formattedDeposits)
                        );
                      } catch (saveError) {
                        console.error(
                          "Error saving to localStorage:",
                          saveError
                        );
                      }
                    })
                    .catch((err) => {
                      setPendingDepositsError(
                        "Failed to load pending deposits. Please try again."
                      );
                    })
                    .finally(() => setIsLoading(false));
                }}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : pendingDeposits.length > 0 ? (
            <div className="space-y-4">
              {pendingDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Deposit ID: {deposit.id}
                      </p>
                      <p className="text-lg font-bold">
                        $
                        {deposit.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        ({deposit.method}
                        {deposit.cryptoType ? ` - ${deposit.cryptoType}` : ""})
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(deposit.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`text-sm px-2 py-1 rounded ${
                        deposit.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100"
                          : deposit.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-100"
                          : "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-100"
                      }`}
                    >
                      {deposit.status.charAt(0).toUpperCase() +
                        deposit.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No pending deposits
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

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-6 max-w-lg mx-auto mb-8"
          >
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5"
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
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Confirm Deposit
                  </h3>
                  <button
                    onClick={() => setShowConfirmationModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You are about to deposit{" "}
                  <span className="font-bold">${amount}</span> via{" "}
                  {method === "crypto"
                    ? `Cryptocurrency (${
                        cryptoWallets.find((w) => w.id === selectedCrypto)?.name
                      })`
                    : method === "bank"
                    ? "Bank Transfer"
                    : "Credit Card"}
                  .
                </p>
                {method === "crypto" && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Wallet Address:
                    </p>
                    <p className="text-sm font-medium break-all">
                      {
                        cryptoWallets.find((w) => w.id === selectedCrypto)
                          ?.address
                      }
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmationModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Cancel deposit"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmDeposit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Confirm deposit"
                  >
                    {isLoading ? "Processing..." : "Confirm"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Deposit;
