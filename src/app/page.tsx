'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { publicService } from '@/services/publicService';
import { employeeService } from '@/services/employeeService';
import { Job } from '@/types';
import { getUserType } from '@/lib/api';

export default function Home() {
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const userType = getUserType();

  useEffect(() => {
    fetchLatestJobs();
  }, []);

  const fetchLatestJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await publicService.getLatestJobs(10);
      setLatestJobs(response.jobs);
    } catch (err) {
      console.error('Error fetching latest jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApply = async (jobId: string) => {
    if (userType !== 'employee') {
      showNotification('error', 'Please login as a job seeker to apply for jobs');
      return;
    }
    try {
      await employeeService.applyForJob(jobId);
      showNotification('success', 'Application submitted successfully!');
      fetchLatestJobs(); // Refresh jobs to update applied status
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
    if (userType !== 'employee') {
      showNotification('error', 'Please login as a job seeker to shortlist jobs');
      return;
    }
    try {
      await employeeService.shortlistJob(jobId);
      showNotification('success', 'Job added to shortlist!');
      fetchLatestJobs(); // Refresh jobs to update shortlisted status
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
    if (userType !== 'employee') {
      showNotification('error', 'Please login as a job seeker to view contact details');
      return;
    }
    try {
      const response = await employeeService.viewEmployerContact(jobId);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section - Enhanced */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="inline-block mb-4">
                  <span className="bg-blue-500 bg-opacity-30 text-white px-4 py-2 rounded-full text-sm font-medium">
                    🎯 Your Career Journey Starts Here
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                  Find Your
                  <span className="block text-yellow-300">Dream Job</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
                  Connect with top employers and discover opportunities that match your skills and ambitions
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link
                    href="/jobs"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
                  >
                    Browse Jobs →
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-transparent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all border-2 border-white"
                  >
                    Get Started
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div>
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300">10K+</div>
                    <div className="text-sm text-blue-200">Active Jobs</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300">5K+</div>
                    <div className="text-sm text-blue-200">Companies</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300">50K+</div>
                    <div className="text-sm text-blue-200">Job Seekers</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Illustration */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                  <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                  <div className="absolute bottom-0 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                  {/* Card Stack */}
                  <div className="relative space-y-4">
                    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 transform rotate-3 hover:rotate-0 transition-transform shadow-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-yellow-400 rounded-lg shadow-lg"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-800 rounded w-32 mb-2"></div>
                          <div className="h-2 bg-gray-500 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    </div>

                    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 transform -rotate-2 hover:rotate-0 transition-transform shadow-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-400 rounded-lg shadow-lg"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-800 rounded w-32 mb-2"></div>
                          <div className="h-2 bg-gray-500 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
            </svg>
          </div>
        </div>

        {/* Latest Jobs Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Latest Job Opportunities</h2>
              <p className="text-lg text-gray-600">Discover the newest openings from top employers</p>
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

            {/* Job Listings */}
            {loadingJobs ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : latestJobs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No jobs available at the moment. Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {latestJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onApply={userType === 'employee' ? handleApply : undefined}
                      onShortlist={userType === 'employee' ? handleShortlist : undefined}
                      onViewContact={userType === 'employee' ? handleViewContact : undefined}
                    />
                  ))}
                </div>

                {/* View More Button */}
                <div className="text-center mt-8">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    View All Jobs
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Features Section - Enhanced */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose JobPortal?</h2>
              <p className="text-xl text-gray-600">Everything you need for a successful job search</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Smart Job Search</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced AI-powered search filters help you find perfect matches based on your skills, experience, and preferences.
                </p>
              </div>

              <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="bg-purple-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Professional CV Builder</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create stunning, ATS-friendly resumes with our easy-to-use builder. Choose from professional templates.
                </p>
              </div>

              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="bg-green-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Top Employers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect directly with hiring managers at leading companies actively looking for talented professionals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Get hired in 3 simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>

              <div className="relative text-center">
                <div className="bg-white w-40 h-40 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10">
                  <div className="text-6xl">📝</div>
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl z-20">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Create Profile</h3>
                <p className="text-gray-600">
                  Sign up and build your professional profile with your skills and experience
                </p>
              </div>

              <div className="relative text-center">
                <div className="bg-white w-40 h-40 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10">
                  <div className="text-6xl">🔍</div>
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl z-20">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Search & Apply</h3>
                <p className="text-gray-600">
                  Browse thousands of jobs and apply to positions that match your profile
                </p>
              </div>

              <div className="relative text-center">
                <div className="bg-white w-40 h-40 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10">
                  <div className="text-6xl">🎉</div>
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl z-20">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Get Hired</h3>
                <p className="text-gray-600">
                  Connect with employers, ace your interviews, and land your dream job
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-xl text-gray-600">Hear from people who found their dream jobs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Software Engineer',
                  company: 'Tech Corp',
                  image: '👩‍💻',
                  text: 'JobPortal helped me land my dream role! The process was smooth and I got multiple interview calls within a week.'
                },
                {
                  name: 'Michael Chen',
                  role: 'Marketing Manager',
                  company: 'Growth Inc',
                  image: '👨‍💼',
                  text: 'Best job portal I\'ve used. The CV builder is amazing and helped me stand out from other candidates.'
                },
                {
                  name: 'Emily Davis',
                  role: 'Data Analyst',
                  company: 'Analytics Pro',
                  image: '👩‍💼',
                  text: 'Found my perfect job in just 2 weeks! The smart matching algorithm really works. Highly recommended!'
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="text-5xl mr-4">{testimonial.image}</div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-blue-600">{testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">&quot;{testimonial.text}&quot;</p>
                  <div className="flex mt-4 text-yellow-400">
                    {'⭐'.repeat(5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section - Enhanced */}
        <div className="relative py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Take the Next Step?</h2>
            <p className="text-xl md:text-2xl mb-10 text-blue-100">
              Join thousands of professionals who found their dream careers through JobPortal
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/register?type=employee"
                className="bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
              >
                Find Your Dream Job →
              </Link>
              <Link
                href="/auth/register?type=employer"
                className="bg-transparent text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all border-2 border-white"
              >
                Hire Top Talent
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Easy 3-Step Process</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Professional Support</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
