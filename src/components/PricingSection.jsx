import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PricingSection = () => {
  const [prices, setPrices] = useState({
    bitcoin: { price: 0, change24h: 0 },
    ethereum: { price: 0, change24h: 0 },
    binancecoin: { price: 0, change24h: 0 },
    ripple: { price: 0, change24h: 0 },
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple&vs_currencies=usd&include_24hr_change=true"
        );
        const data = await response.json();
        setPrices({
          bitcoin: {
            price: data.bitcoin.usd,
            change24h: data.bitcoin.usd_24h_change,
          },
          ethereum: {
            price: data.ethereum.usd,
            change24h: data.ethereum.usd_24h_change,
          },
          binancecoin: {
            price: data.binancecoin.usd,
            change24h: data.binancecoin.usd_24h_change,
          },
          ripple: {
            price: data.ripple.usd,
            change24h: data.ripple.usd_24h_change,
          },
        });
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change) => {
    return change?.toFixed(2) || "0.00";
  };

  const cryptoCards = [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", icon: "₿" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "Ξ" },
    { id: "binancecoin", name: "Binance Coin", symbol: "BNB", icon: "BNB" },
    { id: "ripple", name: "Ripple", symbol: "XRP", icon: "XRP" },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Live Cryptocurrency Prices
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track real-time cryptocurrency prices and market movements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cryptoCards.map((crypto) => (
            <motion.div
              key={crypto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-cente ">
                    <span className="text-xl mr-2">{crypto.icon}</span>
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {crypto.name}
                      </h3>
                      <p className="text-sm text-gray-500">{crypto.symbo}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatPrice(prices[crypto.id]?.price || 0)}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      prices[crypto.id]?.change24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {prices[crypto.id]?.change24h >= 0 ? "↑" : "↓"}{" "}
                    {formatChange(prices[crypto.id]?.change24h)}%
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Data provided by CoinGecko API. Prices update every minute.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
