import React, { useEffect, useState } from "react";
import { useTheme } from "../App";
import { motion } from "framer-motion";
import { useBalance } from "../components/Context/BalanceContext";
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
import { Line } from "react-chartjs-2";

// Register Chart.js components
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

const Overview = ({ username }) => {
  const { theme } = useTheme();
  const { balance, accountSummary, isLoading, error } = useBalance();
  const [tradingViewLoaded, setTradingViewLoaded] = useState(false);

  useEffect(() => {
    // Load TradingView widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      setTradingViewLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (tradingViewLoaded && window.TradingView) {
      new window.TradingView.widget({
        autosize: true,
        symbol: "COINBASE:BTCUSD",
        interval: "D",
        timezone: "exchange",
        theme: theme === "dark" ? "dark" : "light",
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        container_id: "tradingview_chart",
      });
    }
  }, [tradingViewLoaded, theme]);

  const formatCurrency = (value) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getBalanceData = () => {
    let balanceData = {
      balance: 0,
      profit: 0,
      margin: 0,
    };

    if (balance && typeof balance === "object" && "balance" in balance) {
      balanceData.balance = parseFloat(balance.balance || 0);
    } else {
      console.warn("Balance data is invalid:", balance);
    }

    if (accountSummary && typeof accountSummary === "object") {
      balanceData.profit = parseFloat(accountSummary.profit_loss || 0);
      balanceData.margin = parseFloat(accountSummary.margin || 0);
    } else {
      console.warn("Account summary data is invalid:", accountSummary);
      balanceData.profit = balanceData.balance * 0.25;
      balanceData.margin = balanceData.balance * 0.25;
    }

    return balanceData;
  };

  const balanceData = getBalanceData();

  // Performance chart data
  const performanceData = {
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
        data: [
          balanceData.balance * 0.7,
          balanceData.balance * 0.8,
          balanceData.balance * 0.75,
          balanceData.balance * 0.9,
          balanceData.balance * 0.85,
          balanceData.balance * 0.95,
          balanceData.balance * 1.0,
          balanceData.balance * 1.05,
          balanceData.balance * 1.1,
          balanceData.balance * 1.15,
          balanceData.balance * 1.2,
          balanceData.balance,
        ],
        borderColor:
          theme === "dark" ? "rgba(59, 130, 246, 1)" : "rgba(37, 99, 235, 1)",
        backgroundColor:
          theme === "dark"
            ? "rgba(59, 130, 246, 0.1)"
            : "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Profit chart data
  const profitData = {
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
        label: "Monthly Profit",
        data: [
          balanceData.profit * 0.2,
          balanceData.profit * 0.3,
          balanceData.profit * 0.2,
          balanceData.profit * 0.4,
          balanceData.profit * 0.3,
          balanceData.profit * 0.5,
          balanceData.profit * 0.6,
          balanceData.profit * 0.5,
          balanceData.profit * 0.7,
          balanceData.profit * 0.6,
          balanceData.profit * 0.8,
          balanceData.profit,
        ],
        borderColor:
          theme === "dark" ? "rgba(16, 185, 129, 1)" : "rgba(5, 150, 105, 1)",
        backgroundColor:
          theme === "dark"
            ? "rgba(16, 185, 129, 0.1)"
            : "rgba(5, 150, 105, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor:
          theme === "dark"
            ? "rgba(17, 24, 39, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
        titleColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        bodyColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        borderColor:
          theme === "dark"
            ? "rgba(75, 85, 99, 0.4)"
            : "rgba(209, 213, 219, 0.8)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return formatCurrency(context.parsed.y);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color:
            theme === "dark"
              ? "rgba(75, 85, 99, 0.2)"
              : "rgba(209, 213, 219, 0.5)",
        },
        ticks: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        },
      },
      y: {
        grid: {
          color:
            theme === "dark"
              ? "rgba(75, 85, 99, 0.2)"
              : "rgba(209, 213, 219, 0.5)",
        },
        ticks: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
        backgroundColor:
          theme === "dark" ? "rgba(59, 130, 246, 1)" : "rgba(37, 99, 235, 1)",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-8"
    >
      <div className="container mx-auto px-6 relative">
        <h1 className="text-3xl font-bold mb-6">Account Overview</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Financial Overview</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500 dark:text-gray-400">
                Loading data...
              </p>
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400 text-center">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Balance
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(balanceData.balance)}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Profit
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{formatCurrency(balanceData.profit)}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Margin
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(balanceData.margin)}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Performance Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Performance Overview</h2>
          <div className="h-[350px] w-full">
            <Line data={performanceData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Profit Analysis Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Profit Analysis</h2>
          <div className="h-[350px] w-full">
            <Line data={profitData} options={chartOptions} />
          </div>
        </motion.div>

        {/* TradingView Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">BTC/USD Market Chart</h2>
          <div className="h-[500px] w-full" id="tradingview_chart">
            {!tradingViewLoaded && (
              <div className="h-full w-full flex items-center justify-center">
                <div className="animate-pulse text-blue-500">
                  Loading chart...
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Overview;
