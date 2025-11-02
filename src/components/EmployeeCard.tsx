'use client';

import { Employee } from '@/types';
import { useState } from 'react';

interface EmployeeCardProps {
  employee: Employee;
  onViewProfile?: (employee: Employee) => void;
}

export default function EmployeeCard({ employee, onViewProfile }: EmployeeCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          {employee.public_profile_photo_url && !imageError ? (
            <img
              src={employee.public_profile_photo_url}
              alt={employee.name || 'Employee'}
              className="w-20 h-20 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600">
                {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
              </span>
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {employee.name || 'Candidate'}
          </h3>

          {/* Email */}
          <p className="text-sm text-gray-600 mb-2">
            {employee.email}
          </p>

          {/* Description */}
          {employee.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {employee.description}
            </p>
          )}

          {/* Education */}
          {employee.education_details && employee.education_details.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Education:</p>
              {employee.education_details.slice(0, 2).map((edu, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  <span className="font-medium">{edu.degree}</span>
                  {edu.university && <span> - {edu.university}</span>}
                  {edu.field && <span> ({edu.field})</span>}
                </div>
              ))}
              {employee.education_details.length > 2 && (
                <p className="text-xs text-blue-600 mt-1">
                  +{employee.education_details.length - 2} more
                </p>
              )}
            </div>
          )}

          {/* Experience */}
          {employee.experience_details && employee.experience_details.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Experience:</p>
              {employee.experience_details.slice(0, 1).map((exp, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  <span className="font-medium">{exp.title}</span>
                  {exp.company && <span> at {exp.company}</span>}
                </div>
              ))}
              {employee.experience_details.length > 1 && (
                <p className="text-xs text-blue-600 mt-1">
                  +{employee.experience_details.length - 1} more
                </p>
              )}
            </div>
          )}

          {/* Skills */}
          {employee.skills_details && employee.skills_details.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {employee.skills_details.slice(0, 5).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {employee.skills_details.length > 5 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    +{employee.skills_details.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* View Profile Button */}
          <button
            onClick={() => onViewProfile?.(employee)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
