import React, { useState, useEffect, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import VerificationModal from "../components/VerificationModal";
import {
  loginUser,
  verifySignupOtp,
  resendSignupOtp,
} from "../components/API/Api";

const Login = memo(({ setIsAuthenticated }) => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Check for expired sessions
  useEffect(() => {
    const handleRedirect = () => {
      if (localStorage.getItem("authToken") === null) {
        setError("Session expired. Please log in again.");
      }
    };
    window.addEventListener("storage", handleRedirect);
    return () => window.removeEventListener("storage", handleRedirect);
  }, []);

  // Load saved email if remembered
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setLoginData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setLoginData((prev) => ({ ...prev, [name]: value }));
      if (error) setError("");
    },
    [error]
  );

  const validatePassword = useCallback((password) => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (!loginData.email) {
        setError("Please enter your email address");
        return;
      }
      if (!validatePassword(loginData.password)) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await loginUser(loginData);
        if (response.access_token) {
          if (!response.refresh_token) {
            setError("Authentication error: missing refresh token");
            return;
          }

          localStorage.setItem("authToken", response.access_token);
          localStorage.setItem("refreshToken", response.refresh_token);

          // Save email if remember me is checked
          if (rememberMe) {
            localStorage.setItem("rememberedEmail", loginData.email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }

          // Set authenticated user and navigate directly to dashboard
          // We don't show verification modal for login
          setIsAuthenticated(
            { username: response.username },
            response.access_token
          );
          navigate("/dashboard");
        }
      } catch (err) {
        if (err.redirectToLogin) {
          setError("Session expired. Please log in again.");
        } else {
          setError(err.message || "Invalid email or password");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loginData, rememberMe, validatePassword, setIsAuthenticated, navigate]
  );

  const handleVerifyCode = useCallback(
    async (otp) => {
      setIsLoading(true);
      try {
        const response = await verifySignupOtp({ email: loginData.email, otp });
        if (response && response.message) {
          const storedToken = localStorage.getItem("authToken");
          const storedRefreshToken = localStorage.getItem("refreshToken");

          if (!storedToken || !storedRefreshToken) {
            setError("Authentication error after verification");
            setIsVerificationModalOpen(false);
            return;
          }
          setVerificationModalOpen(false);
          navigate("/dashboard");
        } else {
          setError("OTP verification failed.");
        }
      } catch (error) {
        setError(
          "OTP verification failed: " + (error.message || "Unknown error")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [loginData.email, navigate]
  );

  const handleResend = useCallback(async () => {
    setIsLoading(true);
    try {
      await resendSignupOtp({ email: loginData.email });
      return true;
    } catch (error) {
      setError("Error resending OTP: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loginData.email]);

  // const handleDemoLogin = useCallback(() => {
  //   setIsAuthenticated({ username: "demoUser" }, "demoToken");
  //   localStorage.setItem("authToken", "demoToken");
  //   localStorage.setItem("refreshToken", "demoRefreshToken");
  //   navigate("/dashboard");
  // }, [setIsAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('/images/trading-bg.svg')] bg-cover bg-center bg-no-repeat">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={loginData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password (minimum 8 characters)"
                value={loginData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Processing...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          {/* <div className="text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-blue-600 hover:text-blue-800"
            >
              Demo Login (Skip Authentication)
            </button>
          </div> */}
        </form>
      </div>

      {/* Only render verification modal when explicitly opened by other parts of the app */}
      {isVerificationModalOpen && (
        <VerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          onVerify={handleVerifyCode}
          onResend={handleResend}
        />
      )}
    </div>
  );
});

export default Login;
