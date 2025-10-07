import Link from 'next/link';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
  onApply?: (jobId: string) => void;
  onShortlist?: (jobId: string) => void;
}

export default function JobCard({ job, showApplyButton = true, onShortlist }: JobCardProps) {
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
        <p className="text-blue-600 font-semibold mb-4">{job.salary}</p>
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
                ? 'bg-blue-100 text-blue-800'
                : job.status === 'shortlisted'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      )}

      {showApplyButton && (
        <div className="flex gap-2">
          <Link
            href={`/jobs/${job.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          {onShortlist && (
            <button
              onClick={() => onShortlist(job.id)}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Add to Shortlist"
            >
              <svg
                className="w-5 h-5 text-gray-600"
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
            </button>
          )}
        </div>
      )}
    </div>
  );
}
