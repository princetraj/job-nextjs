'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { employerService } from '@/services/employerService';
import { Employee } from '@/types';
import EmployeeFilter from '@/components/EmployeeFilter';
import EmployeeCard from '@/components/EmployeeCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

export default function FindEmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    q: '',
    education_level_id: '',
    degree_id: '',
    university_id: '',
    field_of_study_id: '',
    skill_ids: [] as string[],
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');

      const params: Record<string, string | string[] | number> = {
        page: currentPage,
        limit: 10,
      };

      if (filters.q) params.q = filters.q;
      if (filters.education_level_id) params.education_level_id = filters.education_level_id;
      if (filters.degree_id) params.degree_id = filters.degree_id;
      if (filters.university_id) params.university_id = filters.university_id;
      if (filters.field_of_study_id) params.field_of_study_id = filters.field_of_study_id;
      if (filters.skill_ids.length > 0) params.skill_ids = filters.skill_ids;

      const response = await employerService.searchEmployees(params);

      setEmployees(response.employees.data);
      setTotalPages(response.employees.last_page);
      setTotal(response.employees.total);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: {
    q?: string;
    education_level_id?: string;
    degree_id?: string;
    university_id?: string;
    field_of_study_id?: string;
    skill_ids?: string[];
  }) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadEmployees();
  };

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setSelectedEmployee(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && employees.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Find Employees</h1>
            <p className="text-gray-600 mt-2">
              Search and filter employees based on their education, skills, and experience
            </p>
          </div>

        {/* Filter Component */}
        <EmployeeFilter onFilterChange={handleFilterChange} onSearch={handleSearch} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-700">
            Found <span className="font-semibold">{total}</span> employee{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Employee List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No employees found</h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Employee Profile Modal */}
      {showProfileModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Employee Profile</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Profile Content */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-start gap-4">
                  {selectedEmployee.public_profile_photo_url ? (
                    <img
                      src={selectedEmployee.public_profile_photo_url}
                      alt={selectedEmployee.name || 'Employee'}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-3xl font-semibold text-blue-600">
                        {selectedEmployee.name ? selectedEmployee.name.charAt(0).toUpperCase() : 'E'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedEmployee.name || 'Candidate'}
                    </h3>
                    <p className="text-gray-600">{selectedEmployee.email}</p>
                    {selectedEmployee.mobile && (
                      <p className="text-gray-600">{selectedEmployee.mobile}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedEmployee.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700">{selectedEmployee.description}</p>
                  </div>
                )}

                {/* Education */}
                {selectedEmployee.education_details && selectedEmployee.education_details.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Education</h4>
                    <div className="space-y-3">
                      {selectedEmployee.education_details.map((edu, idx) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4">
                          <p className="font-semibold text-gray-900">{edu.degree}</p>
                          <p className="text-gray-700">{edu.university}</p>
                          {edu.field && <p className="text-gray-600">Field: {edu.field}</p>}
                          <p className="text-gray-500 text-sm">
                            {edu.year_start} - {edu.year_end}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedEmployee.experience_details && selectedEmployee.experience_details.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Experience</h4>
                    <div className="space-y-3">
                      {selectedEmployee.experience_details.map((exp, idx) => (
                        <div key={idx} className="border-l-4 border-green-500 pl-4">
                          <p className="font-semibold text-gray-900">{exp.title}</p>
                          <p className="text-gray-700">{exp.company}</p>
                          <p className="text-gray-500 text-sm">
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

                {/* Skills */}
                {selectedEmployee.skills_details && selectedEmployee.skills_details.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.skills_details.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CV Download */}
                {selectedEmployee.cv_url && (
                  <div>
                    <a
                      href={selectedEmployee.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Download CV
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
