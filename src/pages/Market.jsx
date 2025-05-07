import React, { useState, useEffect } from "react";
import { useTheme } from "../App";
import { motion } from "framer-motion";

const Market = () => {
  const { theme } = useTheme();
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h"
        );
        const data = await response.json();
        setMarketData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // Sort for Gainers, Losers, and Active (by trading volume)
  const gainers = marketData
    .filter((coin) => coin.price_change_percentage_24h > 0)
    .sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    )
    .slice(0, 5);

  const losers = marketData
    .filter((coin) => coin.price_change_percentage_24h < 0)
    .sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
    )
    .slice(0, 5);

  const active = marketData
    .sort((a, b) => b.total_volume - a.total_volume)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-20 "
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Market</h1>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            + New Trade
          </button>
        </div>

        {loading ? (
          <p className="text-center">Loading market data...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gainers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Gainers</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="text-right text-sm text-gray-600 dark:text-gray-400">
                      Price
                    </th>
                    <th className="text-right text-sm text-gray-600 dark:text-gray-400">
                      24h Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gainers.map((coin) => (
                    <tr
                      key={coin.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-2 flex items-center">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-6 h-6 mr-2"
                        />
                        {coin.name}
                      </td>
                      <td className="py-2 text-right">
                        ${coin.current_price.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-green-500">
                        +{coin.price_change_percentage_24h.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Losers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Losers</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="text-right text-sm text-gray-600 dark:text-gray-400">
                      Price
                    </th>
                    <th className="text-right text-sm text-gray-600 dark:text-gray-400">
                      24h Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {losers.map((coin) => (
                    <tr
                      key={coin.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-2 flex items-center">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-6 h-6 mr-2"
                        />
                        {coin.name}
                      </td>
                      <td className="py-2 text-right">
                        ${coin.current_price.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-red-500">
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Active */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Active</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="text-right text-sm text-gray-600 dark:text-gray-400">
                      Price
                    </th>
                    <th className="text-right text-sm text-gray-600 dark:text-gray-400">
                      Volume (24h)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {active.map((coin) => (
                    <tr
                      key={coin.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-2 flex items-center">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-6 h-6 mr-2"
                        />
                        {coin.name}
                      </td>
                      <td className="py-2 text-right">
                        ${coin.current_price.toLocaleString()}
                      </td>
                      <td className="py-2 text-right">
                        ${coin.total_volume.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholder for Recent Trades */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-lg font-bold mb-4">Recent Trades</h2>
          <p className="text-gray-600 dark:text-gray-400">
            No recent trades available.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Market;
