// Authentication Services
import api, { setAuthToken, clearAuth } from '@/lib/api';
import { LoginResponse } from '@/types';

export const authService = {
  // Login
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { identifier, password });
    const { token, user_type } = response.data;
    setAuthToken(token, user_type);
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
    }
  },

  // Employee Registration - Step 1
  async registerEmployeeStep1(data: {
    email: string;
    mobile: string;
    name: string;
    password: string;
    gender: string;
  }): Promise<{ tempToken: string }> {
    const response = await api.post('/auth/register/employee-step1', data);
    return response.data;
  },

  // Employee Registration - Step 2
  async registerEmployeeStep2(
    tempToken: string,
    data: {
      dob: string;
      address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    }
  ): Promise<void> {
    const response = await api.post('/auth/register/employee-step2', data, {
      headers: { Authorization: `Bearer ${tempToken}` },
    });
    return response.data;
  },

  // Employee Registration - Final Step
  async registerEmployeeFinal(
    tempToken: string,
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      education: any[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      experience: any[];
      skills: string[];
    }
  ): Promise<{ token: string }> {
    const response = await api.post('/auth/register/employee-final', data, {
      headers: { Authorization: `Bearer ${tempToken}` },
    });
    const { token } = response.data;
    setAuthToken(token, 'employee');
    return response.data;
  },

  // Employer Registration
  async registerEmployer(data: {
    company_name: string;
    email: string;
    contact: string;
    password: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    address: any;
    industry_type_id: string;
  }): Promise<{ token: string }> {
    const response = await api.post('/auth/register/employer', data);
    const { token } = response.data;
    setAuthToken(token, 'employer');
    return response.data;
  },
};
