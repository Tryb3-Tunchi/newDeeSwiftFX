import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../App";
import { motion } from "framer-motion";

const AccountInformation = ({ username }) => {
  const { theme } = useTheme();

  const accountDetails = {
    fullName: username || "User",
    email: "user@example.com",
    phone: "+1 123-456-7890",
    country: "United States",
    address: "123 Main St, City, State, ZIP",
    dateOfBirth: "1990-01-01",
    accountCreated: "2025-01-15",
    kycStatus: "Not Verified",
    lastLogin: "2025-04-26 12:30 PM",
  };

  const recentActivity = [
    { date: "2025-04-26", action: "Logged In", ip: "192.168.1.1", location: "New York, USA" },
    { date: "2025-04-25", action: "Profile Updated", ip: "192.168.1.1", location: "New York, USA" },
  ];

  const paymentMethods = [
    { type: "Bank Account", details: "**** **** **** 1234", added: "2025-02-01" },
    { type: "Credit Card", details: "**** **** **** 5678", added: "2025-03-01" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-8"
    >
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Account Information</h1>
        </div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Full Name</p>
              <p className="text-lg font-medium">{accountDetails.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Email Address</p>
              <p className="text-lg font-medium">{accountDetails.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Phone Number</p>
              <p className="text-lg font-medium">{accountDetails.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Country</p>
              <p className="text-lg font-medium">{accountDetails.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Address</p>
              <p className="text-lg font-medium">{accountDetails.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Date of Birth</p>
              <p className="text-lg font-medium">{accountDetails.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Account Created</p>
              <p className="text-lg font-medium">{accountDetails.accountCreated}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Last Login</p>
              <p className="text-lg font-medium">{accountDetails.lastLogin}</p>
            </div>
          </div>
          <div className="mt-6 text-right">
            <Link
              to="/profile-settings"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition duration-300"
            >
              Edit Profile →
            </Link>
          </div>
        </motion.div>

        {/* KYC Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">KYC Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">{accountDetails.kycStatus}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Complete your KYC to unlock full account features.
              </p>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Start KYC Verification
            </button>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Linked Payment Methods</h2>
          {paymentMethods.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No payment methods linked.
            </p>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-blue-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="text-lg font-medium">{method.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {method.details} • Added on {method.added}
                    </p>
                  </div>
                  <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium transition duration-300">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 text-right">
            <button
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition duration-300"
            >
              Add Payment Method →
            </button>
          </div>
        </motion.div>

        {/* Recent Account Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold mb-4">Recent Account Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No recent activity found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentActivity.map((activity, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {activity.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {activity.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {activity.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {activity.location}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AccountInformation;