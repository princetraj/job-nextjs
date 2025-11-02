import { useState, useEffect } from 'react';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
  onApply?: (jobId: string) => Promise<void>;
  onShortlist?: (jobId: string) => Promise<void>;
  onViewContact?: (jobId: string) => Promise<void>;
}

export default function JobCard({ job, showApplyButton = true, onApply, onShortlist, onViewContact }: JobCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [isViewingContact, setIsViewingContact] = useState(false);
  const [applied, setApplied] = useState(job.is_applied || false);
  const [shortlisted, setShortlisted] = useState(job.is_shortlisted || false);

  // Update state when job prop changes (e.g., after page reload)
  useEffect(() => {
    setApplied(job.is_applied || false);
    setShortlisted(job.is_shortlisted || false);
  }, [job.is_applied, job.is_shortlisted]);

  const handleApply = async () => {
    if (!onApply || isApplying || applied) return;
    setIsApplying(true);
    try {
      await onApply(job.id);
      setApplied(true);
    } catch (error) {
      console.error('Apply error:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleShortlist = async () => {
    if (!onShortlist || isShortlisting || shortlisted) return;
    setIsShortlisting(true);
    try {
      await onShortlist(job.id);
      setShortlisted(true);
    } catch (error) {
      console.error('Shortlist error:', error);
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleViewContact = async () => {
    if (!onViewContact || isViewingContact) return;
    setIsViewingContact(true);
    try {
      await onViewContact(job.id);
    } catch (error) {
      console.error('View contact error:', error);
    } finally {
      setIsViewingContact(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-gray-600 mb-2">{job.employer?.company_name || 'Company'}</p>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            {job.location && (
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
                {job.location.name}
              </span>
            )}
            {job.category && (
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
          </div>
        </div>
        {job.is_featured && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Featured
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

      {job.salary && (
        <p className="text-blue-600 font-semibold mb-4">₹ {job.salary}</p>
      )}

      {job.status && (
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              job.status === 'selected'
                ? 'bg-green-100 text-green-800'
                : job.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : job.status === 'interview_scheduled'
                ? 'bg-purple-100 text-purple-800'
                : job.status === 'shortlisted'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {job.status.replace('_', ' ').toUpperCase()}
          </span>

          {/* Show interview details if status is interview_scheduled */}
          {job.status === 'interview_scheduled' && job.interview_date && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Interview Details
              </h4>
              <div className="text-xs text-purple-900 space-y-1">
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(job.interview_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                {job.interview_time && (
                  <p>
                    <span className="font-medium">Time:</span> {job.interview_time}
                  </p>
                )}
                {job.interview_location && (
                  <p>
                    <span className="font-medium">Location:</span> {job.interview_location}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showApplyButton && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {onApply && (
              <button
                onClick={handleApply}
                disabled={isApplying || applied}
                className={`flex-1 text-white text-center py-2 px-4 rounded-md transition-colors font-medium ${
                  applied
                    ? 'bg-green-600 hover:bg-green-700 cursor-default'
                    : isApplying
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isApplying ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Applying...
                  </span>
                ) : applied ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Applied
                  </span>
                ) : (
                  'Apply Now'
                )}
              </button>
            )}
            {onShortlist && (
              <button
                onClick={handleShortlist}
                disabled={isShortlisting || shortlisted}
                className={`p-2 border rounded-md transition-colors ${
                  shortlisted
                    ? 'bg-yellow-50 border-yellow-500'
                    : isShortlisting
                    ? 'bg-gray-50 border-gray-300 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                title={shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
              >
                <svg
                  className={`w-5 h-5 ${
                    shortlisted ? 'text-yellow-600' : 'text-gray-600'
                  }`}
                  fill={shortlisted ? 'currentColor' : 'none'}
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
              </button>
            )}
          </div>
          {onViewContact && (
            <button
              onClick={handleViewContact}
              disabled={isViewingContact}
              className={`w-full text-center py-2 px-4 rounded-md transition-colors font-medium border ${
                isViewingContact
                  ? 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {isViewingContact ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center justify-center">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  View Contact Details
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
