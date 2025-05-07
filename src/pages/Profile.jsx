import React, { useState, useEffect } from "react";
import { useTheme } from "../App";
import { motion } from "framer-motion";
import {
  getProfile,
  requestProfileChange,
  verifyProfileChange,
  requestPasswordChange,
  verifyPasswordChange,
} from "../components/API/Api"; // Adjust path as per your project structure

const ProfileSettings = ({ username, setIsAuthenticated }) => {
  const { theme } = useTheme();
  const [userDetails, setUserDetails] = useState({
    firstName: username ? username.split(" ")[0] || "User" : "User",
    lastName: username ? username.split(" ")[1] || "" : "",
    email: "user@example.com",
    phone: "",
    country: "",
    address: "",
    dateOfBirth: "",
    language: "English",
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUserDetails((prev) => ({
          ...prev,
          firstName: profile.new_first_name || username.split(" ")[0] || "User",
          lastName: profile.new_last_name || username.split(" ")[1] || "",
          email: profile.new_email || "user@example.com",
          phone: profile.new_phone_number || "",
          country: profile.country || "",
          address: profile.address || "",
          dateOfBirth: profile.date_of_birth || "",
          language: profile.language || "English",
          notifications: {
            email: profile.notifications?.email ?? true,
            sms: profile.notifications?.sms ?? false,
            push: profile.notifications?.push ?? true,
          },
        }));
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
      }
    };
    fetchProfile();
  }, [username]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
    setError("");
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setUserDetails({
      ...userDetails,
      notifications: { ...userDetails.notifications, [name]: checked },
    });
    setError("");
  };

  const validateProfileFields = () => {
    const { firstName, lastName, phone, email } = userDetails;
    if (!email.trim()) {
      alert("Email is required.");
      return false;
    }
    if (!firstName && !lastName && !phone) {
      alert("At least one of first name, last name, or phone number is required.");
      return false;
    }
    if (firstName && firstName.length < 2) {
      alert("First name must be at least 2 characters.");
      return false;
    }
    if (lastName && lastName.length < 2) {
      alert("Last name must be at least 2 characters.");
      return false;
    }
    if (phone && phone.length < 11) {
      alert("Phone number must be at least 11 characters.");
      return false;
    }
    if (email.length < 8) {
      alert("Email must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const validatePasswordFields = () => {
    const { oldPassword, newPassword, confirmPassword } = userDetails;
    if (!oldPassword.trim()) {
      alert("Old password is required.");
      return false;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      alert("New password and confirm password are required.");
      return false;
    }
    if (newPassword.length < 8 || confirmPassword.length < 8) {
      alert("New password and confirm password must be at least 8 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return false;
    }
    return true;
  };

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!validateProfileFields()) {
      setIsLoading(false);
      return;
    }

    try {
      const profileData = {
        new_first_name: userDetails.firstName || undefined,
        new_last_name: userDetails.lastName || undefined,
        new_phone_number: userDetails.phone || undefined,
        new_email: userDetails.email || undefined,
        password: "", // Optional, can be added if required for security
        country: userDetails.country,
        address: userDetails.address,
        date_of_birth: userDetails.dateOfBirth,
        language: userDetails.language,
        notifications: userDetails.notifications,
      };
      await requestProfileChange(profileData);
      setPendingAction("profile");
      setIsOtpModalOpen(true);
    } catch (err) {
      setError(err.message || "Failed to save personal information.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!validatePasswordFields()) {
      setIsLoading(false);
      return;
    }

    try {
      await requestPasswordChange({
        old_password: userDetails.oldPassword,
        password: userDetails.newPassword,
        new_password: userDetails.newPassword,
        confirm_password: userDetails.confirmPassword,
      });
      setPendingAction("password");
      setIsOtpModalOpen(true);
    } catch (err) {
      setError(err.message || "Failed to initiate password change.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setOtpError("");
    setSuccess("");

    try {
      if (pendingAction === "profile") {
        await verifyProfileChange({ otp });
        setSuccess("Personal information updated successfully!");
      } else if (pendingAction === "password") {
        await verifyPasswordChange({ otp });
        setSuccess("Password changed successfully!");
        setUserDetails({
          ...userDetails,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
      setIsOtpModalOpen(false);
      setOtp("");
      setPendingAction(null);
    } catch (err) {
      setOtpError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsOtpModalOpen(false);
    setOtp("");
    setOtpError("");
    setPendingAction(null);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-8"
    >
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-lg">
            {success}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <form onSubmit={handleSavePersonalInfo}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={userDetails.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  minLength={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={userDetails.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  minLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={userDetails.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  minLength={11}
                  placeholder="+11234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  name="country"
                  value={userDetails.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                >
                  <option value="">Select Country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="India">India</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={userDetails.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={userDetails.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Preferred Language
                </label>
                <select
                  name="language"
                  value={userDetails.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Security Settings</h2>
          <form onSubmit={handleChangePassword}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Old Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={userDetails.oldPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  minLength={1}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={userDetails.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={userDetails.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
            >
              {isLoading ? "Processing..." : "Change Password"}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="email"
                checked={userDetails.notifications.email}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                Email Notifications
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="sms"
                checked={userDetails.notifications.sms}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                SMS Notifications
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="push"
                checked={userDetails.notifications.push}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                Push Notifications
              </span>
            </label>
          </div>
          <button
            onClick={handleSavePersonalInfo}
            disabled={isLoading}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
          >
            {isLoading ? "Saving..." : "Save Preferences"}
          </button>
        </motion.div>

        {isOtpModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Verify OTP
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                An OTP has been sent to your email. Please enter it below to verify your {pendingAction === "profile" ? "profile update" : "password change"}.
              </p>
              {otpError && (
                <div className="mb-4 p-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded">
                  {otpError}
                </div>
              )}
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 text-blue-800 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 mb-4"
                maxLength={6}
                minLength={1}
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || !otp}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileSettings;