'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { employeeService } from '@/services/employeeService';
import { handleApiError } from '@/lib/api';
import { Employee } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

export default function CVBuilderPage() {
  const router = useRouter();
  const params = useParams();
  // CV ID for future use when implementing full builder functionality
  // const cvId = params.cvId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<Employee | null>(null);

  // Fetch employee profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await employeeService.getProfile();
        setProfile(data.user);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleGenerateCV = async () => {
    try {
      setSaving(true);
      setError('');
      await employeeService.generateCV();
      setSuccess('CV generated successfully!');
      setTimeout(() => {
        router.push('/employee/cv');
      }, 2000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/employee/cv')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to CVs
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CV Builder</h1>
          <p className="text-gray-600 mt-1">
            Build your professional CV using your profile information
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* CV Preview Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">CV Preview</h2>

          <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-gray-300">
              <div className="flex items-center gap-6">
                {/* Profile Photo */}
                {profile?.profile_photo_status === 'approved' && profile?.profile_photo_full_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={profile.profile_photo_full_url}
                      alt={profile.name || 'Profile'}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                    />
                  </div>
                )}

                {/* Header Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                  <p className="text-gray-600 mt-2">{profile?.email}</p>
                  {profile?.mobile && <p className="text-gray-600">{profile.mobile}</p>}
                  {profile?.address && (
                    <p className="text-gray-600 mt-1">
                      {[
                        profile.address.street,
                        profile.address.city,
                        profile.address.state,
                        profile.address.zip,
                        profile.address.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Education */}
            {profile?.education_details && profile.education_details.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                  Education
                </h2>
                <div className="space-y-4">
                  {profile.education_details.map((edu, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.university}</p>
                      <p className="text-gray-600 text-sm">
                        {edu.field} | {edu.year_start} - {edu.year_end}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile?.experience_details && profile.experience_details.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                  Experience
                </h2>
                <div className="space-y-4">
                  {profile.experience_details.map((exp, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      <p className="text-gray-600 text-sm mb-2">
                        {exp.year_start} - {exp.year_end}
                      </p>
                      <p className="text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile?.skills_details && profile.skills_details.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills_details.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready to Generate?</h3>
              <p className="text-gray-600 text-sm mt-1">
                Click the button below to generate your CV as a PDF
              </p>
            </div>
            <button
              onClick={handleGenerateCV}
              disabled={saving}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Generate CV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-blue-900 text-sm">
            <strong>Note:</strong> The CV will be generated using the information from your profile.
            Make sure your profile is complete before generating the CV. You can update your profile
            information from the{' '}
            <button
              onClick={() => router.push('/employee/profile')}
              className="text-blue-700 underline hover:text-blue-900"
            >
              profile page
            </button>
            .
          </p>
          {profile?.profile_photo_status === 'approved' && profile?.profile_photo_full_url && (
            <p className="text-green-900 text-sm mt-2">
              <strong>✓</strong> Your approved profile photo will be included in the generated CV.
            </p>
          )}
          {profile?.profile_photo_status === 'pending' && (
            <p className="text-yellow-900 text-sm mt-2">
              <strong>⚠</strong> Your profile photo is pending approval. Once approved, it will be included in your CV.
            </p>
          )}
          {!profile?.profile_photo_url && (
            <p className="text-gray-700 text-sm mt-2">
              <strong>ℹ</strong> Upload a profile photo to make your CV more professional.
            </p>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
