'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { publicService } from '@/services/publicService';
import { employeeService } from '@/services/employeeService';
import { Job, Location, Category } from '@/types';
import { getUserType } from '@/lib/api';

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
  const userType = getUserType();

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

  const handleShortlist = async (jobId: string) => {
    if (userType !== 'employee') {
      alert('Please login as a job seeker to shortlist jobs');
      return;
    }
    try {
      await employeeService.shortlistJob(jobId);
      alert('Job added to shortlist!');
    } catch {
      alert('Failed to shortlist job');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Jobs</h1>

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
                  <JobCard key={job.id} job={job} onShortlist={handleShortlist} />
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
    </div>
  );
}
