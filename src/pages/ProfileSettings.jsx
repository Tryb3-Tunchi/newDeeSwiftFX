import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../App";
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

const ProfileSettings = ({ username }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: "zoeyferge@gmail.com",
    phone: "",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    twoFactorEnabled: true,
    language: "en",
    currency: "USD",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated settings:", formData);
    // TODO: Implement settings update logic
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900 py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="mt-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <UserCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Profile Information
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Email Notifications
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNotificationChange("email")}
                    className={`${
                      formData.notifications.email
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                  >
                    <span
                      className={`${
                        formData.notifications.email
                          ? "translate-x-5"
                          : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Push Notifications
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNotificationChange("push")}
                    className={`${
                      formData.notifications.push
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                  >
                    <span
                      className={`${
                        formData.notifications.push
                          ? "translate-x-5"
                          : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    SMS Notifications
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNotificationChange("sms")}
                    className={`${
                      formData.notifications.sms
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                  >
                    <span
                      className={`${
                        formData.notifications.sms
                          ? "translate-x-5"
                          : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Security
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <KeyIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Two-Factor Authentication
                      </span>
                    </div>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          twoFactorEnabled: !prev.twoFactorEnabled,
                        }))
                      }
                      className={`${
                        formData.twoFactorEnabled
                          ? "bg-blue-600"
                          : "bg-gray-200 dark:bg-gray-700"
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                    >
                      <span
                        className={`${
                          formData.twoFactorEnabled
                            ? "translate-x-5"
                            : "translate-x-0"
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </motion.button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Preferences
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;