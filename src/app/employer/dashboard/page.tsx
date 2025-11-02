'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { employerService } from '@/services/employerService';
import { Employer, Job } from '@/types';
import { handleApiError } from '@/lib/api';

interface EmployerPlanDetails {
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

interface JobWithApplications extends Job {
  applications_count?: number;
  new_applications_count?: number;
}

export default function EmployerDashboard() {
  const [profile, setProfile] = useState<Employer | null>(null);
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [planDetails, setPlanDetails] = useState<EmployerPlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileData, jobsData, planData] = await Promise.all([
        employerService.getProfile(),
        employerService.getAllJobs(),
        employerService.getCurrentPlan().catch(() => ({ plan: null })),
      ]);

      setProfile(profileData.user);
      setJobs(jobsData.jobs);
      setPlanDetails(planData.plan);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await employerService.deleteJob(jobId);
      // Refresh the jobs list
      const jobsData = await employerService.getAllJobs();
      setJobs(jobsData.jobs);
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.company_name || 'Employer'}!
            </h1>
            <p className="text-green-100">
              Manage your job postings and find the best candidates
            </p>
          </div>

          {/* Current Plan Details */}
          {planDetails && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    {planDetails.name}
                  </h2>
                  <p className="text-gray-600">{planDetails.description}</p>
                </div>
                <div className="text-right flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    planDetails.is_expired
                      ? 'bg-red-100 text-red-800'
                      : planDetails.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {planDetails.is_expired ? 'Expired' : planDetails.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Link
                    href="/employer/upgrade-plan"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Upgrade Plan
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium mb-1">Price</p>
                  <p className="text-2xl font-bold text-blue-900">₹{planDetails.price}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium mb-1">Jobs Can Post</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {planDetails.jobs_can_post === -1 ? 'Unlimited' : planDetails.jobs_can_post}
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-indigo-600 font-medium mb-1">Contact Views Remaining</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {planDetails.contact_views_remaining === -1
                      ? 'Unlimited'
                      : planDetails.contact_views_remaining ?? 0}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    Total: {planDetails.employee_contact_details_can_view === -1
                      ? 'Unlimited'
                      : planDetails.employee_contact_details_can_view ?? 0}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium mb-1">
                    {planDetails.expires_at ? 'Days Remaining' : 'Validity'}
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {planDetails.days_remaining !== null && planDetails.days_remaining >= 0
                      ? `${Math.floor(planDetails.days_remaining)} days`
                      : planDetails.expires_at
                      ? 'Expired'
                      : 'Lifetime'}
                  </p>
                  {planDetails.expires_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Expires: {new Date(planDetails.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {planDetails.is_default && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-yellow-800 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      You are currently on the default plan. Upgrade to unlock more features!
                    </p>
                    <Link
                      href="/employer/upgrade-plan"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors ml-4"
                    >
                      Upgrade Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Job Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
                    </p>
                    {jobs.reduce((sum, job) => sum + (job.new_applications_count || 0), 0) > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                        +{jobs.reduce((sum, job) => sum + (job.new_applications_count || 0), 0)} New
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Profile Status</p>
                  <p className="text-3xl font-bold text-gray-900">Active</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                href="/employer/jobs/create"
                className="flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Post New Job
              </Link>
              <Link
                href="/employer/jobs"
                className="flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Manage Jobs
              </Link>
              <Link
                href="/employer/profile"
                className="flex items-center justify-center bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Company Profile
              </Link>
              <Link
                href="/employer/applications"
                className="flex items-center justify-center bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                View Applications
              </Link>
            </div>
          </div>

          {/* Company Profile Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="text-lg font-medium text-gray-900">{profile?.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="text-lg font-medium text-gray-900">{profile?.contact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Industry</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile?.industry?.name || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/employer/profile"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Profile →
              </Link>
            </div>
          </div>

          {/* Job Listings */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Job Postings</h2>
              <Link
                href="/employer/jobs/create"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                + Post New Job
              </Link>
            </div>
            {jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-600 mb-4 text-lg">You haven&apos;t posted any jobs yet</p>
                <p className="text-gray-500 mb-6">
                  Create your first job posting to start receiving applications from qualified candidates
                </p>
                <Link
                  href="/employer/jobs/create"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
                >
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {job.location?.name || 'Remote'}
                          </span>
                          {job.salary && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              ₹ {job.salary}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/employer/jobs/${job.id}/applications`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Applications
                        </Link>
                        <Link
                          href={`/employer/jobs/${job.id}/edit`}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Category: {job.category?.name || 'Not specified'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                          Applications: {job.applications_count || 0}
                        </span>
                        {job.new_applications_count && job.new_applications_count > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {job.new_applications_count} New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
