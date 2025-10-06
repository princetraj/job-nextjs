// Payment Services
import api from '@/lib/api';
import { Payment } from '@/types';

export const paymentService = {
  // Subscribe to Plan
  async subscribe(data: {
    plan_id: string;
    coupon_code?: string;
    payment_method: string;
    payment_details: any;
  }): Promise<{
    message: string;
    payment: Payment;
    subscription_expires_at: string;
  }> {
    const response = await api.post('/payments/subscribe', data);
    return response.data;
  },

  // Verify Payment
  async verifyPayment(data: {
    payment_id: string;
    transaction_id: string;
  }): Promise<any> {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },

  // Get Payment History
  async getPaymentHistory(): Promise<{ payments: Payment[] }> {
    const response = await api.get('/payments/history');
    return response.data;
  },
};
