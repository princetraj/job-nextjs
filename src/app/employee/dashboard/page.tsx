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

interface CurrentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  is_default: boolean;
  started_at: string;
  expires_at: string | null;
  is_active: boolean;
  is_expired: boolean;
  days_remaining: number | null;
  jobs_can_apply: number;
  jobs_remaining: number | null;
  contact_details_can_view: number;
  contact_views_remaining: number | null;
}

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [shortlistedJobs, setShortlistedJobs] = useState<Job[]>([]);
  const [contactViewedJobs, setContactViewedJobs] = useState<Job[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'applied' | 'shortlisted' | 'contact'>('applied');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showCVRequestModal, setShowCVRequestModal] = useState(false);
  const [cvRequestLoading, setCVRequestLoading] = useState(false);
  const [cvRequestNotes, setCVRequestNotes] = useState('');
  const [cvPrice] = useState(50); // Professional CV price
  const [hasPendingCVRequest, setHasPendingCVRequest] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileData, appliedData, shortlistedData, contactViewedData, planData, cvRequestsData] = await Promise.all([
        employeeService.getProfile(),
        employeeService.getAppliedJobs(),
        employeeService.getShortlistedJobs(),
        employeeService.getContactViewedJobs(),
        employeeService.getCurrentPlan(),
        employeeService.getCVRequests(),
      ]);

      setProfile(profileData.user);
      setAppliedJobs(appliedData.jobs);
      setShortlistedJobs(shortlistedData.jobs);
      setContactViewedJobs(contactViewedData.jobs);
      setCurrentPlan(planData.plan);

      // Check if there's a pending or in_progress CV request
      const pendingRequest = cvRequestsData.requests?.find(
        (req: { status: string }) => req.status === 'pending' || req.status === 'in_progress'
      );
      setHasPendingCVRequest(!!pendingRequest);
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

  const handleCVRequest = async () => {
    if (!cvRequestNotes.trim()) {
      showNotification('error', 'Please provide some notes about your CV requirements');
      return;
    }

    setCVRequestLoading(true);
    try {
      await employeeService.requestProfessionalCV({
        notes: cvRequestNotes,
        price: cvPrice,
      });
      showNotification('success', 'Professional CV request submitted successfully! You will be notified once it is processed.');
      setShowCVRequestModal(false);
      setCVRequestNotes('');
      setHasPendingCVRequest(true); // Update state immediately
      fetchDashboardData(); // Refresh data to get the latest CV request status
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Failed to submit CV request';
        showNotification('error', message);
      } else {
        showNotification('error', 'Failed to submit CV request');
      }
    } finally {
      setCVRequestLoading(false);
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {profile?.name || 'User'}!
                </h1>
                <p className="text-blue-100">
                  Here&apos;s an overview of your job search activities
                </p>
              </div>
              <Link
                href="/employee/profile"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </Link>
            </div>
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">{currentPlan.name}</h2>
                  <p className="text-gray-600">{currentPlan.description}</p>
                </div>
                <div className="text-right flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentPlan.is_expired
                      ? 'bg-red-100 text-red-800'
                      : currentPlan.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentPlan.is_expired ? 'Expired' : currentPlan.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Link
                    href="/employee/upgrade-plan"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Upgrade Plan
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <p className="text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">Plan Price</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {currentPlan.price === 0 ? 'Free' : `₹${currentPlan.price}`}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <p className="text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">Job Applications</p>
                  <p className="text-3xl font-bold text-purple-700">
                    {currentPlan.jobs_remaining === -1 ? '∞' : currentPlan.jobs_remaining}
                    {currentPlan.jobs_can_apply !== -1 && (
                      <span className="text-lg font-medium text-gray-600">
                        /{currentPlan.jobs_can_apply}
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <p className="text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">Contact Views</p>
                  <p className="text-3xl font-bold text-indigo-700">
                    {currentPlan.contact_views_remaining === -1 ? '∞' : currentPlan.contact_views_remaining}
                    {currentPlan.contact_details_can_view !== -1 && (
                      <span className="text-lg font-medium text-gray-600">
                        /{currentPlan.contact_details_can_view}
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <p className="text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                    {currentPlan.expires_at ? 'Days Remaining' : 'Validity'}
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {currentPlan.expires_at === null ? '∞' : currentPlan.days_remaining || 0}
                  </p>
                </div>
              </div>

              {currentPlan.is_default && (
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
                      href="/employee/upgrade-plan"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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

              {/* Professional CV Request */}
              <button
                onClick={() => !hasPendingCVRequest && setShowCVRequestModal(true)}
                disabled={hasPendingCVRequest}
                className={`group bg-white rounded-xl shadow-md transition-all duration-300 overflow-hidden border text-left ${
                  hasPendingCVRequest
                    ? 'border-gray-200 cursor-not-allowed opacity-75'
                    : 'border-gray-100 hover:border-amber-500 hover:shadow-xl'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`rounded-lg p-3 transition-transform duration-300 ${
                      hasPendingCVRequest
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                        : 'bg-gradient-to-br from-amber-500 to-amber-600 group-hover:scale-110'
                    }`}>
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {hasPendingCVRequest ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        )}
                      </svg>
                    </div>
                    {!hasPendingCVRequest && (
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300"
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
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Professional CV</h3>
                  <p className="text-sm text-gray-600">
                    {hasPendingCVRequest ? 'Request in progress' : 'Get expert CV creation'}
                  </p>
                  <p className={`text-xs mt-2 font-medium ${
                    hasPendingCVRequest ? 'text-gray-500' : 'text-amber-600'
                  }`}>
                    {hasPendingCVRequest ? 'Already Requested' : 'Paid Service'}
                  </p>
                </div>
              </button>

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

      {/* Professional CV Request Modal */}
      {showCVRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Request Professional CV</h3>
              <button
                onClick={() => {
                  setShowCVRequestModal(false);
                  setCVRequestNotes('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Professional Service</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Our experts will create a professional CV for you based on your profile and requirements. This is a paid service.
                    </p>
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements & Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cvRequestNotes}
                onChange={(e) => setCVRequestNotes(e.target.value)}
                placeholder="Tell us about your preferences, target job roles, any specific requirements..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                disabled={cvRequestLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Estimated delivery: 3-5 business days
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCVRequestModal(false);
                  setCVRequestNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={cvRequestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCVRequest}
                disabled={cvRequestLoading || !cvRequestNotes.trim()}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {cvRequestLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
