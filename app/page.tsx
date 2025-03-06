"use client";
import { useState, useEffect } from "react";

// Define the Market type based on the API response
interface Market {
  id: string;
  name: string;
  base_currency: string;
  quote_currency: string;
  base_precision: number;
  quote_precision: number;
  rfq_enabled: boolean;
  indicative_pricing: boolean;
  base_currency_long: string;
  quote_currency_long: string;
}

interface Currency {
  id: string;
  name: string;
  symbol: string;
  type: string;
  icon_url?: string;
}

interface QuoteResponse {
  market: string;
  side: string;
  from_currency: string;
  from_amount: string;
  to_currency: string;
  to_amount: string;
  rate: string;
  rate_is_from_currency: boolean;
  requested_at: number;
  expires_at: number;
  is_prefunded: boolean;
  sn: string | null;
  message: string | null;
}

export default function Home() {
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [amount, setAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Fetch markets data from our Next.js API route on page load
  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoadingMarkets(true);
      setError(null);
      
      try {
        // Use our Next.js API route instead of calling OVEX directly
        const response = await fetch('/api/markets');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch markets: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setMarkets(data);
      } catch (err) {
        console.error("Error fetching markets:", err);
        setError("Failed to load markets. Please try again later.");
        
        // Fallback to mock data if API call fails
        setMarkets([
          { id: "btcusdt", name: "BTC/USDT", base_currency: "btc", quote_currency: "usdt", base_precision: 8, quote_precision: 6, rfq_enabled: true, indicative_pricing: false, base_currency_long: "Bitcoin", quote_currency_long: "USD Tether" },
          { id: "ethzar", name: "ETH/ZAR", base_currency: "eth", quote_currency: "zar", base_precision: 8, quote_precision: 2, rfq_enabled: true, indicative_pricing: false, base_currency_long: "Ethereum", quote_currency_long: "South African Rands" },
          { id: "btczar", name: "BTC/ZAR", base_currency: "btc", quote_currency: "zar", base_precision: 8, quote_precision: 2, rfq_enabled: true, indicative_pricing: false, base_currency_long: "Bitcoin", quote_currency_long: "South African Rands" },
        ]);
      } finally {
        setIsLoadingMarkets(false);
      }
    };

    const fetchCurrencies = async () => {
      setIsLoadingCurrencies(true);
      
      try {
        // Use our Next.js API route instead of calling OVEX directly
        const response = await fetch('/api/currencies');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch currencies: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setCurrencies(data);
      } catch (err) {
        console.error("Error fetching currencies:", err);
        // We don't need to set an error state for currencies as it's not critical
      } finally {
        setIsLoadingCurrencies(false);
      }
    };

    fetchMarkets();
    fetchCurrencies();
  }, []);

  // Filter markets based on search term
  const filteredMarkets = markets.filter(market => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Search by market name
    if (market.name.toLowerCase().includes(searchTermLower)) {
      return true;
    }
    
    // Search by base currency id or name
    const baseCurrency = currencies.find(c => c.id === market.base_currency);
    if (
      market.base_currency.toLowerCase().includes(searchTermLower) || 
      (baseCurrency && baseCurrency.name.toLowerCase().includes(searchTermLower))
    ) {
      return true;
    }
    
    // Search by quote currency id or name
    const quoteCurrency = currencies.find(c => c.id === market.quote_currency);
    if (
      market.quote_currency.toLowerCase().includes(searchTermLower) || 
      (quoteCurrency && quoteCurrency.name.toLowerCase().includes(searchTermLower))
    ) {
      return true;
    }
    
    return false;
  });

  const handleRequestQuote = async () => {
    if (!selectedMarket || !amount) return;
    
    setIsLoading(true);
    setQuoteError(null);
    
    try {
      // Get the market ID from the selected market name
      const marketObj = markets.find(m => m.name === selectedMarket);
      if (!marketObj) {
        throw new Error("Selected market not found");
      }
      
      const marketId = marketObj.id;
      const sideParam = side.toLowerCase();
      
      // Use our Next.js API route instead of calling OVEX directly
      const apiUrl = `/api/quote?market=${marketId}&from_amount=${amount}&side=${sideParam}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to get quote: ${response.status} ${response.statusText}`);
      }
      
      const quoteData: QuoteResponse = await response.json();
      setQuote(quoteData);
      
      // Calculate time left for expiry
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = quoteData.expires_at;
      const initialTimeLeft = Math.max(0, Math.floor(expiryTime - currentTime));
      
      setTimeLeft(initialTimeLeft);
      
      // Start countdown timer
      if (initialTimeLeft > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    } catch (err) {
      console.error("Error getting quote:", err);
      setQuoteError(err instanceof Error ? err.message : "Failed to get quote");
    } finally {
      setIsLoading(false);
    }
  };


  // Get currency name from id
  const getCurrencyName = (id: string) => {
    const currency = currencies.find(c => c.id === id);
    return currency ? currency.name : id.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Request For Quote</h1>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* Trading Form */}
          <div className="space-y-6">
            {/* Side Selection */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Select Side</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`py-2 px-4 rounded-md text-center ${
                    side === "Buy" 
                      ? "bg-green-600 text-white" 
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                  onClick={() => setSide("Buy")}
                >
                  Buy
                </button>
                <button
                  className={`py-2 px-4 rounded-md text-center ${
                    side === "Sell" 
                      ? "bg-red-600 text-white" 
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                  onClick={() => setSide("Sell")}
                >
                  Sell
                </button>
              </div>
            </div>
            
            {/* Market Selection with Search */}
            <div>
              <label htmlFor="market" className="block text-sm font-medium text-black mb-2">
                Select Market
              </label>
              <div className="relative space-y-2">
                {/* Search input */}
                <input
                  type="text"
                  placeholder="Search by currency name or ID..."
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {isLoadingMarkets || isLoadingCurrencies ? (
                  <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-center text-black">
                    Loading markets...
                  </div>
                ) : error ? (
                  <div className="w-full p-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-center">
                    {error}
                  </div>
                ) : (
                  <select
                    id="market"
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                  >
                    <option value="">Select a market</option>
                    {filteredMarkets.map((market) => {
                      const baseCurrencyName = getCurrencyName(market.base_currency);
                      const quoteCurrencyName = getCurrencyName(market.quote_currency);
                      
                      return (
                        <option key={market.id} value={market.name}>
                          {market.name} - {baseCurrencyName}/{quoteCurrencyName}
                        </option>
                      );
                    })}
                  </select>
                )}
                
                {searchTerm && filteredMarkets.length === 0 && !isLoadingMarkets && !isLoadingCurrencies && (
                  <div className="text-sm text-gray-500 mt-1">
                    No markets found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
            
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-black mb-2">
                Enter Amount
              </label>
              <input
                type="number"
                id="amount"
                placeholder="0.00"
                className="w-full p-2 border border-gray-300 rounded-md text-black"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            {/* Request Quote Button */}
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              onClick={handleRequestQuote}
              disabled={!selectedMarket || !amount || isLoading || isLoadingMarkets}
            >
              {isLoading ? "Requesting..." : "Request Quote"}
            </button>
            
            {quoteError && (
              <div className="p-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-center">
                {quoteError}
              </div>
            )}
          </div>
          
          {/* Quote Display */}
          {quote && (
            <div className="mt-8 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-black">Quote Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-black">Market</p>
                  <p className="font-medium text-black">{quote.market.toUpperCase()}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-black">Side</p>
                  <p className={`font-medium ${quote.side.toLowerCase() === "buy" ? "text-green-600" : "text-red-600"}`}>
                    {quote.side.charAt(0).toUpperCase() + quote.side.slice(1)}
                  </p>
                </div>
                
                {/* Cost of the trade (in the from-currency) */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-black">Cost of Trade ({quote.from_currency.toUpperCase()})</p>
                  <p className="font-medium text-black">{parseFloat(quote.from_amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}</p>
                </div>
                
                {/* Rate (Price per coin in the quote currency of the market) */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-black">Rate (Price per {quote.to_currency.toUpperCase()})</p>
                  <p className="font-medium text-black">
                    {parseFloat(quote.rate).toLocaleString(undefined, { maximumFractionDigits: 8 })} {quote.from_currency.toUpperCase()}
                  </p>
                </div>
                
                {/* The total amount of the asset they will receive */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-black">
                    {quote.side.toLowerCase() === "buy" 
                      ? `You will receive (${quote.to_currency.toUpperCase()})` 
                      : `You will pay (${quote.to_currency.toUpperCase()})`}
                  </p>
                  <p className="font-medium text-black">{parseFloat(quote.to_amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}</p>
                </div>
                
                {/* A countdown of expiry until 'expired' */}
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-black">Expires in</p>
                  <p className={`font-medium ${timeLeft > 10 ? "text-green-600" : "text-red-600"}`}>
                    {timeLeft > 0 ? `${timeLeft} seconds` : "Expired"}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className={`h-2.5 rounded-full ${timeLeft > 10 ? "bg-green-600" : "bg-red-600"}`} 
                      style={{ width: `${(timeLeft / (quote.expires_at - quote.requested_at)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {timeLeft > 0 && !quote.message && (
                <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                  Accept Quote
                </button>
              )}
              
              {quote.message && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                  <p className="font-medium">Note:</p>
                  <p>{quote.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
