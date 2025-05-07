import React, { useState } from "react";
import { useTheme } from "../App";
import { motion } from "framer-motion";

const CopyTrader = ({ username }) => {
  const { theme } = useTheme();
  const [code, setCode] = useState("");
  const [traders, setTraders] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code) {
      setTraders([
        ...traders,
        {
          id: code,
          name: `Trader ${code}`,
          performance: "N/A",
          joined: new Date().toISOString().split("T")[0],
        },
      ]);
      setCode("");
    }
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
          <h1 className="text-3xl font-bold">Copy Trader</h1>
        </div>

        {/* Code Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Join a Copy Trader</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Trader Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
              placeholder="Enter trader code"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Join Trader
          </button>
        </motion.div>

        {/* Copy Traders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold mb-4">Your Copy Traders</h2>
          {traders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No copy traders joined. Enter a code to start.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trader ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {traders.map((trader, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {trader.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {trader.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-500 dark:text-gray-300">
                        {trader.performance}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        {trader.joined}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CopyTrader;