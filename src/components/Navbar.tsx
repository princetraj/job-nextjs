'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getUserType, clearAuth } from '@/lib/api';
import { authService } from '@/services/authService';
import { employeeService } from '@/services/employeeService';

export default function Navbar() {
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCVRequestModal, setShowCVRequestModal] = useState(false);
  const [cvRequestLoading, setCVRequestLoading] = useState(false);
  const [cvRequestNotes, setCVRequestNotes] = useState('');
  const [hasPendingCVRequest, setHasPendingCVRequest] = useState(false);
  const cvPrice = 50;

  useEffect(() => {
    setUserType(getUserType());
  }, []);

  useEffect(() => {
    const checkCVRequestStatus = async () => {
      if (userType === 'employee') {
        try {
          const cvRequestsData = await employeeService.getCVRequests();
          const pendingRequest = cvRequestsData.requests?.find(
            (req) => req.status === 'pending' || req.status === 'in_progress'
          );
          setHasPendingCVRequest(!!pendingRequest);
        } catch {
          // Silently fail if unable to fetch CV requests
          setHasPendingCVRequest(false);
        }
      }
    };

    checkCVRequestStatus();
  }, [userType]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUserType(null);
      router.push('/');
    } catch {
      clearAuth();
      setUserType(null);
      router.push('/');
    }
  };

  const handleCVButtonClick = () => {
    if (!userType) {
      router.push('/auth/login');
    } else if (userType === 'employee' && !hasPendingCVRequest) {
      setShowCVRequestModal(true);
    }
  };

  const handleCVRequest = async () => {
    if (!cvRequestNotes.trim()) {
      alert('Please provide some notes about your CV requirements');
      return;
    }

    setCVRequestLoading(true);
    try {
      await employeeService.requestProfessionalCV({
        notes: cvRequestNotes,
        price: cvPrice,
      });
      alert('Professional CV request submitted successfully! You will be notified once it is processed.');
      setShowCVRequestModal(false);
      setCVRequestNotes('');
      setHasPendingCVRequest(true);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Failed to submit CV request';
        alert(message);
      } else {
        alert('Failed to submit CV request');
      }
    } finally {
      setCVRequestLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="WayUp360 Jobs"
                width={250}
                height={90}
                priority
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {userType === 'employer' ? (
              <Link
                href="/employer/find-employees"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Employees
              </Link>
            ) : (
              <Link
                href="/jobs"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Jobs
              </Link>
            )}

            {/* Professional CV Button - Available for all users */}
            {userType !== 'employer' && (
              <button
                onClick={handleCVButtonClick}
                disabled={userType === 'employee' && hasPendingCVRequest}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  userType === 'employee' && hasPendingCVRequest
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
                title={
                  !userType
                    ? 'Login to request Professional CV'
                    : hasPendingCVRequest
                    ? 'CV Request in Progress'
                    : 'Request Professional CV'
                }
              >
                Professional CV
              </button>
            )}

            {!userType && (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}

            {userType === 'employee' && (
              <>
                <Link
                  href="/employee/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/employee/upgrade-plan"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Upgrade Plan
                </Link>
                <Link
                  href="/employee/profile"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            )}

            {userType === 'employer' && (
              <>
                <Link
                  href="/employer/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/employer/jobs/create"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Post Job
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {userType === 'employer' ? (
              <Link
                href="/employer/find-employees"
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Find Employees
              </Link>
            ) : (
              <Link
                href="/jobs"
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Find Jobs
              </Link>
            )}

            {/* Professional CV Button - Mobile */}
            {userType !== 'employer' && (
              <button
                onClick={handleCVButtonClick}
                disabled={userType === 'employee' && hasPendingCVRequest}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  userType === 'employee' && hasPendingCVRequest
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {userType === 'employee' && hasPendingCVRequest
                  ? 'Professional CV (Request in Progress)'
                  : 'Professional CV'}
              </button>
            )}

            {!userType && (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}

            {userType && (
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}

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
                      Our experts will create a professional CV for you. This is a paid service (₹{cvPrice}).
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
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
