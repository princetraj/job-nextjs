// Public Services (No Auth Required)
import api from '@/lib/api';
import { Plan, Industry, Location, Category, Skill, Coupon, Job, PaginatedResponse } from '@/types';

export const publicService = {
  // Get All Plans
  async getPlans(type?: 'employee' | 'employer'): Promise<{ plans: Plan[] }> {
    const response = await api.get('/plans', { params: { type } });
    return response.data;
  },

  // Get Specific Plan
  async getPlan(id: string): Promise<Plan> {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },

  // Get Industries
  async getIndustries(): Promise<{ industries: Industry[] }> {
    const response = await api.get('/catalogs/industries');
    return response.data;
  },

  // Get Locations
  async getLocations(): Promise<{ locations: Location[] }> {
    const response = await api.get('/catalogs/locations');
    return response.data;
  },

  // Get Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    const response = await api.get('/catalogs/categories');
    return response.data;
  },

  // Get Skills
  async getSkills(): Promise<{ skills: Skill[] }> {
    const response = await api.get('/catalogs/skills');
    return response.data;
  },

  // Public Job Search
  async searchJobs(params?: {
    q?: string;
    location_id?: string;
    category_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: PaginatedResponse<Job> }> {
    const response = await api.get('/jobs/search', { params });
    return response.data;
  },

  // Get Latest Jobs (for homepage)
  async getLatestJobs(limit: number = 10): Promise<{ jobs: Job[] }> {
    const response = await api.get('/jobs/search', { params: { limit } });
    return response.data;
  },

  // Validate Coupon
  async validateCoupon(data: {
    coupon_code: string;
    plan_id: string;
  }): Promise<{
    valid: boolean;
    coupon?: Coupon;
    plan?: Plan;
    discount_amount?: string;
    final_amount?: string;
    message?: string;
  }> {
    const response = await api.post('/coupons/validate', data);
    return response.data;
  },
};
