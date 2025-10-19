'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { employeeService } from '@/services/employeeService';
import { Job } from '@/types';
import { handleApiError } from '@/lib/api';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Job[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter((app) => app.status === selectedStatus)
      );
    }
  }, [selectedStatus, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAppliedJobs();
      setApplications(response.jobs);
      setFilteredApplications(response.jobs);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      applied: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Applied',
      },
      shortlisted: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Shortlisted',
      },
      interview_scheduled: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Interview Scheduled',
      },
      selected: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Selected',
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Rejected',
      },
    };

    const config = status ? statusConfig[status] : statusConfig['applied'];
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getStatusCounts = () => {
    return {
      all: applications.length,
      applied: applications.filter((app) => app.status === 'applied').length,
      shortlisted: applications.filter((app) => app.status === 'shortlisted')
        .length,
      interview_scheduled: applications.filter(
        (app) => app.status === 'interview_scheduled'
      ).length,
      selected: applications.filter((app) => app.status === 'selected').length,
      rejected: applications.filter((app) => app.status === 'rejected').length,
    };
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

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Applications
            </h1>
            <p className="text-gray-600">
              Track all your job applications and their status
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({statusCounts.all})
              </button>
              <button
                onClick={() => setSelectedStatus('applied')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'applied'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Applied ({statusCounts.applied})
              </button>
              <button
                onClick={() => setSelectedStatus('shortlisted')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'shortlisted'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Shortlisted ({statusCounts.shortlisted})
              </button>
              <button
                onClick={() => setSelectedStatus('interview_scheduled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'interview_scheduled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Interview ({statusCounts.interview_scheduled})
              </button>
              <button
                onClick={() => setSelectedStatus('selected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'selected'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Selected ({statusCounts.selected})
              </button>
              <button
                onClick={() => setSelectedStatus('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'rejected'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected ({statusCounts.rejected})
              </button>
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedStatus === 'all'
                  ? 'No applications yet'
                  : `No ${selectedStatus} applications`}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedStatus === 'all'
                  ? "Start applying to jobs and they'll appear here"
                  : `You don't have any ${selectedStatus} applications`}
              </p>
              <Link
                href="/jobs"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <p className="text-gray-700 font-medium mb-2">
                          {job.employer?.company_name}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {job.location && (
                            <div className="flex items-center">
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
                              {job.location.name}
                            </div>
                          )}
                          {job.category && (
                            <div className="flex items-center">
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
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                              {job.category.name}
                            </div>
                          )}
                          {job.salary && (
                            <div className="flex items-center">
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
                              {job.salary}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Applied Date</p>
                          <p className="font-medium text-gray-900">
                            {job.applied_at
                              ? new Date(job.applied_at).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  }
                                )
                              : 'N/A'}
                          </p>
                        </div>
                        {job.interview_date && (
                          <>
                            <div>
                              <p className="text-gray-600 mb-1">
                                Interview Date
                              </p>
                              <p className="font-medium text-gray-900">
                                {new Date(
                                  job.interview_date
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            {job.interview_time && (
                              <div>
                                <p className="text-gray-600 mb-1">
                                  Interview Time
                                </p>
                                <p className="font-medium text-gray-900">
                                  {job.interview_time}
                                </p>
                              </div>
                            )}
                            {job.interview_location && (
                              <div>
                                <p className="text-gray-600 mb-1">
                                  Interview Location
                                </p>
                                <p className="font-medium text-gray-900">
                                  {job.interview_location}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
