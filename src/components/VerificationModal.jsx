import React, { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

const VerificationModal = memo(({ isOpen, onClose, onVerify, onResend }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleChange = useCallback(
    (e) => {
      setCode(e.target.value);
      if (error) setError("");
    },
    [error]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!code.trim()) {
        setError("Please enter a verification code");
        return;
      }

      try {
        onVerify(code);
      } catch (err) {
        setError(err.message || "Verification failed. Please try again.");
      }
    },
    [code, onVerify]
  );

  const handleResend = useCallback(() => {
    try {
      onResend();
      setError("");
    } catch (err) {
      setError(err.message || "Failed to resend code. Please try again.");
    }
  }, [onResend]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Verify Your Email
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Verification Code
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  A verification code has been sent to your email. Please enter
                  it below.
                </p>
                <motion.input
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  value={code}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 6-digit code"
                  required
                  aria-label="Verification code"
                  maxLength={6}
                  minLength={6}
                  pattern="[0-9]{6}"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code from your email
                </p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                  aria-label="Resend verification code"
                >
                  Resend Code
                </motion.button>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Cancel verification"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Verify code"
                    disabled={!code.trim()}
                  >
                    Verify
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default VerificationModal;
