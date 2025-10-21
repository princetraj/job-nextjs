'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeProfileSchema, type EmployeeProfileFormData } from '@/lib/validations/employeeProfileSchema';
import { employeeService } from '@/services/employeeService';
import { publicService } from '@/services/publicService';
import { handleApiError } from '@/lib/api';
import { Employee, Skill } from '@/types';
import { FormInput, FormTextarea } from '@/components/FormInput';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<Employee | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillDropdownRef = useRef<HTMLDivElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeProfileFormData>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: {
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
      education_details: [],
      experience_details: [],
      skills_details: [],
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: 'education_details',
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: 'experience_details',
  });

  const skills = watch('skills_details') || [];

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeService.getProfile();
      setProfile(data.user);

      // Populate form with existing data
      reset({
        name: data.user.name,
        email: data.user.email,
        mobile: data.user.mobile,
        gender: data.user.gender as 'M' | 'F' | 'O' | undefined,
        dob: data.user.dob,
        address: data.user.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
        },
        education_details: data.user.education_details || [],
        experience_details: data.user.experience_details || [],
        skills_details: data.user.skills_details || [],
      });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch available skills
  useEffect(() => {
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const response = await publicService.getSkills();
        setAvailableSkills(response.skills);
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  // Update selected skill IDs when profile or available skills change
  useEffect(() => {
    if (profile && profile.skills_details && availableSkills.length > 0) {
      // Map skill names to IDs
      const skillIds = availableSkills
        .filter((skill) => profile.skills_details?.includes(skill.name))
        .map((skill) => skill.id);
      setSelectedSkillIds(skillIds);
    }
  }, [profile, availableSkills]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSubmit = async (data: EmployeeProfileFormData) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Update each field individually as per API design
      // Only send non-empty values (API requires value to be non-null)
      const updates = [];

      // Address - only if at least one field is filled
      if (data.address && (data.address.street || data.address.city || data.address.state || data.address.zip || data.address.country)) {
        updates.push({ field: 'address', value: data.address });
      }

      // Education - only if array has items
      if (data.education_details && data.education_details.length > 0) {
        updates.push({ field: 'education_details', value: data.education_details });
      }

      // Experience - only if array has items
      if (data.experience_details && data.experience_details.length > 0) {
        updates.push({ field: 'experience_details', value: data.experience_details });
      }

      // Skills - send skill IDs instead of names
      if (selectedSkillIds && selectedSkillIds.length > 0) {
        updates.push({ field: 'skills_details', value: selectedSkillIds });
      }

      // Check if there are any updates to send
      if (updates.length === 0) {
        setError('Please fill in at least one field to update your profile.');
        return;
      }

      // Send updates one by one
      for (const update of updates) {
        try {
          await employeeService.updateProfile(update.field, update.value);
        } catch (err) {
          console.error(`Error updating ${update.field}:`, err);
          const errorMessage = err instanceof Error ? err.message : 'Update failed';
          throw new Error(`Failed to update ${update.field}: ${errorMessage}`);
        }
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Refresh profile data
      await fetchProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err instanceof Error ? err.message : handleApiError(err);
      setError(errorMessage);
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
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile,
        gender: profile.gender as 'M' | 'F' | 'O' | undefined,
        dob: profile.dob,
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
        },
        education_details: profile.education_details || [],
        experience_details: profile.experience_details || [],
        skills_details: profile.skills_details || [],
      });
    }
  };

  const handleAddSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => [...prev, skillId]);
    setSkillSearchQuery('');
    setShowSkillDropdown(false);
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  const getSelectedSkills = () => {
    return availableSkills.filter((skill) => selectedSkillIds.includes(skill.id));
  };

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
      !selectedSkillIds.includes(skill.id)
  );

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Only JPG, JPEG, and PNG files are allowed');
      return;
    }

    try {
      setUploadingPhoto(true);
      setError('');
      setSuccess('');

      const response = await employeeService.uploadProfilePhoto(file);
      setSuccess(response.message);

      // Refresh profile to get updated photo status
      await fetchProfile();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getPhotoStatusBadge = () => {
    if (!profile?.profile_photo_status) return null;

    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Approval' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[profile.profile_photo_status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
              <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
              <p className="text-gray-600 mt-1">{profile?.email}</p>
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
          {/* Profile Photo Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Photo Display */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profile?.profile_photo_url && profile.profile_photo_status === 'approved' ? (
                    <img
                      src={
                        profile.profile_photo_full_url ||
                        (process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + profile.profile_photo_url)
                      }
                      alt={profile.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Upload Section */}
              <div className="flex-1">
                <div className="mb-2">
                  {getPhotoStatusBadge()}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Upload a professional photo. Only approved photos will be visible to employers.
                  <br />
                  <span className="text-xs text-gray-500">Allowed: JPG, JPEG, PNG (Max 2MB)</span>
                </p>

                {profile?.profile_photo_status === 'rejected' && profile.profile_photo_rejection_reason && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-3 text-sm">
                    <strong>Rejection Reason:</strong> {profile.profile_photo_rejection_reason}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
                      {uploadingPhoto ? (
                        <>
                          <LoadingSpinner size="sm" /> Uploading...
                        </>
                      ) : profile?.profile_photo_url && profile.profile_photo_status === 'pending' ? (
                        'Re-upload Photo'
                      ) : (
                        'Upload Photo'
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information (Read-only) */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="text"
                  value={profile?.mobile || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <input
                  type="text"
                  value={profile?.gender === 'M' ? 'Male' : profile?.gender === 'F' ? 'Female' : 'Other'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              {profile?.dob && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={new Date(profile.dob).toLocaleDateString()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Street"
                name="address.street"
                register={register}
                error={errors.address?.street}
                disabled={!isEditing}
                placeholder="Enter street address"
              />
              <FormInput
                label="City"
                name="address.city"
                register={register}
                error={errors.address?.city}
                disabled={!isEditing}
                placeholder="Enter city"
              />
              <FormInput
                label="State"
                name="address.state"
                register={register}
                error={errors.address?.state}
                disabled={!isEditing}
                placeholder="Enter state"
              />
              <FormInput
                label="ZIP Code"
                name="address.zip"
                register={register}
                error={errors.address?.zip}
                disabled={!isEditing}
                placeholder="Enter ZIP code"
              />
              <FormInput
                label="Country"
                name="address.country"
                register={register}
                error={errors.address?.country}
                disabled={!isEditing}
                placeholder="Enter country"
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Education</h2>
              {isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    appendEducation({
                      degree: '',
                      university: '',
                      field: '',
                      year_start: '',
                      year_end: '',
                    })
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  + Add Education
                </button>
              )}
            </div>

            {educationFields.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No education added yet</p>
            ) : (
              <div className="space-y-6">
                {educationFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">Education #{index + 1}</h3>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Degree"
                        name={`education_details.${index}.degree`}
                        register={register}
                        error={errors.education_details?.[index]?.degree}
                        disabled={!isEditing}
                        placeholder="e.g., Bachelor of Science"
                        required
                      />
                      <FormInput
                        label="University"
                        name={`education_details.${index}.university`}
                        register={register}
                        error={errors.education_details?.[index]?.university}
                        disabled={!isEditing}
                        placeholder="e.g., Stanford University"
                        required
                      />
                      <FormInput
                        label="Field of Study"
                        name={`education_details.${index}.field`}
                        register={register}
                        error={errors.education_details?.[index]?.field}
                        disabled={!isEditing}
                        placeholder="e.g., Computer Science"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <FormInput
                          label="Start Year"
                          name={`education_details.${index}.year_start`}
                          register={register}
                          error={errors.education_details?.[index]?.year_start}
                          disabled={!isEditing}
                          placeholder="2018"
                          required
                        />
                        <FormInput
                          label="End Year"
                          name={`education_details.${index}.year_end`}
                          register={register}
                          error={errors.education_details?.[index]?.year_end}
                          disabled={!isEditing}
                          placeholder="2022"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
              {isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    appendExperience({
                      company: '',
                      title: '',
                      description: '',
                      year_start: '',
                      year_end: '',
                    })
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  + Add Experience
                </button>
              )}
            </div>

            {experienceFields.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No experience added yet</p>
            ) : (
              <div className="space-y-6">
                {experienceFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">Experience #{index + 1}</h3>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="Company"
                          name={`experience_details.${index}.company`}
                          register={register}
                          error={errors.experience_details?.[index]?.company}
                          disabled={!isEditing}
                          placeholder="e.g., Google Inc."
                          required
                        />
                        <FormInput
                          label="Job Title"
                          name={`experience_details.${index}.title`}
                          register={register}
                          error={errors.experience_details?.[index]?.title}
                          disabled={!isEditing}
                          placeholder="e.g., Software Engineer"
                          required
                        />
                      </div>
                      <FormTextarea
                        label="Description"
                        name={`experience_details.${index}.description`}
                        register={register}
                        error={errors.experience_details?.[index]?.description}
                        disabled={!isEditing}
                        placeholder="Describe your role and achievements..."
                        required
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <FormInput
                          label="Start Year"
                          name={`experience_details.${index}.year_start`}
                          register={register}
                          error={errors.experience_details?.[index]?.year_start}
                          disabled={!isEditing}
                          placeholder="2020"
                          required
                        />
                        <FormInput
                          label="End Year"
                          name={`experience_details.${index}.year_end`}
                          register={register}
                          error={errors.experience_details?.[index]?.year_end}
                          disabled={!isEditing}
                          placeholder="2024"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>

            {isEditing ? (
              <div>
                {/* Selected Skills Display */}
                {getSelectedSkills().length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getSelectedSkills().map((skill) => (
                      <div
                        key={skill.id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                      >
                        <span>{skill.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative" ref={skillDropdownRef}>
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => {
                      setSkillSearchQuery(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    placeholder="Type to search skills..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingSkills}
                  />

                  {/* Dropdown */}
                  {showSkillDropdown && !loadingSkills && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredSkills.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          {skillSearchQuery ? 'No skills found' : 'All skills selected'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1 p-2">
                          {filteredSkills.map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleAddSkill(skill.id)}
                              className="text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none rounded border border-gray-200 hover:border-blue-300 transition-colors"
                            >
                              {skill.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {loadingSkills && (
                    <div className="absolute right-3 top-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Selected: {selectedSkillIds.length} skill(s)
                </p>
              </div>
            ) : (
              <div>
                {getSelectedSkills().length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No skills added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getSelectedSkills().map((skill) => (
                      <div
                        key={skill.id}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full"
                      >
                        <span>{skill.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
