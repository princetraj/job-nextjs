'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { employerService } from '@/services/employerService';
import { Application, Job, Employer, Address } from '@/types';
import { handleApiError } from '@/lib/api';

interface ContactDetails {
  email: string;
  mobile: string;
  address: Address | Record<string, string | null> | null;
}

interface ApplicationWithContactInfo extends Application {
  contact_details_viewed?: boolean;
  employee_allows_free_contact_view?: boolean;
}

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationWithContactInfo[]>([]);
  const [profile, setProfile] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Track which applications have unlocked contact details
  const [unlockedContacts, setUnlockedContacts] = useState<Record<string, ContactDetails>>({});
  const [viewingContact, setViewingContact] = useState<string | null>(null);

  // Interview scheduling modal state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [useCompanyLocation, setUseCompanyLocation] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const [jobData, applicationsData, profileData] = await Promise.all([
        employerService.getJob(jobId),
        employerService.getJobApplications(jobId),
        employerService.getProfile(),
      ]);

      setJob(jobData.job);
      setApplications(applicationsData.applications);
      setProfile(profileData.user);

      // Initialize unlocked contacts from applications that have already been viewed
      // OR have the free contact view feature enabled
      const initialUnlockedContacts: Record<string, ContactDetails> = {};

      applicationsData.applications.forEach((app: ApplicationWithContactInfo) => {
        // Show contacts if:
        // 1. Already viewed by employer, OR
        // 2. Employee's plan allows free contact viewing
        if ((app.contact_details_viewed || app.employee_allows_free_contact_view) && app.employee?.email) {
          initialUnlockedContacts[app.id] = {
            email: app.employee.email,
            mobile: app.employee.mobile || '',
            address: app.employee.address || null,
          };
        }
      });

      setUnlockedContacts(initialUnlockedContacts);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const openInterviewModal = (appId: string) => {
    setSelectedApplicationId(appId);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewLocation('');
    setUseCompanyLocation(false);
    setShowInterviewModal(true);
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
    setSelectedApplicationId(null);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewLocation('');
    setUseCompanyLocation(false);
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplicationId || !interviewDate || !interviewTime || !interviewLocation) {
      alert('Please fill in all interview details');
      return;
    }

    setUpdatingStatus(selectedApplicationId);
    try {
      await employerService.updateApplicationStatus(
        selectedApplicationId,
        'interview_scheduled',
        {
          interview_date: interviewDate,
          interview_time: interviewTime,
          interview_location: interviewLocation,
        }
      );

      // Refresh applications
      const applicationsData = await employerService.getJobApplications(jobId);
      setApplications(applicationsData.applications);
      closeInterviewModal();
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStatusUpdate = async (
    appId: string,
    status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected'
  ) => {
    if (status === 'interview_scheduled') {
      openInterviewModal(appId);
      return;
    }

    setUpdatingStatus(appId);
    try {
      await employerService.updateApplicationStatus(appId, status);
      // Refresh applications
      const applicationsData = await employerService.getJobApplications(jobId);
      setApplications(applicationsData.applications);
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewContactDetails = async (appId: string) => {
    setViewingContact(appId);
    try {
      const result = await employerService.viewApplicationContactDetails(appId);
      setUnlockedContacts(prev => ({
        ...prev,
        [appId]: result.contact_details,
      }));

      // Show appropriate message based on whether it was already viewed
      if (result.already_viewed) {
        const remainingMsg = result.views_remaining === 'unlimited'
          ? 'You have unlimited contact views remaining.'
          : `You have ${result.views_remaining} contact view${result.views_remaining !== 1 ? 's' : ''} remaining.`;
        alert(`Contact details are now visible. ${remainingMsg}`);
      } else {
        const remainingMsg = result.views_remaining === 'unlimited'
          ? 'You have unlimited contact views remaining.'
          : `You have ${result.views_remaining} contact view${result.views_remaining !== 1 ? 's' : ''} remaining.`;
        alert(`Contact details unlocked! ${remainingMsg}`);
      }
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setViewingContact(null);
    }
  };

  const handleDownloadCV = async (employeeId: string, employeeName: string) => {
    try {
      console.log('Downloading CV for employee:', employeeId, employeeName);
      const blob = await employerService.downloadEmployeeCV(employeeId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${employeeName}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('CV download error:', err);
      alert(handleApiError(err));
    }
  };

  // Handle company location checkbox
  useEffect(() => {
    if (useCompanyLocation && profile?.address) {
      const addr = profile.address;
      const locationStr = [addr.street, addr.city, addr.state, addr.country]
        .filter(Boolean)
        .join(', ');
      setInterviewLocation(locationStr || '');
    } else if (!useCompanyLocation && profile?.address) {
      setInterviewLocation('');
    }
  }, [useCompanyLocation, profile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'selected':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'shortlisted':
        return 'Shortlisted';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'selected':
        return 'Selected';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
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
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/employer/dashboard"
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job?.title}</h1>
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              {job?.location && (
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
                  {job.location.name}, {job.location.state}
                </span>
              )}
              {job?.category && (
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {job.category.name}
                </span>
              )}
              {job?.salary && (
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
                  {job.salary}
                </span>
              )}
            </div>
          </div>

          {/* Applications Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Applications ({applications.length})
              </h2>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">No applications yet</p>
                <p className="text-gray-500 mt-2">
                  Applications for this job will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => {
                  // Safety check - skip if employee is null
                  if (!application.employee) {
                    return null;
                  }

                  return (
                  <div
                    key={application.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {application.employee.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          {/* Show contact details if unlocked */}
                          {unlockedContacts[application.id] ? (
                            <>
                              {/* Show badge if contact is free due to employee plan */}
                              {application.employee_allows_free_contact_view && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-2 mb-2">
                                  <p className="flex items-center text-green-800 text-xs font-medium">
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    FREE: Contact visible via employee&apos;s premium plan (doesn&apos;t use your limit)
                                  </p>
                                </div>
                              )}
                              <p className="flex items-center">
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
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                {unlockedContacts[application.id].email}
                              </p>
                              {unlockedContacts[application.id].mobile && (
                                <p className="flex items-center">
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
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  {unlockedContacts[application.id].mobile}
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                              <p className="flex items-center text-yellow-800 text-sm">
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
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                                Contact details are hidden. Click &quot;View Contact Details&quot; to unlock.
                              </p>
                            </div>
                          )}
                          <p className="flex items-center">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Applied on: {new Date(application.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusText(application.status)}
                        </span>
                      </div>
                    </div>

                    {/* Interview Details */}
                    {application.status === 'interview_scheduled' && application.interview_date && (
                      <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Interview Details
                        </h4>
                        <div className="text-sm text-purple-900 space-y-1">
                          <p>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(application.interview_date).toLocaleDateString()}
                          </p>
                          {application.interview_time && (
                            <p>
                              <span className="font-medium">Time:</span> {application.interview_time}
                            </p>
                          )}
                          {application.interview_location && (
                            <p>
                              <span className="font-medium">Location:</span>{' '}
                              {application.interview_location}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Employee Details */}
                    {application.employee.education_details &&
                     application.employee.education_details.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                        <div className="space-y-2">
                          {application.employee.education_details.map((edu, idx) => (
                            <div key={idx} className="text-sm text-gray-700">
                              <p className="font-medium">{edu.degree} in {edu.field}</p>
                              <p className="text-gray-600">
                                {edu.university} ({edu.year_start} - {edu.year_end})
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.employee.experience_details &&
                     application.employee.experience_details.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                        <div className="space-y-2">
                          {application.employee.experience_details.map((exp, idx) => (
                            <div key={idx} className="text-sm text-gray-700">
                              <p className="font-medium">{exp.title} at {exp.company}</p>
                              <p className="text-gray-600">
                                {exp.year_start} - {exp.year_end}
                              </p>
                              {exp.description && (
                                <p className="text-gray-600 mt-1">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.employee.skills_details &&
                     application.employee.skills_details.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.employee.skills_details.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                      {/* View Contact Details Button - show if contact not yet unlocked */}
                      {!unlockedContacts[application.id] && (
                        <button
                          onClick={() => handleViewContactDetails(application.id)}
                          disabled={viewingContact === application.id}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {viewingContact === application.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            'View Contact Details'
                          )}
                        </button>
                      )}

                      {/* Download CV Button - only show if contact details are unlocked */}
                      {unlockedContacts[application.id] && (
                        <button
                          onClick={() => handleDownloadCV(application.employee.id, application.employee.name || 'Employee')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Download CV
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                        disabled={updatingStatus === application.id || application.status === 'shortlisted'}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {updatingStatus === application.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Shortlist'
                        )}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'interview_scheduled')}
                        disabled={updatingStatus === application.id}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'selected')}
                        disabled={updatingStatus === application.id || application.status === 'selected'}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'rejected')}
                        disabled={updatingStatus === application.id || application.status === 'rejected'}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Interview Scheduling Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Interview</h2>
                <button
                  onClick={closeInterviewModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Interview Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Date *
                  </label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Interview Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Time *
                  </label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Interview Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Location *
                  </label>

                  {/* Company Location Checkbox */}
                  {profile?.address && (
                    <div className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={useCompanyLocation}
                          onChange={(e) => setUseCompanyLocation(e.target.checked)}
                          className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Use Company Location</span>
                      </label>
                    </div>
                  )}

                  <textarea
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder="Enter interview location address"
                    rows={3}
                    disabled={useCompanyLocation}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                  {useCompanyLocation && (
                    <p className="text-sm text-gray-500 mt-1">
                      Company location will be used
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeInterviewModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  disabled={!interviewDate || !interviewTime || !interviewLocation || updatingStatus !== null}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updatingStatus ? <LoadingSpinner size="sm" /> : 'Schedule Interview'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
