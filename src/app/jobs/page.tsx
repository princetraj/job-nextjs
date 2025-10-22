'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { publicService } from '@/services/publicService';
import { employeeService } from '@/services/employeeService';
import { Job, Location, Category, Address } from '@/types';
import { getUserType } from '@/lib/api';

interface ContactInfo {
  company_name: string;
  email: string;
  contact: string;
  address: Address | Record<string, string | null> | null;
  industry: string | null;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    q: '',
    location_id: '',
    category_id: '',
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [contactModal, setContactModal] = useState<{
    show: boolean;
    contact: ContactInfo | null;
    alreadyViewed: boolean;
  }>({ show: false, contact: null, alreadyViewed: false });
  const userType = getUserType();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    fetchFilters();
    fetchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchFilters = async () => {
    try {
      const [locData, catData] = await Promise.all([
        publicService.getLocations(),
        publicService.getCategories(),
      ]);
      setLocations(locData.locations);
      setCategories(catData.categories);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const service = userType === 'employee' ? employeeService : publicService;
      const response = await service.searchJobs({ ...filters, page: currentPage });
      setJobs(response.jobs.data);
      setTotalPages(response.jobs.last_page);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobs();
  };

  const handleApply = async (jobId: string) => {
    if (userType !== 'employee') {
      showNotification('error', 'Please login as a job seeker to apply for jobs');
      return;
    }
    try {
      await employeeService.applyForJob(jobId);
      showNotification('success', 'Application submitted successfully!');
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
      setContactModal({
        show: true,
        contact: response.contact,
        alreadyViewed: response.already_viewed,
      });
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
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Jobs</h1>

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

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filters.location_id}
                onChange={(e) => setFilters({ ...filters, location_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <select
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">No jobs found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={userType === 'employee' ? handleApply : undefined}
                    onShortlist={userType === 'employee' ? handleShortlist : undefined}
                    onViewContact={userType === 'employee' ? handleViewContact : undefined}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Contact Details Modal */}
      {contactModal.show && contactModal.contact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Employer Contact Details</h2>
              <button
                onClick={() => setContactModal({ show: false, contact: null, alreadyViewed: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {contactModal.alreadyViewed && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  You have previously viewed this contact. No charge applied.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Company Name</label>
                <p className="text-lg text-gray-900">{contactModal.contact.company_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <a href={`mailto:${contactModal.contact.email}`} className="text-lg text-blue-600 hover:underline block">
                  {contactModal.contact.email}
                </a>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <a href={`tel:${contactModal.contact.contact}`} className="text-lg text-blue-600 hover:underline block">
                  {contactModal.contact.contact}
                </a>
              </div>

              {contactModal.contact.industry && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Industry</label>
                  <p className="text-lg text-gray-900">{contactModal.contact.industry}</p>
                </div>
              )}

              {contactModal.contact.address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900">
                    {[
                      contactModal.contact.address.street,
                      contactModal.contact.address.city,
                      contactModal.contact.address.state,
                      contactModal.contact.address.zip,
                      contactModal.contact.address.country,
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setContactModal({ show: false, contact: null, alreadyViewed: false })}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
