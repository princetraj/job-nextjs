'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { employeeService } from '@/services/employeeService';
import { Employee, Job } from '@/types';
import { handleApiError } from '@/lib/api';

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [shortlistedJobs, setShortlistedJobs] = useState<Job[]>([]);
  const [contactViewedJobs, setContactViewedJobs] = useState<Job[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'applied' | 'shortlisted' | 'contact'>('applied');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileData, appliedData, shortlistedData, contactViewedData, planData] = await Promise.all([
        employeeService.getProfile(),
        employeeService.getAppliedJobs(),
        employeeService.getShortlistedJobs(),
        employeeService.getContactViewedJobs(),
        employeeService.getCurrentPlan(),
      ]);

      setProfile(profileData.user);
      setAppliedJobs(appliedData.jobs);
      setShortlistedJobs(shortlistedData.jobs);
      setContactViewedJobs(contactViewedData.jobs);
      setCurrentPlan(planData.plan);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await employeeService.applyForJob(jobId);
      showNotification('success', 'Application submitted successfully!');
      // Refresh the data
      fetchDashboardData();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Failed to apply for job';
        showNotification('error', message);
      } else {
        showNotification('error', 'Failed to apply for job');
      }
    }
  };

  const handleShortlist = async (jobId: string) => {
    try {
      await employeeService.shortlistJob(jobId);
      showNotification('success', 'Job added to shortlist!');
      // Refresh the data
      fetchDashboardData();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Failed to shortlist job';
        showNotification('error', message);
      } else {
        showNotification('error', 'Failed to shortlist job');
      }
    }
  };

  const handleViewContact = async (jobId: string) => {
    try {
      const response = await employeeService.viewEmployerContact(jobId);
      // Show contact in alert for now - you can create a modal component later
      const contact = response.contact;
      const contactInfo = `
Company: ${contact.company_name}
Email: ${contact.email}
Phone: ${contact.contact}
${contact.industry ? `Industry: ${contact.industry}` : ''}
${contact.address ? `Address: ${Object.values(contact.address).filter(Boolean).join(', ')}` : ''}
      `.trim();

      alert(contactInfo);

      if (!response.already_viewed) {
        showNotification('success', `Contact details retrieved! ${response.contact_views_remaining === -1 ? 'Unlimited views remaining' : `${response.contact_views_remaining} views remaining`}`);
        fetchDashboardData(); // Refresh to update contact viewed list
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Failed to view contact details';
        showNotification('error', message);
      } else {
        showNotification('error', 'Failed to view contact details');
      }
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.name || 'User'}!
            </h1>
            <p className="text-blue-100">
              Here&apos;s an overview of your job search activities
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                notification.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <p
                  className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {notification.message}
                </p>
              </div>
            </div>
          )}

          {/* Current Plan Card */}
          {currentPlan && (
            <div className="bg-white border-2 border-purple-200 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentPlan.name}</h2>
                  <p className="text-gray-600 text-sm">{currentPlan.description}</p>
                </div>
                {currentPlan.is_default && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    Default Plan
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 text-xs font-semibold mb-2">Job Applications</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {currentPlan.jobs_remaining === -1 ? '∞' : currentPlan.jobs_remaining}
                    {currentPlan.jobs_can_apply !== -1 && (
                      <span className="text-lg font-medium text-gray-600">
                        /{currentPlan.jobs_can_apply}
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-700 text-xs font-semibold mb-2">Contact Views</p>
                  <p className="text-3xl font-bold text-green-700">
                    {currentPlan.contact_views_remaining === -1 ? '∞' : currentPlan.contact_views_remaining}
                    {currentPlan.contact_details_can_view !== -1 && (
                      <span className="text-lg font-medium text-gray-600">
                        /{currentPlan.contact_details_can_view}
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <p className="text-gray-700 text-xs font-semibold mb-2">Plan Price</p>
                  <p className="text-3xl font-bold text-purple-700">
                    {currentPlan.price === 0 ? 'Free' : `₹${currentPlan.price}`}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <p className="text-gray-700 text-xs font-semibold mb-2">Days Remaining</p>
                  <p className="text-3xl font-bold text-orange-700">
                    {currentPlan.expires_at === null ? '∞' : currentPlan.days_remaining || 0}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/employee/upgrade-plan"
                  className="flex-1 bg-purple-600 text-white text-center py-3 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium shadow-sm"
                >
                  Upgrade Plan
                </Link>
                {currentPlan.is_expired && (
                  <span className="flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium">
                    Plan Expired
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{appliedJobs.length}</p>
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
                  <p className="text-gray-600 text-sm font-medium">Shortlisted Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">{shortlistedJobs.length}</p>
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
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Profile Completeness</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {profile?.education_details?.length && profile?.experience_details?.length && profile?.skills_details?.length
                      ? '100%'
                      : profile?.education_details?.length || profile?.experience_details?.length
                      ? '70%'
                      : '30%'}
                  </p>
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search Jobs */}
              <Link
                href="/jobs"
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-500"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Search Jobs</h3>
                  <p className="text-sm text-gray-600">Find your dream job</p>
                </div>
              </Link>

              {/* Edit Profile */}
              <Link
                href="/employee/profile"
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-500"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit Profile</h3>
                  <p className="text-sm text-gray-600">Update your information</p>
                </div>
              </Link>

              {/* Manage CV */}
              <Link
                href="/employee/cv"
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-500"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage CV</h3>
                  <p className="text-sm text-gray-600">Upload and edit your CV</p>
                </div>
              </Link>

              {/* My Applications */}
              <Link
                href="/employee/applications"
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-500"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">My Applications</h3>
                  <p className="text-sm text-gray-600">Track application status</p>
                </div>
              </Link>
            </div>
          </div>

          {/* My Jobs - Tabbed Interface */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('applied')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'applied'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Applied Jobs ({appliedJobs.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('shortlisted')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'shortlisted'
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Shortlisted ({shortlistedJobs.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact Viewed ({contactViewedJobs.length})</span>
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Applied Jobs Tab */}
              {activeTab === 'applied' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Your Applications</h3>
                    <Link href="/employee/applications" className="text-blue-600 hover:underline text-sm">
                      View All →
                    </Link>
                  </div>
                  {appliedJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600 mb-4">You haven&apos;t applied to any jobs yet</p>
                      <Link
                        href="/jobs"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Browse Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {appliedJobs.slice(0, 4).map((job) => (
                        <JobCard key={job.id} job={job} showApplyButton={false} onViewContact={handleViewContact} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Shortlisted Jobs Tab */}
              {activeTab === 'shortlisted' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Shortlisted Jobs</h3>
                    <Link href="/employee/shortlisted" className="text-purple-600 hover:underline text-sm">
                      View All →
                    </Link>
                  </div>
                  {shortlistedJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <p className="text-gray-600">No shortlisted jobs yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {shortlistedJobs.slice(0, 4).map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onApply={handleApply}
                          onShortlist={handleShortlist}
                          onViewContact={handleViewContact}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Contact Viewed Jobs Tab */}
              {activeTab === 'contact' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Jobs with Viewed Contacts</h3>
                  </div>
                  {contactViewedJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">You haven&apos;t viewed any employer contacts yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {contactViewedJobs.slice(0, 4).map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onApply={handleApply}
                          onShortlist={handleShortlist}
                          onViewContact={handleViewContact}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
