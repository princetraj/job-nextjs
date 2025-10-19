// Employee Services
import api from '@/lib/api';
import { Employee, Job, PaginatedResponse, CVRequest, CV } from '@/types';

export const employeeService = {
  // Get Profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getProfile(): Promise<{ user: Employee; plan: any }> {
    const response = await api.get('/employee/profile');
    return response.data;
  },

  // Update Profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateProfile(field: string, value: any): Promise<void> {
    await api.put('/employee/profile/update', { field, value });
  },

  // Search Jobs
  async searchJobs(params?: {
    q?: string;
    location_id?: string;
    category_id?: string;
    page?: number;
  }): Promise<{ jobs: PaginatedResponse<Job> }> {
    const response = await api.get('/employee/jobs/search', { params });
    return response.data;
  },

  // Apply for Job
  async applyForJob(jobId: string): Promise<void> {
    await api.post(`/employee/jobs/${jobId}/apply`);
  },

  // Get Applied Jobs
  async getAppliedJobs(): Promise<{ jobs: Job[] }> {
    const response = await api.get('/employee/jobs/applied');
    return response.data;
  },

  // Shortlist Job
  async shortlistJob(jobId: string): Promise<void> {
    await api.post('/employee/jobs/shortlist', { job_id: jobId });
  },

  // Get Shortlisted Jobs
  async getShortlistedJobs(): Promise<{ jobs: Job[] }> {
    const response = await api.get('/employee/jobs/shortlisted');
    return response.data;
  },

  // Remove from Shortlist
  async removeFromShortlist(id: string): Promise<void> {
    await api.delete(`/employee/jobs/shortlist/${id}`);
  },

  // Generate CV
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generateCV(): Promise<any> {
    const response = await api.get('/employee/cv/generate');
    return response.data;
  },

  // Upload CV
  async uploadCV(file: File): Promise<{ cv_url: string }> {
    const formData = new FormData();
    formData.append('cv_file', file);
    const response = await api.post('/employee/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Request Professional CV
  async requestProfessionalCV(data: {
    notes?: string;
    preferred_template?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<any> {
    const response = await api.post('/employee/cv/request-professional', data);
    return response.data;
  },

  // Get CV Requests
  async getCVRequests(): Promise<{ requests: CVRequest[] }> {
    const response = await api.get('/employee/cv/requests');
    return response.data;
  },

  // Get CV Request Status
  async getCVRequestStatus(id: string): Promise<CVRequest> {
    const response = await api.get(`/employee/cv/requests/${id}`);
    return response.data;
  },

  // Get All CVs
  async getAllCVs(): Promise<{ cvs: CV[] }> {
    const response = await api.get('/employee/cvs');
    return response.data;
  },

  // Upload CV with title
  async uploadCVWithTitle(file: File, title: string): Promise<{ cv: CV }> {
    const formData = new FormData();
    formData.append('cv_file', file);
    formData.append('title', title);
    const response = await api.post('/employee/cvs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Create CV (using builder)
  async createCV(title: string): Promise<{ cv: CV }> {
    const response = await api.post('/employee/cvs/create', { title });
    return response.data;
  },

  // Set Active CV
  async setActiveCV(cvId: string): Promise<void> {
    await api.put(`/employee/cvs/${cvId}/set-active`);
  },

  // Delete CV
  async deleteCV(cvId: string): Promise<void> {
    await api.delete(`/employee/cvs/${cvId}`);
  },

  // Download CV
  async downloadCV(cvId: string): Promise<Blob> {
    const response = await api.get(`/employee/cvs/${cvId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Upload Profile Photo
  async uploadProfilePhoto(file: File): Promise<{ message: string; profile_photo_url: string; profile_photo_status: string }> {
    const formData = new FormData();
    formData.append('profile_photo', file);
    const response = await api.post('/employee/profile/photo/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get Profile Photo Status
  async getProfilePhotoStatus(): Promise<{ profile_photo_url: string | null; profile_photo_status: string | null; profile_photo_rejection_reason: string | null }> {
    const response = await api.get('/employee/profile/photo/status');
    return response.data;
  },
};
