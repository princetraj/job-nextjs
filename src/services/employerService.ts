// Employer Services
import api from '@/lib/api';
import { Employer, Job, Application } from '@/types';

export const employerService = {
  // Get Profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getProfile(): Promise<{ user: Employer; plan: any }> {
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
};
