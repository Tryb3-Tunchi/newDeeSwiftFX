import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../App";
import { motion } from "framer-motion";

// PriceTicker Component (Integrated Inline)
const PriceTicker = () => {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const symbols = [
          "BTC",
          "ETH",
          "BNB",
          "XRP",
          "SOL",
          "ADA",
          "DOGE",
          "DOT",
          "MATIC",
          "LINK",
          "EUR/USD",
          "GBP/USD",
          "JPY/USD",
          "AUD/USD",
          "CAD/USD",
          "CHF/USD",
          "NZD/USD",
          "SGD/USD",
          "HKD/USD",
          "CNY/USD",
          "INR/USD",
          "KRW/USD",
          "TWD/USD",
          "THB/USD",
          "MXN/USD",
          "BRL/USD",
          "ARS/USD",
          "CLP/USD",
          "COP/USD",
          "PEN/USD",
          "SEK/USD",
          "NOK/USD",
          "DKK/USD",
          "PLN/USD",
          "CZK/USD",
          "HUF/USD",
          "RON/USD",
          "ZAR/USD",
          "TRY/USD",
          "ILS/USD",
          "EGP/USD",
          "AED/USD",
          "SAR/USD",
        ];

        const cryptoEndpoint = "https://api.coingecko.com/api/v3/simple/price";
        const cryptoResponse = await fetch(
          `${cryptoEndpoint}?ids=bitcoin,ethereum,binancecoin,ripple,solana,cardano,dogecoin,polkadot,polygon,chainlink&vs_currencies=usd&include_24hr_change=true`
        );
        const cryptoData = await cryptoResponse.json();

        const forexRequests = symbols
          .filter(
            (symbol) =>
              ![
                "BTC",
                "ETH",
                "BNB",
                "XRP",
                "SOL",
                "ADA",
                "DOGE",
                "DOT",
                "MATIC",
                "LINK",
              ].includes(symbol)
          )
          .map((symbol) =>
            fetch(
              `https://api.twelvedata.com/price?symbol=${symbol}&apikey=ac56b30d361643d9b722e4d23b98b19a`
            )
              .then((response) => response.json())
              .then((data) => {
                if (data.status === "error") {
                  throw new Error(data.message);
                }
                return {
                  symbol,
                  price: parseFloat(data.price).toFixed(4),
                  change:
                    (Math.random() > 0.5 ? "+" : "-") +
                    (Math.random() * 0.5).toFixed(2) +
                    "%",
                };
              })
              .catch(() => null)
          );

        const forexResults = await Promise.all(forexRequests);
        const validForexData = forexResults.filter((result) => result !== null);

        const combinedData = [
          {
            symbol: "BTC/USD",
            price: cryptoData.bitcoin?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.bitcoin?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "ETH/USD",
            price: cryptoData.ethereum?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.ethereum?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "BNB/USD",
            price: cryptoData.binancecoin?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.binancecoin?.usd_24h_change?.toFixed(2) || "0.00") +
              "%",
          },
          {
            symbol: "XRP/USD",
            price: cryptoData.ripple?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.ripple?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "SOL/USD",
            price: cryptoData.solana?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.solana?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "ADA/USD",
            price: cryptoData.cardano?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.cardano?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "DOGE/USD",
            price: cryptoData.dogecoin?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.dogecoin?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "DOT/USD",
            price: cryptoData.polkadot?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.polkadot?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "MATIC/USD",
            price: cryptoData.polygon?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.polygon?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "LINK/USD",
            price: cryptoData.chainlink?.usd?.toFixed(2) || "0.00",
            change:
              (cryptoData.chainlink?.usd_24h_change?.toFixed(2) || "0.00") +
              "%",
          },
          ...validForexData,
        ];

        setPriceData(combinedData);
      } catch (error) {
        console.error("Error fetching price data:", error);
        const defaultSymbols = [
          "BTC/USD",
          "ETH/USD",
          "BNB/USD",
          "XRP/USD",
          "SOL/USD",
          "ADA/USD",
          "DOGE/USD",
          "DOT/USD",
          "MATIC/USD",
          "LINK/USD",
          "EUR/USD",
          "GBP/USD",
          "JPY/USD",
          "AUD/USD",
          "CAD/USD",
          "CHF/USD",
          "NZD/USD",
          "SGD/USD",
          "HKD/USD",
          "CNY/USD",
          "INR/USD",
          "KRW/USD",
          "TWD/USD",
          "THB/USD",
          "MXN/USD",
          "BRL/USD",
          "ARS/USD",
          "CLP/USD",
          "COP/USD",
          "PEN/USD",
          "SEK/USD",
          "NOK/USD",
          "DKK/USD",
          "PLN/USD",
          "CZK/USD",
          "HUF/USD",
          "RON/USD",
          "ZAR/USD",
          "TRY/USD",
          "ILS/USD",
          "EGP/USD",
          "AED/USD",
          "SAR/USD",
        ];
        setPriceData(
          defaultSymbols.map((symbol) => ({
            symbol,
            price: "0.00",
            change: "0.00%",
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
    const intervalId = setInterval(fetchPriceData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full bg-black/50 py-2 sm:py-3 overflow-hidden">
      {loading ? (
        <div className="text-white text-center text-sm sm:text-base">
          Loading market data...
        </div>
      ) : (
        <motion.div
          className="flex space-x-3 sm:space-x-4"
          animate={{ x: [0, -1000] }}
          transition={{
            x: {
              duration: 12,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            },
          }}
        >
          {[...priceData, ...priceData, ...priceData].map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2"
            >
              <span className="font-bold text-white text-xs sm:text-sm">
                {item.symbol}
              </span>
              <span className="text-white text-xs sm:text-sm">
                {item.symbol.includes("USD") ? "$" : ""}
                {item.price}
              </span>
              <span
                className={`px-1 py-0.5 rounded-full text-xs sm:text-sm ${
                  item.change.startsWith("+")
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {item.change}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// Navbar Component
const Navbar = ({ isAuthenticated, setIsAuthenticated, username }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <nav className="bg-white dark:bg-gray-900 text-blue-800 dark:text-blue-300 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="text-2xl font-bold flex items-center"
          >
            <span className="text-blue-600 dark:text-blue-400 mr-1">Dee</span>
            Swift Trade
          </Link>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex space-x-6">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/withdraw"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Withdraw
                  </Link>
                  <Link
                    to="/deposit"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Deposit
                  </Link>
                  <Link
                    to="/account-information"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Account
                  </Link>
                  <Link
                    to="/profile-settings"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Settings
                  </Link>
                  <Link
                    to="/trade-history"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Trade History
                  </Link>
                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Logout
                  </button>
                  <button
                    className="text-blue-800 dark:text-blue-300 focus:outline-none z-50"
                    onClick={toggleSidebar}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={
                          isSidebarOpen
                            ? "M6 18L18 6M6 6l12 12"
                            : "M4 6h16M4 12h16M4 18h16"
                        }
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Home
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    How It Works
                  </Link>
                  <Link
                    to="/faq"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/about"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    About
                  </Link>
                  <Link
                    to="/login"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
            <button
              className="lg:hidden text-blue-800 dark:text-blue-300 focus:outline-none z-50"
              onClick={toggleMobileMenu}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar for Authenticated Users (Desktop and Mobile) */}
        {isAuthenticated && (
          <>
            <div
              className={`fixed top-0 left-0 h-full w-64 bg-blue-50 dark:bg-gray-800 text-blue-800 dark:text-blue-300 transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out z-40 shadow-2xl lg:w-64 lg:top-0 lg:h-screen`}
            >
              <div className="flex flex-col p-6 space-y-4 mt-16">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-blue-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-bold">
                      Hi, {username || "User"}!
                    </h2>
                    <button
                      onClick={() => {
                        setIsAuthenticated(false);
                        toggleSidebar();
                      }}
                      className="text-sm hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
                <Link
                  to="/overview"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Overview
                </Link>
                <Link
                  to="/copy-trader"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Copy Trader
                </Link>
                <Link
                  to="/portfolio"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Portfolio
                </Link>
                <Link
                  to="/trade-history"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Trade History
                </Link>
                <Link
                  to="/packages"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Packages
                </Link>
                <Link
                  to="/deposit"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Deposit
                </Link>
                <Link
                  to="/withdraw"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Withdraw
                </Link>
                <Link
                  to="/transfer-asset"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Transfer Asset
                </Link>
                <Link
                  to="/account-information"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Account
                </Link>
                <Link
                  to="/profile-settings"
                  onClick={toggleSidebar}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    toggleSidebar();
                  }}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out text-left"
                >
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </button>
              </div>
            </div>
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-60 z-30"
                onClick={toggleSidebar}
              />
            )}
          </>
        )}

        {/* Mobile Menu (Unauthenticated Users) */}
        <div
          className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-blue-50 dark:bg-gray-800 text-blue-800 dark:text-blue-300 transform ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-40 shadow-2xl`}
        >
          <div className="flex flex-col p-6 space-y-4 mt-16">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Dashboard
                </Link>
                <Link
                  to="/withdraw"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Withdraw
                </Link>
                <Link
                  to="/deposit"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Deposit
                </Link>
                <Link
                  to="/account-information"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Account
                </Link>
                <Link
                  to="/profile-settings"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Settings
                </Link>
                <Link
                  to="/trade-history"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Trade History
                </Link>
                <Link
                  to="/packages"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Packages
                </Link>
                <Link
                  to="/transfer-asset"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Transfer Asset
                </Link>
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    toggleMobileMenu();
                  }}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Home
                </Link>
                <Link
                  to="/how-it-works"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  How It Works
                </Link>
                <Link
                  to="/faq"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  FAQ
                </Link>
                <Link
                  to="/about"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  About
                </Link>
                <Link
                  to="/login"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out"
                >
                  Register
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={() => {
                  toggleTheme();
                  toggleMobileMenu();
                }}
                className="px-4 py-3 rounded-xl text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-300 ease-in-out text-left"
              >
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            )}
          </div>
        </div>
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-30"
            onClick={toggleMobileMenu}
          />
        )}
      </nav>

      {/* Price Ticker Below Navbar */}
      <PriceTicker />
    </div>
  );
};

export default Navbar;
