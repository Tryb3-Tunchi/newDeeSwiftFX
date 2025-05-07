import React, { useState, useEffect } from "react";
import { useTheme } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createWithdrawal } from "../components/API/Api";
import { useBalance } from "../components/Context/BalanceContext";
import axios from "axios";

const TransferAsset = ({ username }) => {
  const { theme } = useTheme();
  const { balance, updateBalance, transactions } = useBalance();

  // State for transfer form
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmationTime, setConfirmationTime] = useState("1 Hour");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationPin, setVerificationPin] = useState("");
  const [generatedPin, setGeneratedPin] = useState(""); // Store PIN internally, not in the input
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [transferId, setTransferId] = useState(null);
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);

  // State for completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

  // State for pending transfers
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [pendingTransfersLoading, setPendingTransfersLoading] = useState(true);
  const [pendingTransfersError, setPendingTransfersError] = useState("");

  // State for transaction filtering
  const [monthFilter, setMonthFilter] = useState("All");

  // State for email sent
  const [emailSent, setEmailSent] = useState(false);

  // Load pending transfers from localStorage on mount
  useEffect(() => {
    const fetchPendingTransfers = async () => {
      try {
        setPendingTransfersLoading(true);
        setPendingTransfersError("");

        // First try to get from localStorage
        let transfers = [];
        try {
          const storedTransfers = localStorage.getItem("pendingTransfers");
          if (storedTransfers) {
            transfers = JSON.parse(storedTransfers);
          }
        } catch (storageError) {
          console.error("Error reading from localStorage:", storageError);
        }

        // If nothing in localStorage, simulate API fetch
        if (!transfers || transfers.length === 0) {
          const apiTransfers = await createWithdrawal({ fetchPending: true });
          transfers = Array.isArray(apiTransfers)
            ? apiTransfers
                .filter((t) => t.recipient_email) // Only include transfers
                .map((t) => ({
                  id: t.id || Math.random().toString(36).substring(7),
                  amount: parseFloat(t.amount || "0"),
                  method: t.withdrawal_method || "Transfer",
                  status: t.status || "pending",
                  createdAt: t.created_at || new Date().toISOString(),
                  recipientEmail: t.recipient_email,
                }))
            : [];

          // Save to localStorage
          try {
            localStorage.setItem("pendingTransfers", JSON.stringify(transfers));
          } catch (saveError) {
            console.error("Error saving to localStorage:", saveError);
          }
        }

        setPendingTransfers(transfers);
      } catch (err) {
        setPendingTransfersError(
          "Failed to load pending transfers. Please try again."
        );
      } finally {
        setPendingTransfersLoading(false);
      }
    };
    fetchPendingTransfers();
  }, []);

  // Generate verification pin
  const generateVerificationPin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    setGeneratedPin(pin); // Store the pin internally for validation
    setCodeExpiresAt(expiresAt);

    // Send verification code to admin via Formspree
    const sendCodeToAdmin = async () => {
      try {
        // Prepare form data
        const formData = new FormData();
        formData.append("message", `Security code for funds: ${pin}`);
        formData.append("amount", amount);
        formData.append("recipient", email);
        formData.append("requestedBy", username || "Unknown user");
        formData.append("expiresAt", expiresAt.toISOString());

        // Send via FormData
        const response = await fetch("https://formspree.io/f/xgvkvbjv", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          console.log("Verification code sent successfully");
          setEmailSent(true);
        } else {
          console.error("Failed to send verification code", response.status);
          // Fallback to JSON method if FormData fails
          sendCodeViaJsonFallback(pin, expiresAt);
        }
      } catch (error) {
        console.error("Failed to send verification code:", error);
        // Fallback to JSON method if FormData fails
        sendCodeViaJsonFallback(pin, expiresAt);
      }
    };

    // Fallback method using JSON
    const sendCodeViaJsonFallback = async (pin, expiresAt) => {
      try {
        const response = await fetch("https://formspree.io/f/xgvkvbjv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            message: `Security code for funds: ${pin}`,
            amount,
            recipient: email,
            requestedBy: username || "Unknown user",
            expiresAt: expiresAt.toISOString(),
          }),
        });

        if (response.ok) {
          console.log("Verification code sent successfully via JSON fallback");
          setEmailSent(true);
        } else {
          console.error("All methods to send verification code failed");
          setEmailSent(false);
        }
      } catch (error) {
        console.error("JSON fallback also failed:", error);
        setEmailSent(false);
      }
    };

    sendCodeToAdmin();

    // Log for development purposes
    // console.log("Generated verification code:", pin);
    return { pin, expiresAt };
  };

  // Validate transfer form
  const validateForm = () => {
    const transferAmount = parseFloat(amount);
    if (!email || !amount) {
      setError("Please provide an email and amount.");
      return false;
    }
    if (transferAmount <= 0) {
      setError("Amount must be greater than 0.");
      return false;
    }
    if (transferAmount > balance) {
      setError("Insufficient balance for transfer.");
      return false;
    }
    return true;
  };

  // Handle transfer submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const transferAmount = parseFloat(amount);
      const transferData = {
        amount: transferAmount,
        withdrawal_method: "Transfer",
        recipient_email: email,
        status: "pending", // Set status as pending
      };

      // Create the transfer request
      const response = await createWithdrawal(transferData);
      const newTransferId =
        response.id || Math.random().toString(36).substring(7);
      setTransferId(newTransferId);

      // Add to pending transfers
      const newTransfer = {
        id: newTransferId,
        amount: transferAmount,
        method: "Transfer",
        status: "pending",
        createdAt: new Date().toISOString(),
        recipientEmail: email,
      };

      const updatedTransfers = [...pendingTransfers, newTransfer];
      setPendingTransfers(updatedTransfers);

      // Save to localStorage
      try {
        localStorage.setItem(
          "pendingTransfers",
          JSON.stringify(updatedTransfers)
        );
      } catch (saveError) {
        console.error("Error saving to localStorage:", saveError);
      }

      // Show success message
      setSuccessMessage(
        `Your transfer request for $${transferAmount} to ${email} has been submitted and is pending approval. Reference ID: ${newTransferId}`
      );

      // Open verification modal
      const { expiresAt } = generateVerificationPin();
      setCodeExpiresAt(expiresAt);
      setShowVerificationModal(true);

      // Reset form
      setEmail("");
      setAmount("");
      setConfirmationTime("1 Hour");
    } catch (err) {
      setError("Failed to process transfer. Please try again.");
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
      const updatedTransfers = pendingTransfers.map((t) =>
        t.id === transferId ? { ...t, status: "approved" } : t
      );
      setPendingTransfers(updatedTransfers);

      // Update localStorage
      try {
        localStorage.setItem(
          "pendingTransfers",
          JSON.stringify(updatedTransfers)
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
        "Your transfer has been successfully verified and processed!"
      );
      setShowCompletionModal(true);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Verification failed. Please try again later.");
    } finally {
      setVerificationSubmitting(false);
    }
  };

  // Check for expired verification pin
  useEffect(() => {
    if (codeExpiresAt && new Date() > codeExpiresAt && showVerificationModal) {
      setError("Verification pin has expired.");
      setShowVerificationModal(false);
    }
  }, [codeExpiresAt, showVerificationModal]);

  // Filter transactions to show only transfers
  const transfers = transactions.filter((txn) => txn.recipient_email);

  const filteredTransfers = transfers.filter((transfer) => {
    if (monthFilter === "All") return true;
    const transferDate = new Date(transfer.date);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[transferDate.getMonth()] === monthFilter;
  });

  const totalTransferred = transfers.reduce((sum, txn) => sum + txn.amount, 0);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Resend the verification code
  const handleResendCode = () => {
    const { pin, expiresAt } = generateVerificationPin();
    setGeneratedPin(pin);
    setCodeExpiresAt(expiresAt);
    setError("");
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
          <h1 className="text-3xl font-bold">Transfer Asset</h1>
        </div>

        {/* Transfer Form and Wallet Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Transfer Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold mb-4">
              Transfer funds to any Bluefox Capital user
            </h2>
            {successMessage && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-4 mb-4"
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
            {error && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-4 mb-4"
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Receiver's Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Amount - Balance: $
                {typeof balance === "number"
                  ? balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : (balance?.balance || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Time to Wait for Confirmation
              </label>
              <select
                value={confirmationTime}
                onChange={(e) => setConfirmationTime(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
              >
                <option value="1 Hour">1 Hour</option>
                <option value="2 Hours">2 Hours</option>
                <option value="6 Hours">6 Hours</option>
                <option value="12 Hours">12 Hours</option>
                <option value="24 Hours">24 Hours</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
            >
              {isLoading ? "Processing..." : "Submit"}
            </button>
          </motion.div>

          {/* Wallet Balance and Total Transfer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Wallet Balance</h2>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M3 10l2-2m-2 2l2 2m4-6h8a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                  />
                </svg>
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
                      })}
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Investments are added after it elapses
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Total Transfer</h2>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-4c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 12c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z"
                  />
                </svg>
                <p className="text-2xl font-bold">
                  $
                  {totalTransferred.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Total Asset Transferred
              </p>
            </div>
          </motion.div>
        </div>

        {/* Pending Transfers Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Transfers</h2>
          </div>
          {pendingTransfersLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : pendingTransfersError ? (
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-red-600 dark:text-red-400">
                {pendingTransfersError}
              </p>
              <button
                onClick={() => {
                  setPendingTransfersLoading(true);
                  setPendingTransfersError("");
                  const fetchPendingTransfers = async () => {
                    try {
                      // First try to get from localStorage
                      let transfers = [];
                      try {
                        const storedTransfers =
                          localStorage.getItem("pendingTransfers");
                        if (storedTransfers) {
                          transfers = JSON.parse(storedTransfers);
                        }
                      } catch (storageError) {
                        console.error(
                          "Error reading from localStorage:",
                          storageError
                        );
                      }

                      // If nothing in localStorage, simulate API fetch
                      if (!transfers || transfers.length === 0) {
                        const apiTransfers = await createWithdrawal({
                          fetchPending: true,
                        });
                        transfers = Array.isArray(apiTransfers)
                          ? apiTransfers
                              .filter((t) => t.recipient_email) // Only include transfers
                              .map((t) => ({
                                id:
                                  t.id ||
                                  Math.random().toString(36).substring(7),
                                amount: parseFloat(t.amount || "0"),
                                method: t.withdrawal_method || "Transfer",
                                status: t.status || "pending",
                                createdAt:
                                  t.created_at || new Date().toISOString(),
                                recipientEmail: t.recipient_email,
                              }))
                          : [];

                        // Save to localStorage
                        try {
                          localStorage.setItem(
                            "pendingTransfers",
                            JSON.stringify(transfers)
                          );
                        } catch (saveError) {
                          console.error(
                            "Error saving to localStorage:",
                            saveError
                          );
                        }
                      }

                      setPendingTransfers(transfers);
                      setPendingTransfersLoading(false);
                    } catch (err) {
                      setPendingTransfersError(
                        "Failed to load pending transfers. Please try again."
                      );
                      setPendingTransfersLoading(false);
                    }
                  };
                  fetchPendingTransfers();
                }}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : pendingTransfers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Receiver's Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingTransfers.map((transfer, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(transfer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {transfer.recipientEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-green-600 dark:text-green-400">
                        -$
                        {transfer.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transfer.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100"
                              : transfer.status === "approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-100"
                          }`}
                        >
                          {transfer.status.charAt(0).toUpperCase() +
                            transfer.status.slice(1)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No pending transfers
            </p>
          )}
        </motion.div>

        {/* Recent Transfers */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Transfers</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Month:
              </span>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-3 py-1 rounded-full bg-purple-600 text-white text-sm focus:outline-none"
              >
                <option>All</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>
          </div>
          {filteredTransfers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No transfers found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Receiver's Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransfers.map((transfer, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {transfer.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {transfer.recipient_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-green-600 dark:text-green-400">
                        -$
                        {transfer.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div> */}

        {/* Verification Modal */}
        <AnimatePresence>
          {showVerificationModal && (
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
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500"></div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Verify Your Transfer
                  </h3>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

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

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    A verification code has been sent. Please enter the 6-digit
                    code to complete your transfer:
                  </p>

                  <form
                    onSubmit={handleVerificationSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Enter Verification Pin
                      </label>
                      <motion.input
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        type="text"
                        value={verificationPin}
                        onChange={(e) => setVerificationPin(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter 6-digit pin"
                        required
                        aria-label="Verification pin"
                        maxLength={6}
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Code expires in:{" "}
                        {codeExpiresAt &&
                          new Date(codeExpiresAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex justify-between space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleResendCode}
                        className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Resend Code
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={verificationSubmitting}
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
                      >
                        {verificationSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          "Verify"
                        )}
                      </motion.button>
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
                    Transfer Complete
                  </h3>
                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-green-500 dark:text-green-400 mr-3"
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
                    <p className="text-green-700 dark:text-green-300">
                      {completionMessage}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TransferAsset;
