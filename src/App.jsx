import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
  memo,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Pages
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Withdraw from "./pages/Withdraw";
import Deposit from "./pages/Deposit";
import AccountInformation from "./pages/AccountInfo";
import ProfileSettings from "./pages/Profile";
import TradeHistory from "./pages/TradeHistory";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import TransferAsset from "./pages/TransferAsset";
import Portfolio from "./pages/Portfolio";
import Overview from "./pages/Overview";
import CopyTrader from "./pages/CopyTrading";
import Market from "./pages/Market";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectRoute";
import { BalanceProvider } from "./components/Context/BalanceContext";
import { logoutUser } from "./components/API/Api";
import InvestmentPackages from "./pages/Packages";

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
    this.setState({
      errorMessage: error.message || "An unexpected error occurred",
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
            <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Memoized routes component to prevent unnecessary re-renders
const AppRoutes = memo(
  ({ isAuthenticated, username, handleAuth, handleLogout }) => (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/about" element={<About />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login setIsAuthenticated={handleAuth} />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register setIsAuthenticated={handleAuth} />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <ForgotPassword />
          )
        }
      />
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route path="/dashboard" element={<Dashboard username={username} />} />
        <Route path="/withdraw" element={<Withdraw username={username} />} />
        <Route path="/deposit" element={<Deposit username={username} />} />
        <Route
          path="/account-information"
          element={<AccountInformation username={username} />}
        />
        <Route
          path="/profile-settings"
          element={<ProfileSettings username={username} />}
        />
        <Route
          path="/trade-history"
          element={<TradeHistory username={username} />}
        />
        <Route
          path="/packages"
          element={<InvestmentPackages username={username} />}
        />
        <Route
          path="/transfer-asset"
          element={<TransferAsset username={username} />}
        />
        <Route path="/portfolio" element={<Portfolio username={username} />} />
        <Route path="/overview" element={<Overview username={username} />} />
        <Route path="/market" element={<Market username={username} />} />
        <Route
          path="/copy-trader"
          element={<CopyTrader username={username} />}
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
);

function App() {
  // Initialize state from localStorage to avoid flash of unauthenticated content
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("authToken");
    const storedUsername = localStorage.getItem("username");
    return Boolean(token && storedUsername);
  });

  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || ""
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  // Apply theme changes to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Toggle theme function - memoized
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, [theme]);

  // Handle authentication - memoized
  const handleAuth = useCallback(async (user, token) => {
    try {
      setIsAuthenticated(true);
      setUsername(user.username);
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", user.username);
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Authentication failed. Please try again.";
      setError(errorMessage);
      setShowError(true);
      console.error("Auth error:", errorMessage);
    }
  }, []);

  // Handle logout - memoized
  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
      clearAuthState();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Logout failed, but you have been signed out.";
      setError(errorMessage);
      setShowError(true);
      console.error("Logout error:", errorMessage);
      clearAuthState();
    }
  }, []);

  // Clear authentication state - memoized
  const clearAuthState = useCallback(() => {
    setIsAuthenticated(false);
    setUsername("");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("isAuthenticated");
  }, []);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
      const storedUsername = localStorage.getItem("username");
      if (!token || !storedUsername) {
        clearAuthState();
        return;
      }

      // Keep user authenticated using stored credentials
      setIsAuthenticated(true);
      setUsername(storedUsername);
    };
    validateToken();
  }, [clearAuthState]);

  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (showError && error) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showError, error]);

  // Create memoized theme context value to prevent unnecessary re-renders
  const themeContextValue = useMemo(() => {
    return { theme, toggleTheme };
  }, [theme, toggleTheme]);

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={themeContextValue}>
        <BalanceProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
              {showError && error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 mx-6 mt-4 rounded-lg shadow-md">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                    <button
                      onClick={() => setShowError(false)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <Navbar
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={handleLogout}
                username={username}
              />
              <main className="flex-grow">
                <AppRoutes
                  isAuthenticated={isAuthenticated}
                  username={username}
                  handleAuth={handleAuth}
                  handleLogout={handleLogout}
                />
              </main>
              <Footer />
            </div>
          </Router>
        </BalanceProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
