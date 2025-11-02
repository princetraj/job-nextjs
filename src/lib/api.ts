// API Configuration and HTTP Client
import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_type');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper functions for common operations
export const setAuthToken = (token: string, userType: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_type', userType);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const getUserType = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_type');
  }
  return null;
};

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
  }
};

// Error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const data = error.response.data;

    // Try to extract error message in different formats
    if (data.message) {
      return data.message;
    } else if (data.error) {
      return data.error;
    } else if (data.errors) {
      // Handle validation errors (object or array)
      if (typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        // Format: { email: ['Email already exists'], mobile: ['Mobile already exists'] }
        const errorMessages = Object.values(data.errors).flat();
        return errorMessages.join(', ');
      } else if (Array.isArray(data.errors)) {
        // Format: ['Error 1', 'Error 2']
        return data.errors.join(', ');
      }
      return data.errors;
    } else if (typeof data === 'string') {
      return data;
    }

    return 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Other errors
    return error.message || 'An unexpected error occurred';
  }
};

// Plan Management APIs
export const planAPI = {
  // Get current plan for authenticated employee
  getCurrentPlan: () => api.get('/employee/plan/current'),

  // Get available plans for upgrade (excludes default plans)
  getAvailablePlans: () => api.get('/employee/plan/available'),

  // Upgrade to a new plan (legacy - direct upgrade without payment)
  upgradePlan: (planId: string, paymentId?: string) =>
    api.post('/employee/plan/upgrade', { plan_id: planId, payment_id: paymentId }),

  // Get plan subscription history
  getPlanHistory: () => api.get('/employee/plan/history'),

  // Get all plans (public)
  getAllPlans: (type?: string) =>
    api.get('/plans/', { params: type ? { type } : {} }),
};

// Payment APIs (Razorpay Integration)
export const paymentAPI = {
  // Create Razorpay order (with optional coupon)
  createRazorpayOrder: (planId: string, couponCode?: string) =>
    api.post('/payments/razorpay/create-order', {
      plan_id: planId,
      coupon_code: couponCode
    }),

  // Verify Razorpay payment
  verifyRazorpayPayment: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post('/payments/razorpay/verify', paymentData),

  // Get order details
  getOrderDetails: (orderId: string) => api.get(`/payments/orders/${orderId}`),

  // Get transaction history
  getTransactionHistory: () => api.get('/payments/transactions'),

  // Get user's assigned coupons
  getMyAssignedCoupons: () => api.get('/coupons/my-coupons'),

  // Validate coupon for a plan
  validateCoupon: (couponCode: string, planId: string) =>
    api.post('/coupons/validate', { coupon_code: couponCode, plan_id: planId }),
};
