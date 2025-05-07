import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../App";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useBalance } from "../components/Context/BalanceContext";
import { lazy, Suspense } from "react";
import PriceTicker from "../components/Prices";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1 className="text-gray-800 dark:text-gray-200 text-center">
          Something went wrong. Please try again.
        </h1>
      );
    }
    return this.props.children;
  }
}

// Lazy load the chart component to improve initial load time
const LazyChart = lazy(() =>
  import("react-chartjs-2").then((module) => ({ default: module.Line }))
);

// Memoized chart component to prevent unnecessary re-renders
const PerformanceChart = memo(({ data, options }) => (
  <Suspense
    fallback={
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-gray-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
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
          <p className="text-gray-500 dark:text-gray-400">Loading chart...</p>
        </div>
      </div>
    }
  >
    <LazyChart data={data} options={options} />
  </Suspense>
));

// Memoized summary card component with minimalistic styling
const SummaryCard = memo(({ label, value, isProfit = false }) => (
  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
      {label}
    </p>
    <p
      className={`text-xl font-semibold ${
        isProfit
          ? value >= 0
            ? "text-blue-500 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-300"
          : "text-gray-800 dark:text-gray-200"
      } overflow-hidden text-ellipsis`}
    >
      {isProfit && value > 0 ? "+" : ""}
      {value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </p>
  </div>
));

// Memoized activity row component with reduced color usage
const ActivityRow = memo(({ activity, index }) => (
  <motion.tr
    key={index}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {activity.date}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          activity.type === "Buy"
            ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            : activity.type === "Sell"
            ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            : activity.type === "Dividend"
            ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {activity.type}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {activity.description}
    </td>
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
        activity.amount >= 0
          ? "text-blue-500 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300"
      }`}
    >
      {activity.amount >= 0 ? "+" : ""}
      {activity.amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}
    </td>
  </motion.tr>
));

const Dashboard = memo(({ username }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    balance,
    accountSummary,
    transactions,
    refreshBalances,
    isLoading,
    error,
    redirectToLogin,
    lastUpdated: contextLastUpdated,
  } = useBalance();
  const [lastUpdated, setLastUpdated] = useState(
    contextLastUpdated || new Date()
  );
  const [tradingViewLoaded, setTradingViewLoaded] = useState(false);

  // Compute portfolio data dynamically using BalanceContext - memoized
  const portfolioData = useMemo(() => {
    let portfolioData = {
      balance: 0,
      equity: 0,
      profit: 0,
      margin: 0,
      position: 0,
      holdings: [
        { name: "Tech Stocks", value: 45000, allocation: 35.8, change: 4.2 },
        { name: "Real Estate", value: 30000, allocation: 23.9, change: 1.8 },
        { name: "Bonds", value: 25000, allocation: 19.9, change: 0.5 },
        { name: "Commodities", value: 15750, allocation: 12.5, change: 2.1 },
        { name: "Crypto", value: 10000, allocation: 7.9, change: 8.7 },
      ],
      recentActivity: [],
    };

    if (balance && typeof balance === "object" && "balance" in balance) {
      portfolioData.balance = parseFloat(balance.balance || 0);
    } else {
      portfolioData.balance = 0;
    }

    if (accountSummary && typeof accountSummary === "object") {
      portfolioData.profit = parseFloat(accountSummary.profit_loss || 0);
      portfolioData.margin = parseFloat(accountSummary.margin || 0);
      portfolioData.position = parseFloat(accountSummary.opened_position || 0);
      portfolioData.equity = portfolioData.balance + portfolioData.profit;
    } else {
      portfolioData.equity = portfolioData.balance * 1.25;
      portfolioData.margin = portfolioData.balance * 0.25;
      portfolioData.position = 3;
      portfolioData.profit = portfolioData.balance * 0.25;
    }

    portfolioData.recentActivity = Array.isArray(transactions)
      ? transactions.slice(0, 5).map((tx) => {
          let timestamp;
          try {
            timestamp = tx.timestamp ? new Date(tx.timestamp) : new Date();
            if (isNaN(timestamp.getTime())) {
              timestamp = new Date();
            }
          } catch (e) {
            timestamp = new Date();
          }

          return {
            date: timestamp.toISOString().split("T")[0],
            type: tx.type
              ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1)
              : "Unknown",
            description: `${
              tx.type
                ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1)
                : "Unknown"
            } via ${tx.method || "N/A"}`,
            amount: parseFloat(tx.amount || 0),
          };
        })
      : [];

    return portfolioData;
  }, [balance, accountSummary, transactions]);

  // Prepare performance data for the chart - memoized
  const performanceData = useMemo(
    () => ({
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Portfolio Value",
          data: Array.isArray(transactions)
            ? transactions
                .filter((tx) => new Date(tx.timestamp).getFullYear() === 2025)
                .reduce((acc, tx, idx) => {
                  const prevValue = idx === 0 ? 100000 : acc[idx - 1];
                  return [...acc, prevValue + (parseFloat(tx.amount) || 0)];
                }, [])
            : new Array(12).fill(100000).map((val, idx) => val + idx * 5000),
          fill: true,
          borderColor: "#4B5563",
          backgroundColor: "rgba(75, 85, 99, 0.1)",
          tension: 0.5, // Increased for curlier lines
          pointBackgroundColor: "#4B5563",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#4B5563",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
        {
          label: "Trades",
          data: Array.isArray(transactions)
            ? transactions
                .filter(
                  (tx) =>
                    tx.type === "trade" ||
                    tx.type === "sell" ||
                    tx.type === "buy"
                )
                .reduce((acc, tx, idx) => {
                  const month = new Date(tx.timestamp).getMonth();
                  acc[month] = (acc[month] || 0) + parseFloat(tx.amount || 0);
                  return acc;
                }, new Array(12).fill(null))
            : [
                5000, 8000, -3000, 12000, 7000, 15000, -2000, 9000, 11000, 6000,
                18000, 4000,
              ],
          fill: false,
          borderColor: "#6B7280",
          backgroundColor: "rgba(107, 114, 128, 0.1)",
          tension: 0.5, // Increased for curlier lines
          pointBackgroundColor: "#6B7280",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#6B7280",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          borderDash: [5, 5],
        },
      ],
    }),
    [transactions]
  );

  // Chart options - memoized based on theme
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: theme === "dark" ? "#D1D5DB" : "#1F2937",
            font: { size: 12 },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor:
            theme === "dark"
              ? "rgba(17, 24, 39, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
          titleColor: theme === "dark" ? "#D1D5DB" : "#1F2937",
          bodyColor: theme === "dark" ? "#D1D5DB" : "#1F2937",
          borderColor: theme === "dark" ? "#4B5563" : "#E5E7EB",
          borderWidth: 1,
          padding: 10,
          boxPadding: 3,
          usePointStyle: true,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
        title: {
          display: true,
          text: "Portfolio Performance (2025)",
          color: theme === "dark" ? "#D1D5DB" : "#1F2937",
          font: { size: 16, weight: "bold" },
          padding: 20,
        },
      },
      scales: {
        y: {
          grid: {
            color:
              theme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: theme === "dark" ? "#D1D5DB" : "#4B5563",
            font: { size: 12 },
            callback: function (value) {
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(value);
            },
          },
          title: {
            display: true,
            text: "Portfolio Value ($)",
            color: theme === "dark" ? "#D1D5DB" : "#4B5563",
            font: { size: 12 },
          },
        },
        x: {
          grid: {
            color:
              theme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: theme === "dark" ? "#D1D5DB" : "#4B5563",
            font: { size: 12 },
          },
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      animation: {
        duration: 2000,
        easing: "easeInOutSine",
      },
      elements: {
        line: {
          borderWidth: 2,
        },
        point: {
          hoverRadius: 6,
        },
      },
    }),
    [theme]
  );

  // Memoized refresh function
  const refreshData = useCallback(async () => {
    try {
      await refreshBalances(true);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to refresh balances:", err);
    }
  }, [refreshBalances]);

  // Set up data refresh on mount and cleanup on unmount
  useEffect(() => {
    if (!contextLastUpdated) {
      refreshData();
    } else {
      setLastUpdated(contextLastUpdated);
    }

    const intervalId = setInterval(refreshData, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [refreshData, contextLastUpdated]);

  // Handle redirect to login if needed
  useEffect(() => {
    if (redirectToLogin) {
      window.location.href = "/login";
    }
  }, [redirectToLogin]);

  // Load TradingView widget script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => setTradingViewLoaded(true);

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize TradingView widget
  useEffect(() => {
    if (tradingViewLoaded && window.TradingView) {
      try {
        const container = document.getElementById("tradingview_chart");
        if (container) {
          new window.TradingView.widget({
            container_id: "tradingview_chart",
            symbol: "BITSTAMP:BTCUSD",
            interval: "D",
            timezone: "Etc/UTC",
            theme: theme === "dark" ? "dark" : "light",
            style: "1",
            locale: "en",
            toolbar_bg: theme === "dark" ? "#2D3748" : "#F1F5F9",
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            save_image: false,
            studies: ["MASimple@tv-basicstudies", "RSI@tv-basicstudies"],
            height: "100%",
            width: "100%",
          });
        }
      } catch (error) {
        console.error("Error initializing TradingView widget:", error);
      }
    }
  }, [tradingViewLoaded, theme]);

  return (
    <ErrorBoundary>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-8 font-['Inter',_sans-serif]"
      >
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome, {username || "User"}!
            </h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg
                  className="w-6 h-6 text-gray-600"
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
                  className="w-6 h-6 text-gray-400"
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
                Last updated: {lastUpdated.toLocaleTimeString()}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <SummaryCard label="Balance" value={portfolioData.balance} />
                <SummaryCard label="Equity" value={portfolioData.equity} />
                <SummaryCard
                  label="Profit"
                  value={portfolioData.profit}
                  isProfit={true}
                />
                <SummaryCard label="Margin" value={portfolioData.margin} />
                <SummaryCard label="Position" value={portfolioData.position} />
              </div>
            )}
          </motion.div>

          {/* Portfolio Allocation & Performance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Asset Allocation
              </h2>
              <div className="h-64 flex items-center justify-center">
                <div className="relative w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {portfolioData.holdings.map((holding, index) => {
                    const rotation =
                      index === 0
                        ? 0
                        : portfolioData.holdings
                            .slice(0, index)
                            .reduce((sum, h) => sum + h.allocation, 0) * 3.6;
                    return (
                      <div
                        key={holding.name}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{
                          background: [
                            "#3B82F6", // Blue
                            "#10B981", // Green
                            "#F59E0B", // Yellow
                            "#EF4444", // Red
                            "#8B5CF6", // Purple
                            "#EC4899", // Pink
                            "#06B6D4", // Cyan
                            "#F97316", // Orange
                          ][index % 8],
                          clipPath: `polygon(50% 50%, 50% 0%, ${
                            50 +
                            50 *
                              Math.cos(
                                ((rotation + holding.allocation * 3.6) *
                                  Math.PI) /
                                  180
                              )
                          }% ${
                            50 -
                            50 *
                              Math.sin(
                                ((rotation + holding.allocation * 3.6) *
                                  Math.PI) /
                                  180
                              )
                          }%, ${
                            50 + 50 * Math.cos((rotation * Math.PI) / 180)
                          }% ${
                            50 - 50 * Math.sin((rotation * Math.PI) / 180)
                          }%)`,
                          transition: "all 0.5s ease-in-out",
                        }}
                      />
                    );
                  })}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Allocation
                    </span>
                  </div>
                </div>
              </div>
              <motion.div className="mt-4 space-y-2">
                {portfolioData.holdings.map((holding, index) => (
                  <div
                    key={holding.name}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          background: [
                            "#3B82F6", // Blue
                            "#10B981", // Green
                            "#F59E0B", // Yellow
                            "#EF4444", // Red
                            "#8B5CF6", // Purple
                            "#EC4899", // Pink
                            "#06B6D4", // Cyan
                            "#F97316", // Orange
                          ][index % 8],
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {holding.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {holding.allocation}%
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Portfolio Performance
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all hover:scale-105">
                    1M
                  </button>
                  <button className="px-3 py-1 text-sm rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 transition-all hover:scale-105 shadow-md">
                    1Y
                  </button>
                  <button className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all hover:scale-105">
                    All
                  </button>
                </div>
              </div>
              <div className="h-[400px]">
                <PerformanceChart
                  data={performanceData}
                  options={chartOptions}
                />
              </div>
            </motion.div>
          </div>

          {/* TradingView Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 my-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                  Market Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Stay informed with live BTC/USD market data and
                  professional-grade charts.
                </p>

                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    Trading Signals
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        MACD
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        Buy
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        RSI (14)
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        Neutral
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Moving Average
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        Buy
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Bollinger Bands
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        Neutral
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="h-[600px] bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                  {tradingViewLoaded ? (
                    <div id="tradingview_chart" className="h-full w-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <svg
                          className="animate-spin h-8 w-8 text-gray-500 mx-auto mb-4"
                          xmlns="http://www.w3.org/2000/svg"
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
                        <p className="text-gray-500 dark:text-gray-400">
                          Loading TradingView chart...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Recent Activity
            </h2>
            {portfolioData.recentActivity.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No recent activity available.
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
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {portfolioData.recentActivity.map((activity, index) => (
                      <ActivityRow
                        key={index}
                        activity={activity}
                        index={index}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-right">
              <Link
                to="/trade-history"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm font-medium transition duration-300"
              >
                View All Activity →
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
});

export default Dashboard;
