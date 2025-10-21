'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { employerService } from '@/services/employerService';
import { publicService } from '@/services/publicService';
import { handleApiError } from '@/lib/api';
import { Employer, Address, Industry } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EmployerProfileFormData {
  company_name: string;
  email: string;
  contact: string;
  address?: Address;
  industry_type?: string;
}

export default function EmployerProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<Employer | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployerProfileFormData>({
    defaultValues: {
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
    },
  });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employerService.getProfile();
      setProfile(data.user);

      // Populate form with existing data
      reset({
        company_name: data.user.company_name,
        email: data.user.email,
        contact: data.user.contact,
        address: data.user.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
        },
        industry_type: data.user.industry_type,
      });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [reset]);

  // Fetch industries
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await publicService.getIndustries();
        setIndustries(response.industries);
      } catch (err) {
        console.error('Failed to load industries:', err);
      }
    };
    fetchIndustries();
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data: EmployerProfileFormData) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Prepare update payload (only editable fields)
      const updatePayload: Partial<Employer> = {};

      if (data.contact && data.contact !== profile?.contact) {
        updatePayload.contact = data.contact;
      }

      if (data.address) {
        updatePayload.address = data.address;
      }

      if (data.industry_type && data.industry_type !== profile?.industry_type) {
        updatePayload.industry_type = data.industry_type;
      }

      // Check if there are any updates to send
      if (Object.keys(updatePayload).length === 0) {
        setError('No changes detected.');
        return;
      }

      // Update profile
      await employerService.updateProfile(updatePayload);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Refresh profile data
      await fetchProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form to original values
    if (profile) {
      reset({
        company_name: profile.company_name,
        email: profile.email,
        contact: profile.contact,
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
        },
        industry_type: profile.industry_type,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
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
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile?.company_name}</h1>
              <p className="text-gray-600 mt-1">{profile?.email}</p>
              {profile?.industry && (
                <p className="text-sm text-gray-500 mt-1">Industry: {profile.industry.name}</p>
              )}
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </div>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  {...register('company_name')}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('contact', { required: 'Contact number is required' })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                  placeholder="Enter contact number"
                />
                {errors.contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  {...register('industry_type')}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  {...register('address.street')}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  {...register('address.city')}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  {...register('address.state')}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  {...register('address.zip')}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                  placeholder="Enter ZIP code"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  {...register('address.country')}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
