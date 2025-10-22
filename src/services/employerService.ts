// Employer Services
import api from '@/lib/api';
import { Employer, Job, Application } from '@/types';

interface EmployerPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  is_default: boolean;
  is_active: boolean;
  is_expired: boolean;
  jobs_can_post: number;
  contact_views_remaining: number | null;
  employee_contact_details_can_view: number;
  days_remaining: number | null;
  expires_at: string | null;
}

export const employerService = {
  // Get Profile
  async getProfile(): Promise<{ user: Employer; plan: EmployerPlan | null }> {
    const response = await api.get('/employer/profile');
    return response.data;
  },

  // Update Profile
  async updateProfile(data: Partial<Employer>): Promise<void> {
    await api.put('/employer/profile/update', data);
  },

  // Get All Jobs
  async getAllJobs(): Promise<{ jobs: Job[] }> {
    const response = await api.get('/employer/jobs');
    return response.data;
  },

  // Create Job
  async createJob(data: {
    title: string;
    description: string;
    salary?: string;
    location_id: string;
    category_id: string;
  }): Promise<{ job_id: string }> {
    const response = await api.post('/employer/jobs', data);
    return response.data;
  },

  // Get Job Details
  async getJob(jobId: string): Promise<{ job: Job }> {
    const response = await api.get(`/employer/jobs/${jobId}`);
    return response.data;
  },

  // Update Job
  async updateJob(jobId: string, data: Partial<Job>): Promise<void> {
    await api.put(`/employer/jobs/${jobId}`, data);
  },

  // Delete Job
  async deleteJob(jobId: string): Promise<void> {
    await api.delete(`/employer/jobs/${jobId}`);
  },

  // Get All Applications
  async getAllApplications(): Promise<{ applications: Application[] }> {
    const response = await api.get('/employer/applications');
    return response.data;
  },

  // Get Job Applications
  async getJobApplications(jobId: string): Promise<{ applications: Application[] }> {
    const response = await api.get(`/employer/jobs/${jobId}/applications`);
    return response.data;
  },

  // Update Application Status
  async updateApplicationStatus(
    appId: string,
    status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected',
    interviewDetails?: {
      interview_date?: string;
      interview_time?: string;
      interview_location?: string;
    }
  ): Promise<void> {
    await api.put(`/employer/applications/${appId}/status`, {
      status,
      ...interviewDetails,
    });
  },

  // Download Employee CV
  async downloadEmployeeCV(employeeId: string): Promise<Blob> {
    console.log('API Call - Download CV for employee ID:', employeeId);
    console.log('Full URL will be:', `/employer/employees/${employeeId}/cv/download`);
    const response = await api.get(`/employer/employees/${employeeId}/cv/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // View Application Contact Details (with plan limit check)
  async viewApplicationContactDetails(appId: string): Promise<{
    contact_details: {
      email: string;
      mobile: string;
      address: Record<string, string | null> | null;
    };
    can_download_cv: boolean;
    views_remaining: number | string;
    already_viewed: boolean;
  }> {
    const response = await api.post(`/employer/applications/${appId}/view-contact`);
    return response.data;
  },

  // Get Current Plan Details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCurrentPlan(): Promise<{ plan: any }> {
    const response = await api.get('/employer/plan/current');
    return response.data;
  },

  // Get Available Plans for Upgrade
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAvailablePlans(): Promise<{ plans: any[] }> {
    const response = await api.get('/employer/plan/available');
    return response.data;
  },

  // Get Plan History
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPlanHistory(): Promise<{ history: any[] }> {
    const response = await api.get('/employer/plan/history');
    return response.data;
  },
};
