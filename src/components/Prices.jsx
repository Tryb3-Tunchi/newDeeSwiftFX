"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Define type for price data
/** @typedef {{
  symbol: string,
  price: string,
  change: string
}} PriceData */

const PriceTicker = () => {
  // State for price data
  const [priceData, setPriceData] = ([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch price data from CoinGecko and TwelveData APIs
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const symbols = [
          "BTC", "ETH", "BNB", "XRP", "SOL", "ADA", "DOGE", "DOT", "MATIC", "LINK",
          "EUR/USD", "GBP/USD", "JPY/USD", "AUD/USD", "CAD/USD", "CHF/USD", "NZD/USD",
          "SGD/USD", "HKD/USD", "CNY/USD", "INR/USD", "KRW/USD", "TWD/USD", "THB/USD",
          "MXN/USD", "BRL/USD", "ARS/USD", "CLP/USD", "COP/USD", "PEN/USD",
          "SEK/USD", "NOK/USD", "DKK/USD", "PLN/USD", "CZK/USD", "HUF/USD", "RON/USD",
          "ZAR/USD", "TRY/USD", "ILS/USD", "EGP/USD", "AED/USD", "SAR/USD",
        ];

        const cryptoEndpoint = "https://api.coingecko.com/api/v3/simple/price";
        const cryptoResponse = await fetch(
          `${cryptoEndpoint}?ids=bitcoin,ethereum,binancecoin,ripple,solana,cardano,dogecoin,polkadot,polygon,chainlink&vs_currencies=usd&include_24hr_change=true`
        );
        const cryptoData = await cryptoResponse.json();

        const forexRequests = symbols
          .filter(
            (symbol) =>
              !["BTC", "ETH", "BNB", "XRP", "SOL", "ADA", "DOGE", "DOT", "MATIC", "LINK"].includes(symbol)
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
                  change: (Math.random() > 0.5 ? "+" : "-") + (Math.random() * 0.5).toFixed(2) + "%",
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
            change: (cryptoData.bitcoin?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "ETH/USD",
            price: cryptoData.ethereum?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.ethereum?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "BNB/USD",
            price: cryptoData.binancecoin?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.binancecoin?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "XRP/USD",
            price: cryptoData.ripple?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.ripple?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "SOL/USD",
            price: cryptoData.solana?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.solana?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "ADA/USD",
            price: cryptoData.cardano?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.cardano?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "DOGE/USD",
            price: cryptoData.dogecoin?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.dogecoin?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "DOT/USD",
            price: cryptoData.polkadot?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.polkadot?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "MATIC/USD",
            price: cryptoData.polygon?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.polygon?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          {
            symbol: "LINK/USD",
            price: cryptoData.chainlink?.usd?.toFixed(2) || "0.00",
            change: (cryptoData.chainlink?.usd_24h_change?.toFixed(2) || "0.00") + "%",
          },
          ...validForexData,
        ];

        setPriceData(combinedData);
      } catch (error) {
        console.error("Error fetching price data:", error);
        const defaultSymbols = [
          "BTC/USD", "ETH/USD", "BNB/USD", "XRP/USD", "SOL/USD", "ADA/USD", "DOGE/USD", "DOT/USD", "MATIC/USD", "LINK/USD",
          "EUR/USD", "GBP/USD", "JPY/USD", "AUD/USD", "CAD/USD", "CHF/USD", "NZD/USD",
          "SGD/USD", "HKD/USD", "CNY/USD", "INR/USD", "KRW/USD", "TWD/USD", "THB/USD",
          "MXN/USD", "BRL/USD", "ARS/USD", "CLP/USD", "COP/USD", "PEN/USD",
          "SEK/USD", "NOK/USD", "DKK/USD", "PLN/USD", "CZK/USD", "HUF/USD", "RON/USD",
          "ZAR/USD", "TRY/USD", "ILS/USD", "EGP/USD", "AED/USD", "SAR/USD",
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

export default PriceTicker;