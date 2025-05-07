import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../App";
import { motion } from "framer-motion";
import { useBalance } from "../components/Context/BalanceContext";

const TradeHistory = ({ username }) => {
  const { theme, toggleTheme } = useTheme();
  const { transactions } = useBalance();
  const [filter, setFilter] = useState("all");

  const filteredTrades = transactions.filter((trade) =>
    filter === "all" ? true : trade.type.toLowerCase() === filter
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-8"
    >
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Trade History</h1>
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
          Review your complete transaction history and track your trading
          activity.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Transaction History</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Transactions</option>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          {filteredTrades.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No recent activity found.
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
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTrades.map((trade, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {trade.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {trade.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-green-600 dark:text-green-400">
                        {trade.amount >= 0 ? "+" : "-"}$
                        {Math.abs(trade.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">
                        {trade.recipient_email
                          ? `To: ${trade.recipient_email}`
                          : trade.status || "-"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 text-center">
            For detailed transaction inquiries,{" "}
            <Link
              to="/contact"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              contact support
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TradeHistory;
