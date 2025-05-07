import axios from "axios";

const API_URL = "https://brokerapp.pythonanywhere.com";

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];
let lastValidationTime = 0;
const VALIDATION_CACHE_TIME = 60000; // Only validate token once per minute

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Validate token by making a simple authenticated request
const validateToken = async (token) => {
  // Skip validation if we've validated recently
  const now = Date.now();
  if (now - lastValidationTime < VALIDATION_CACHE_TIME) {
    return true;
  }

  try {
    await apiClient.get("/auth/profile/", {
      headers: { Authorization: `JWT ${token}` },
    });
    lastValidationTime = now;
    return true;
  } catch (error) {
    return false;
  }
};

// Add a request interceptor to attach the auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("authToken");
    if (token) {
      // Skip validation for specific endpoints to prevent circular dependencies
      const skipValidation = [
        "/auth/login/",
        "/auth/token/refresh/",
        "/auth/profile/",
      ];

      if (!skipValidation.some((path) => config.url.includes(path))) {
        // Validate token before making the request
        const isValid = await validateToken(token);
        if (!isValid) {
          throw new Error("Invalid token detected. Please log in again.");
        }
      }

      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (response) {
      // Handle authentication errors with specific messages
      if (response.status === 401) {
        if (originalRequest.url.includes("/auth/login/")) {
          // Handle login errors specifically
          let errorMessage = "Authentication failed";
          if (response.data) {
            if (
              response.data.detail ===
              "No active account found with the given credentials"
            ) {
              errorMessage =
                "Email not found. Please check your email or sign up.";
            } else if (response.data.detail === "Invalid password") {
              errorMessage = "Invalid password. Please try again.";
            } else {
              errorMessage = response.data.detail || errorMessage;
            }
          }
          return Promise.reject(new Error(errorMessage));
        }

        // Handle token refresh cases
        if (!originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `JWT ${token}`;
                return apiClient(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              throw new Error(
                "No refresh token available. Please log in again."
              );
            }
            const { data } = await axios.post(
              `${API_URL}/auth/token/refresh/`,
              { refresh_token: refreshToken }
            );
            const newAccessToken = data.access_token;
            const newRefreshToken = data.refresh_token || refreshToken; // Use old refresh token if new one isn't provided
            localStorage.setItem("authToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            originalRequest.headers.Authorization = `JWT ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return apiClient(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("username");
            return Promise.reject({ ...error, redirectToLogin: true });
          } finally {
            isRefreshing = false;
          }
        }
      } else if (response.status === 403) {
        return Promise.reject(
          new Error(
            "Forbidden: You do not have permission to perform this action."
          )
        );
      } else if (response.status === 429) {
        return Promise.reject(
          new Error("Too Many Requests: Please try again later.")
        );
      } else if (response.status >= 500) {
        return Promise.reject(
          new Error("Server Error: Please try again later.")
        );
      }

      // Handle other error cases with specific messages if available
      if (response.data) {
        let errorMessage = "An error occurred";
        if (response.data.detail) {
          errorMessage = response.data.detail;
        } else if (response.data.message) {
          errorMessage = response.data.message;
        } else if (response.data.non_field_errors) {
          errorMessage = response.data.non_field_errors.join(", ");
        }
        return Promise.reject(new Error(errorMessage));
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs with improved error handling
export const loginUser = (credentials) => {
  return apiClient
    .post("/auth/login/", credentials)
    .then((res) => res.data)
    .catch((error) => {
      if (error.response && error.response.data) {
        const { data } = error.response;
        if (
          data.detail === "No active account found with the given credentials"
        ) {
          throw new Error(
            "Email not found. Please check your email or sign up."
          );
        } else if (data.detail === "Invalid password") {
          throw new Error("Invalid password. Please try again.");
        }
      }
      throw error;
    });
};

export const logoutUser = () => {
  const refreshToken = localStorage.getItem("refreshToken");
  return apiClient
    .post("/auth/logout/", { refresh_token: refreshToken })
    .then((res) => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      return res.data;
    });
};

export const signupUser = (userData) =>
  apiClient.post("/auth/signup/", userData).then((res) => res.data);

export const verifySignupOtp = (otpData) =>
  apiClient.post("/auth/signup/verify-otp/", otpData).then((res) => res.data);

export const resendSignupOtp = (emailData) =>
  apiClient.post("/auth/signup/resend-otp/", emailData).then((res) => res.data);

export const forgotPasswordRequest = (emailData) =>
  apiClient
    .post("/auth/forgot-password/request-forgot-password/", emailData)
    .then((res) => res.data);

export const verifyForgotPasswordOtp = (otpData) =>
  apiClient
    .post("/auth/forgot-password/verify-otp/", otpData)
    .then((res) => res.data);

export const resendForgotPasswordOtp = (emailData) =>
  apiClient
    .post("/auth/forgot-password/resend-otp/", emailData)
    .then((res) => res.data);

export const setNewPassword = (passwordData) =>
  apiClient
    .post("/auth/forgot-password/set-new-password/", passwordData)
    .then((res) => res.data);

export const requestPasswordChange = (emailData) =>
  apiClient
    .post("/auth/password-change/request-password-change/", emailData)
    .then((res) => res.data);

export const verifyPasswordChange = (otpData) =>
  apiClient
    .post("/auth/password-change/verify-password-change/", otpData)
    .then((res) => res.data);

export const resendPasswordChangeOtp = (emailData) =>
  apiClient
    .post("/auth/password-change/resend-otp/", emailData)
    .then((res) => res.data);

export const getProfile = () =>
  apiClient.get("/auth/profile/").then((res) => res.data);

export const requestEmailChange = (emailData) =>
  apiClient
    .post("/auth/profile/request-email-change/", emailData)
    .then((res) => res.data);

export const verifyEmailChange = (otpData) =>
  apiClient
    .post("/auth/profile/verify-email-change/", otpData)
    .then((res) => res.data);

export const resendEmailChangeOtp = (emailData) =>
  apiClient
    .post("/auth/profile/resend-email-change-otp/", emailData)
    .then((res) => res.data);

export const requestProfileChange = (profileData) =>
  apiClient
    .post("/auth/profile/request-profile-change/", profileData)
    .then((res) => res.data);

export const verifyProfileChange = (otpData) =>
  apiClient
    .post("/auth/profile/verify-profile-change/", otpData)
    .then((res) => res.data);

export const refreshToken = (refreshData) =>
  apiClient.post("/auth/token/refresh/", refreshData).then((res) => res.data);

// Balance APIs
export const getBalanceList = (params = {}) =>
  apiClient.get("/api/balance/", { params }).then((res) => res.data);

export const getBalanceById = (id) =>
  apiClient.get(`/api/balance/${id}/`).then((res) => res.data);

// Deposit APIs
export const getDepositsList = (params = {}) =>
  apiClient.get("/api/deposits/", { params }).then((res) => res.data);

export const createDeposit = (depositData) =>
  apiClient.post("/api/deposits/", depositData).then((res) => res.data);

export const getDepositById = (id) =>
  apiClient.get(`/api/deposits/${id}/`).then((res) => res.data);

export const updateDeposit = (id, depositData) =>
  apiClient.put(`/api/deposits/${id}/`, depositData).then((res) => res.data);

export const partialUpdateDeposit = (id, depositData) =>
  apiClient.patch(`/api/deposits/${id}/`, depositData).then((res) => res.data);

export const deleteDeposit = (id) =>
  apiClient.delete(`/api/deposits/${id}/`).then((res) => res.data);

export const verifyDeposit = (id) =>
  apiClient.get(`/api/deposits/${id}/verify/`).then((res) => res.data);

// Withdrawal APIs
export const getWithdrawalsList = (params = {}) =>
  apiClient.get("/api/withdrawals/", { params }).then((res) => res.data);

export const createWithdrawal = (withdrawalData) =>
  apiClient.post("/api/withdrawals/", withdrawalData).then((res) => res.data);

export const getWithdrawalById = (id) =>
  apiClient.get(`/api/withdrawals/${id}/`).then((res) => res.data);

export const updateWithdrawal = (id, withdrawalData) =>
  apiClient
    .put(`/api/withdrawals/${id}/`, withdrawalData)
    .then((res) => res.data);

export const partialUpdateWithdrawal = (id, withdrawalData) =>
  apiClient
    .patch(`/api/withdrawals/${id}/`, withdrawalData)
    .then((res) => res.data);

export const deleteWithdrawal = (id) =>
  apiClient.delete(`/api/withdrawals/${id}/`).then((res) => res.data);

export const verifyWithdrawal = (id) =>
  apiClient.get(`/api/withdrawals/${id}/verify/`).then((res) => res.data);

// Account Summary APIs
export const getAccountSummaries = (params = { page: 1 }) =>
  apiClient.get("/api/account-summaries/", { params }).then((res) => res.data);

export const getAccountSummaryById = (id) =>
  apiClient.get(`/api/account-summaries/${id}/`).then((res) => res.data);

export const createAccountSummary = (summaryData) =>
  apiClient
    .post("/api/account-summaries/", summaryData)
    .then((res) => res.data);

export const updateAccountSummary = (id, summaryData) =>
  apiClient
    .put(`/api/account-summaries/${id}/`, summaryData)
    .then((res) => res.data);

export const partialUpdateAccountSummary = (id, summaryData) =>
  apiClient
    .patch(`/api/account-summaries/${id}/`, summaryData)
    .then((res) => res.data);

export const deleteAccountSummary = (id) =>
  apiClient.delete(`/api/account-summaries/${id}/`).then((res) => res.data);

// Transaction API (Combining Deposits and Withdrawals)
export const getTransactions = (params = {}) =>
  Promise.all([
    apiClient.get("/api/deposits/", { params }).then((res) => res.data),
    apiClient.get("/api/withdrawals/", { params }).then((res) => res.data),
  ]).then(([deposits, withdrawals]) => ({
    deposits: Array.isArray(deposits) ? deposits : deposits.results || [],
    withdrawals: Array.isArray(withdrawals)
      ? withdrawals
      : withdrawals.results || [],
  }));

// Compatibility Functions for BalanceContext
export const getBalance = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    const isValid = await validateToken(token);
    if (!isValid) {
      throw new Error("Invalid or expired token. Please log in again.");
    }
    const res = await apiClient.get("/api/balance/");
    let balanceData = res.data;
    if (Array.isArray(balanceData)) {
      balanceData = balanceData[0] || {};
    } else if (balanceData.results) {
      balanceData = balanceData.results[0] || {};
    }
    return {
      balance: balanceData.amount || 0,
      currency: balanceData.currency || "USD",
    };
  } catch (error) {
    throw new Error(
      error.message || "Failed to fetch balance. Please try again."
    );
  }
};

export const getAccountSummary = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }
    const isValid = await validateToken(token);
    if (!isValid) {
      throw new Error("Invalid or expired token. Please log in again.");
    }
    const res = await apiClient.get("/api/account-summaries/");
    let summaryData = res.data;
    if (Array.isArray(summaryData)) {
      summaryData = summaryData[0] || {};
    } else if (summaryData.results) {
      summaryData = summaryData.results[0] || {};
    }
    return {
      profit_loss: summaryData.profit_loss || 0,
      margin: summaryData.margin || 0,
      opened_position: summaryData.opened_position || 0,
      free_margin: summaryData.free_margin || 0,
      margin_level: summaryData.margin_level || 0,
    };
  } catch (error) {
    throw new Error(
      error.message || "Failed to fetch account summary. Please try again."
    );
  }
};

export default apiClient;
