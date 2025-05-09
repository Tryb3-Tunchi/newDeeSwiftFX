import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VerificationModal from "../components/VerificationModal";
import {
  signupUser,
  verifySignupOtp,
  resendSignupOtp,
} from "../components/API/Api";
const Register = ({ setIsAuthenticated }) => {
  const [signupData, setSignupData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    verify_password: "",
    agreedToTerms: false,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showVerification, setShowVerification] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateSignupForm = () => {
    const errors = {};
    let isValid = true;

    if (!signupData.first_name.trim()) {
      errors.first_name = "First name is required";
      isValid = false;
    }

    if (!signupData.last_name.trim()) {
      errors.last_name = "Last name is required";
      isValid = false;
    }

    if (!signupData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(signupData.email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!signupData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
      isValid = false;
    }

    if (!signupData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (signupData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!signupData.verify_password) {
      errors.verify_password = "Please confirm your password";
      isValid = false;
    } else if (signupData.password !== signupData.verify_password) {
      errors.verify_password = "Passwords do not match";
      isValid = false;
    }

    if (!signupData.agreedToTerms) {
      errors.agreedToTerms = "You must agree to the Terms and Conditions";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateSignupForm()) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await signupUser(signupData);
      if (response && response.message) {
        setShowVerification(true);
      } else {
        setError("Signup failed.");
      }
    } catch (err) {
      if (err.redirectToLogin) {
        navigate("/login");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async (otp) => {
    setIsProcessing(true);
    try {
      const response = await verifySignupOtp({ email: signupData.email, otp });
      if (response && response.access_token) {
        if (!response.refresh_token) {
          setError("Authentication error: missing refresh token");
          setIsProcessing(false);
          return;
        }

        localStorage.setItem("authToken", response.access_token);
        localStorage.setItem("refreshToken", response.refresh_token);

        setIsAuthenticated(
          { username: response.username },
          response.access_token
        );
        setShowVerification(false);
        navigate("/dashboard");
      } else {
        setError("OTP verification failed");
      }
    } catch (err) {
      if (err.redirectToLogin) {
        navigate("/login");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendOtp = async () => {
    setIsProcessing(true);
    try {
      await resendSignupOtp({ email: signupData.email });
      setError("");
      alert("A new OTP has been sent to your email.");
    } catch (err) {
      if (err.redirectToLogin) {
        navigate("/login");
      } else {
        setError(err.message || "Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('/images/trading-bg.svg')] bg-cover bg-center bg-no-repeat">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="sr-only">
                  First name
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first-name"
                  autoComplete="given-name"
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    fieldErrors.first_name
                      ? "border-red-500"
                      : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="First name"
                  value={signupData.first_name}
                  onChange={handleSignupChange}
                  required
                />
                {fieldErrors.first_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.first_name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="last-name" className="sr-only">
                  Last name
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last-name"
                  autoComplete="family-name"
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    fieldErrors.last_name ? "border-red-500" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Last name"
                  value={signupData.last_name}
                  onChange={handleSignupChange}
                  required
                />
                {fieldErrors.last_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.last_name}
                  </p>
                )}
              </div>
            </div>
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
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  fieldErrors.email ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={signupData.email}
                onChange={handleSignupChange}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone number
              </label>
              <input
                id="phone"
                name="phone_number"
                type="tel"
                autoComplete="tel"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  fieldErrors.phone_number
                    ? "border-red-500"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Phone number"
                value={signupData.phone_number}
                onChange={handleSignupChange}
              />
              {fieldErrors.phone_number && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.phone_number}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  fieldErrors.password ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Password (8 characters at least)"
                value={signupData.password}
                onChange={handleSignupChange}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="verify-password" className="sr-only">
                Confirm password
              </label>
              <input
                id="verify-password"
                name="verify_password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  fieldErrors.verify_password
                    ? "border-red-500"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm password"
                value={signupData.verify_password}
                onChange={handleSignupChange}
              />
              {fieldErrors.verify_password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.verify_password}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agreed-to-terms"
              name="agreedToTerms"
              type="checkbox"
              checked={signupData.agreedToTerms}
              onChange={handleSignupChange}
              className={`h-4 w-4 ${
                fieldErrors.agreedToTerms ? "border-red-500" : "border-gray-300"
              } text-blue-600 focus:ring-blue-500 rounded`}
            />
            <label
              htmlFor="agreed-to-terms"
              className={`ml-2 block text-sm ${
                fieldErrors.agreedToTerms ? "text-red-500" : "text-gray-900"
              }`}
            >
              I agree to the Terms and Conditions
            </label>
          </div>
          {fieldErrors.agreedToTerms && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.agreedToTerms}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isProcessing}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 0 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing Up...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          {/* <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated({ username: "demoUser" }, "demoToken");
                localStorage.setItem("refreshToken", "demoRefreshToken");
                navigate("/dashboard");
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Demo Register (Skip Registration)
            </button>
          </div> */}
        </form>
      </div>
      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerify}
        onResend={handleResendOtp}
      />
    </div>
  );
};

export default Register;
