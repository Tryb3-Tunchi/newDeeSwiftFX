import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../App";
import { motion } from "framer-motion";
import { useBalance } from "../components/Context/BalanceContext";

const Portfolio = ({ username }) => {
  const { theme } = useTheme();
  const {
    balance,
    accountSummary,
    transactions,
    isLoading,
    error,
    lastUpdated,
  } = useBalance();

  // Compute portfolio data dynamically using BalanceContext
  const portfolioData = useMemo(() => {
    // Initialize with default values
    let parsedBalance = 0;
    let parsedProfit = 0;

    // Parse balance from context
    if (balance && typeof balance === "object" && "balance" in balance) {
      parsedBalance = parseFloat(balance.balance || 0);
    }

    // Parse account summary from context
    if (accountSummary && typeof accountSummary === "object") {
      parsedProfit = parseFloat(accountSummary.profit_loss || 0);
    } else {
      parsedProfit = parsedBalance * 0.25;
    }

    // Default list of assets
    const defaultAssets = [
      // Cryptocurrencies
      { name: "Bitcoin (BTC)", value: 0, allocation: 0, change: 0 },
      { name: "Ethereum (ETH)", value: 0, allocation: 0, change: 0 },
      { name: "Binance Coin (BNB)", value: 0, allocation: 0, change: 0 },
      { name: "Cardano (ADA)", value: 0, allocation: 0, change: 0 },
      { name: "Solana (SOL)", value: 0, allocation: 0, change: 0 },
      { name: "Ripple (XRP)", value: 0, allocation: 0, change: 0 },
      { name: "Dogecoin (DOGE)", value: 0, allocation: 0, change: 0 },
      { name: "Polkadot (DOT)", value: 0, allocation: 0, change: 0 },
      { name: "Polygon (MATIC)", value: 0, allocation: 0, change: 0 },
      { name: "Avalanche (AVAX)", value: 0, allocation: 0, change: 0 },

      // Stocks
      { name: "Apple (AAPL)", value: 0, allocation: 0, change: 0 },
      { name: "Microsoft (MSFT)", value: 0, allocation: 0, change: 0 },
      { name: "Amazon (AMZN)", value: 0, allocation: 0, change: 0 },
      { name: "Google (GOOGL)", value: 0, allocation: 0, change: 0 },
      { name: "Tesla (TSLA)", value: 0, allocation: 0, change: 0 },
      { name: "NVIDIA (NVDA)", value: 0, allocation: 0, change: 0 },
      { name: "Meta (META)", value: 0, allocation: 0, change: 0 },
      { name: "Netflix (NFLX)", value: 0, allocation: 0, change: 0 },

      // Other
      { name: "Unknown", value: 0, allocation: 0, change: 0 },
    ];

    // Extract deposit transactions
    const depositTransactions = (transactions || [])
      .filter((tx) => tx.type === "Deposit")
      .reduce((acc, tx) => {
        // Determine asset type - use "Unknown" as fallback
        const assetType = tx.cryptoType || tx.method || "Unknown";
        if (!acc[assetType]) {
          acc[assetType] = {
            totalAmount: 0,
            transactions: [],
          };
        }
        acc[assetType].totalAmount += parseFloat(tx.amount || 0);
        acc[assetType].transactions.push(tx);
        return acc;
      }, {});

    // Calculate total deposits for percentage calculation
    const totalDeposits = Object.values(depositTransactions).reduce(
      (sum, { totalAmount }) => sum + totalAmount,
      0
    );

    // Create a map of assets from deposit transactions
    const transactionAssetsMap = Object.entries(depositTransactions).reduce(
      (acc, [name, data]) => {
        const { totalAmount } = data;
        const allocation =
          totalDeposits > 0 ? (totalAmount / totalDeposits) * 100 : 0;
        const profit = parsedProfit * (allocation / 100);
        const percentageIncrease =
          totalAmount > 0 ? (profit / totalAmount) * 100 : 0;

        acc[name] = {
          name,
          value: totalAmount,
          allocation: profit,
          change: percentageIncrease,
        };
        return acc;
      },
      {}
    );

    // Merge transaction-derived assets with default assets
    const assets = defaultAssets.map((defaultAsset) => {
      const transactionAsset = transactionAssetsMap[defaultAsset.name];
      if (transactionAsset) {
        return transactionAsset;
      }
      return defaultAsset; // Keep value, allocation, and change as 0 if not used in deposits
    });

    return {
      balance: parsedBalance,
      profit: parsedProfit,
      assets,
      recentTransactions: transactions ? transactions.slice(0, 5) : [],
    };
  }, [balance, accountSummary, transactions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-8 font-['Inter',_sans-serif]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        </div>

        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Portfolio Summary
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
            </span>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500 dark:text-gray-400">
                Loading account data...
              </p>
            </div>
          ) : error ? (
            <div className="text-gray-600 dark:text-gray-300 text-center">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                  Balance
                </p>
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 overflow-hidden text-ellipsis">
                  $
                  {portfolioData.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                  Profit
                </p>
                <p
                  className={`text-xl font-semibold overflow-hidden text-ellipsis ${
                    portfolioData.profit >= 0
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {portfolioData.profit >= 0 ? "+" : ""}$
                  {portfolioData.profit.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Asset Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Asset Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profit Allocation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % Increase
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {portfolioData.assets.map((asset, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {asset.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-800 dark:text-gray-200">
                      $
                      {asset.value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-blue-500 dark:text-blue-400">
                      $
                      {asset.allocation.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        asset.change >= 0
                          ? "text-blue-500 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {asset.change >= 0 ? "+" : ""}
                      {asset.change.toFixed(2)}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Recent Transactions
          </h2>
          {portfolioData.recentTransactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No transactions found. Make a deposit to start investing.
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {portfolioData.recentTransactions.map(
                    (transaction, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.method || "N/A"}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                            parseFloat(transaction.amount) >= 0
                              ? "text-blue-500 dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {parseFloat(transaction.amount) >= 0 ? "+" : ""}$
                          {Math.abs(
                            parseFloat(transaction.amount)
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </motion.tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 text-right">
            <Link
              to="/deposit"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm font-medium transition duration-300"
            >
              Deposit Now →
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Portfolio;
