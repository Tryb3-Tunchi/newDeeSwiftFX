import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getBalance, getAccountSummary, getTransactions } from "../API/Api";

const BalanceContext = createContext({
  balances: [],
  balance: null,
  accountSummary: { profit_loss: 0, margin: 0, opened_position: 0 },
  transactions: [],
  updateBalance: () => {},
  refreshBalances: () => Promise.resolve(),
  createDeposit: () => Promise.resolve(),
  verifyDeposit: () => Promise.resolve(),
  getRecentTransactions: () => [],
  isLoading: false,
  error: null,
  redirectToLogin: false,
  lastUpdated: null,
});

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;
// Stale while revalidate - show cached data while fetching new data
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};

export const BalanceProvider = ({ children }) => {
  const [balances, setBalances] = useState([]);
  const [balance, setBalance] = useState(null);
  const [accountSummary, setAccountSummary] = useState({
    profit_loss: 0,
    margin: 0,
    opened_position: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataCache, setDataCache] = useState(() => {
    // Initialize from localStorage if available
    try {
      const cachedData = localStorage.getItem("balanceDataCache");
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (err) {
      console.error("Failed to load cached balance data:", err);
    }
    return {
      timestamp: 0,
      balanceData: null,
      summaryData: null,
      transactionData: null,
    };
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const loadCachedData = () => {
      // Load transactions
      try {
        const savedTransactions = localStorage.getItem("transactions");
        if (savedTransactions) {
          const parsed = JSON.parse(savedTransactions);
          const formatted = parsed.map((tx) => ({
            ...tx,
            timestamp: new Date(tx.timestamp || tx.date),
            date: tx.date || new Date(tx.timestamp).toISOString(),
          }));
          setTransactions(formatted);
        }
      } catch (err) {
        console.error("Failed to load transactions from localStorage:", err);
      }

      // Apply cached data if it's still valid
      if (dataCache.timestamp) {
        const now = Date.now();
        if (now - dataCache.timestamp < CACHE_EXPIRATION) {
          if (dataCache.balanceData) {
            const processedBalances = Array.isArray(dataCache.balanceData)
              ? dataCache.balanceData
              : [dataCache.balanceData];
            setBalances(processedBalances);
            if (processedBalances.length > 0) {
              setBalance(processedBalances[0]);
            }
          }

          if (dataCache.summaryData) {
            setAccountSummary(dataCache.summaryData);
          }

          setLastUpdated(new Date(dataCache.timestamp));
        }
      }

      setIsInitialLoad(false);
    };

    loadCachedData();
  }, []);

  // Save transactions to localStorage with debounce
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (transactions.length > 0) {
        localStorage.setItem("transactions", JSON.stringify(transactions));
      }
    }, 500); // Increased debounce time to 500ms

    return () => clearTimeout(saveTimeout);
  }, [transactions]);

  // Manually update balances
  const updateBalance = useCallback((newBalances) => {
    setBalances(newBalances);
    if (newBalances.length > 0) {
      setBalance(newBalances[0]);
    }
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    const now = Date.now();
    return dataCache.timestamp && now - dataCache.timestamp < CACHE_EXPIRATION;
  }, [dataCache.timestamp]);

  // Check if we should show stale data while revalidating
  const shouldUseStaleData = useCallback(() => {
    const now = Date.now();
    return dataCache.timestamp && now - dataCache.timestamp < STALE_TIME;
  }, [dataCache.timestamp]);

  // Fetch all data (balances, account summary, transactions)
  const refreshBalances = useCallback(
    async (forceRefresh = false) => {
      // Return if cache is valid and not forcing refresh
      if (!forceRefresh && isCacheValid()) {
        return;
      }

      // Use stale data while fetching fresh data
      const useStaleData = shouldUseStaleData();

      if (!useStaleData) {
        setIsLoading(true);
      }

      setError(null);
      setRedirectToLogin(false);

      try {
        const fetchPromises = [
          getBalance().catch((err) => {
            console.error("Failed to fetch balance:", err);
            return dataCache.balanceData || null;
          }),
          getAccountSummary().catch((err) => {
            console.error("Failed to fetch account summary:", err);
            return (
              dataCache.summaryData || {
                profit_loss: 0,
                margin: 0,
                opened_position: 0,
              }
            );
          }),
          getTransactions().catch((err) => {
            console.error("Failed to fetch transactions:", err);
            return (
              dataCache.transactionData || { deposits: [], withdrawals: [] }
            );
          }),
        ];

        // Use Promise.allSettled to handle partial failures better
        const results = await Promise.allSettled(fetchPromises);
        const [balanceResult, summaryResult, transactionResult] = results;

        // Process successful results
        const balanceData =
          balanceResult.status === "fulfilled"
            ? balanceResult.value
            : dataCache.balanceData;
        const summaryData =
          summaryResult.status === "fulfilled"
            ? summaryResult.value
            : dataCache.summaryData;
        const transactionData =
          transactionResult.status === "fulfilled"
            ? transactionResult.value
            : dataCache.transactionData;

        // Update cache timestamp
        const now = Date.now();
        setLastUpdated(new Date(now));

        // Process balance data
        if (balanceData) {
          const processedBalances = Array.isArray(balanceData)
            ? balanceData
            : [balanceData];
          const balancesWithCurrency = processedBalances.map((bal) => ({
            ...bal,
            currency: bal.currency || "USD",
          }));
          setBalances(balancesWithCurrency);
          if (balancesWithCurrency.length > 0) {
            setBalance(balancesWithCurrency[0]);
          }
        }

        // Process account summary
        if (summaryData) {
          setAccountSummary({
            profit_loss: summaryData.profit_loss || 0,
            margin: summaryData.margin || 0,
            opened_position: summaryData.opened_position || 0,
          });
        }

        // Process transactions
        if (transactionData) {
          const combinedTransactions = [
            ...transactionData.deposits.map((deposit) => ({
              id: deposit.id.toString(),
              type: "Deposit",
              amount: deposit.amount,
              status: deposit.status || "completed",
              timestamp: new Date(deposit.created_at),
              date: deposit.created_at,
              method: deposit.method || "Unknown",
            })),
            ...transactionData.withdrawals.map((withdrawal) => ({
              id: withdrawal.id.toString(),
              type: "Withdrawal",
              amount: -withdrawal.amount,
              status: withdrawal.status || "completed",
              timestamp: new Date(withdrawal.created_at),
              date: withdrawal.created_at,
              recipient_email: withdrawal.recipient_email || null,
              method: withdrawal.method || "Unknown",
            })),
          ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setTransactions(combinedTransactions);
        }

        // Update the cache with new data
        const newCache = {
          timestamp: now,
          balanceData,
          summaryData,
          transactionData,
        };

        setDataCache(newCache);

        // Save cache to localStorage
        localStorage.setItem("balanceDataCache", JSON.stringify(newCache));
      } catch (err) {
        if (err.redirectToLogin) {
          setRedirectToLogin(true);
        } else {
          setError(err.message || "Failed to fetch balance data");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [dataCache, isCacheValid, shouldUseStaleData]
  );

  // Create a new deposit - memoized to prevent recreation on each render
  const createDeposit = useCallback(
    async (amount, method, cryptoType) => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate deposit creation (since original API doesn't have this endpoint)
        const depositResponse = await getBalance();
        const depositId = Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase();
        const newTransaction = {
          id: depositId,
          type: "Deposit",
          amount: amount,
          method: method,
          cryptoType: cryptoType || undefined,
          status: "processing",
          timestamp: new Date(),
          date: new Date().toISOString(),
        };
        setTransactions((prev) => [newTransaction, ...prev]);
        await refreshBalances();
        return { depositResponse, transaction: newTransaction };
      } catch (err) {
        setError(err.message || "Could not create deposit. Please try again.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshBalances]
  );

  // Verify a deposit - memoized to prevent recreation on each render
  const verifyDeposit = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate verification
        const verifiedDeposit = await getBalance();
        if (verifiedDeposit) {
          await refreshBalances();
        }
      } catch (err) {
        setError(err.message || "Could not verify deposit. Please try again.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshBalances]
  );

  // Get recent transactions (last 6 hours) - memoized to prevent recalculation on every render
  const getRecentTransactions = useCallback(() => {
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    return transactions.filter((tx) => new Date(tx.timestamp) >= sixHoursAgo);
  }, [transactions]);

  // Initial data fetch
  useEffect(() => {
    if (isInitialLoad) {
      refreshBalances();
    }

    // Set up interval for periodic refresh (reduced from 12 hours to 30 minutes)
    const intervalId = setInterval(() => {
      refreshBalances();
    }, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refreshBalances, isInitialLoad]);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(
    () => ({
      balances,
      balance,
      accountSummary,
      transactions,
      updateBalance,
      refreshBalances,
      createDeposit,
      verifyDeposit,
      getRecentTransactions,
      isLoading,
      error,
      redirectToLogin,
      lastUpdated,
    }),
    [
      balances,
      balance,
      accountSummary,
      transactions,
      updateBalance,
      refreshBalances,
      createDeposit,
      verifyDeposit,
      getRecentTransactions,
      isLoading,
      error,
      redirectToLogin,
      lastUpdated,
    ]
  );

  return (
    <BalanceContext.Provider value={contextValue}>
      {children}
    </BalanceContext.Provider>
  );
};
