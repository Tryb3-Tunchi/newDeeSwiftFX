import React from "react";

const TradingViewSection = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Live Market Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay informed with real-time market data and professional-grade
            charts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BTC/USD TradingView Widget */}
          <div className="w-full h-[400px] bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="tradingview-widget-container h-full">
              <iframe
                title="Bitcoin Chart"
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_b9b8d&symbol=BITSTAMP%3ABTCUSD&interval=D&hidesidetoolbar=0&hidetrading=1&theme=light&save_image=false&toolbarbg=f1f3f6&studies=[]&hideideas=1&widgetType=chart&referral_id=27795&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BITSTAMP%3ABTCUSD"
                className="w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          </div>

          {/* ETH/USD TradingView Widget */}
          <div className="w-full h-[400px] bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="tradingview-widget-container h-full">
              <iframe
                title="Ethereum Chart"
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_b9b8e&symbol=BITSTAMP%3AETHUSD&interval=D&hidesidetoolbar=0&hidetrading=1&theme=light&save_image=false&toolbarbg=f1f3f6&studies=[]&hideideas=1&widgetType=chart&referral_id=27795&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BITSTAMP%3AETHUSD"
                className="w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg">
            Access professional-grade charts and technical analysis tools to
            make informed trading decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradingViewSection;
