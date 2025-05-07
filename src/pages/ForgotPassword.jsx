import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VerificationModal from "../components/VerificationModal";
import { forgotPasswordRequest, verifyForgotPasswordOtp, resendForgotPasswordOtp, setNewPassword } from "../components/API/Api";

const ForgotPassword = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    newPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotPasswordRequest = async () => {
    if (!loginData.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      const response = await forgotPasswordRequest({ email: loginData.email });
      setShowVerification(true);
      setError("");
      setSuccess("A verification code has been sent to your email.");
    } catch (err) {
      if (err.redirectToLogin) {
        navigate("/login");
      } else {
        setError(err.message || "Failed to send reset request. Please try again.");
      }
    }
  };

  const handleVerifyForgotPasswordOtp = async (code) => {
    if (!code) {
      setError("Please enter the OTP");
      return;
    }

    try {
      await verifyForgotPasswordOtp({ email: loginData.email, otp: code });
      setError("");
      setSuccess("OTP verified. You can now set a new password.");
    } catch (err) {
      if (err.redirectToLogin) {
        navigate("/login");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    }
  };

  const handleSetNewPassword = async () => {
    if (!loginData.newPassword) {
      setError("Please enter your new password");
      return;
    }

    try {
      await setNewPassword({ email: loginData.email, new_password: loginData.newPassword });
      setShowVerification(false);
      setSuccess("Password reset successfully. You can now log in.");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.redirectToLogin) {
        navigate("/login");
      } else {
        setError(err.message || "Failed to reset password. Please try again.");
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendForgotPasswordOtp({ email: loginData.email });
      setError("");
      setSuccess("A new verification code has been sent to your email.");
    } catch (err) {
      if (err.redirectToLogin) {
        navigate("/login");
      } else {
        setError(err.message || "Failed to resend OTP. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('/images/trading-bg.svg')] bg-cover bg-center bg-no-repeat">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your account
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {success && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          {!showVerification && (
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={loginData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <button
                  onClick={handleForgotPasswordRequest}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
                >
                  Request OTP
                </button>
              </div>
            </div>
          )}
          {showVerification && (
            <div className="space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="new-password" className="sr-only">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter new password"
                    value={loginData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerifyForgotPasswordOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
};

export default ForgotPassword;