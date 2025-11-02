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
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillDropdownRef = useRef<HTMLDivElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);
  const skillInputRef = useRef<HTMLInputElement>(null);

  // Education autocomplete state
  const [availableDegrees, setAvailableDegrees] = useState<Array<{ id: string; name: string }>>([]);
  const [availableUniversities, setAvailableUniversities] = useState<Array<{ id: string; name: string }>>([]);
  const [availableFieldOfStudies, setAvailableFieldOfStudies] = useState<Array<{ id: string; name: string }>>([]);
  const [availableEducationLevels, setAvailableEducationLevels] = useState<Array<{ id: number; name: string; status: string; order: number }>>([]);
  const [availableCompanies, setAvailableCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [availableJobTitles, setAvailableJobTitles] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingEducationData, setLoadingEducationData] = useState(false);
  const [loadingExperienceData, setLoadingExperienceData] = useState(false);
  const [activeAutocomplete, setActiveAutocomplete] = useState<{ index: number; field: string } | null>(null);
  const educationDropdownRef = useRef<HTMLDivElement>(null);
  const experienceDropdownRef = useRef<HTMLDivElement>(null);

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
        description: data.user.description || '',
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

  // Fetch education autocomplete data
  useEffect(() => {
    const fetchEducationData = async () => {
      setLoadingEducationData(true);
      try {
        const [degreesRes, universitiesRes, fieldsRes, levelsRes] = await Promise.all([
          publicService.getDegrees(),
          publicService.getUniversities(),
          publicService.getFieldOfStudies(),
          publicService.getEducationLevels(),
        ]);
        setAvailableDegrees(degreesRes.degrees);
        setAvailableUniversities(universitiesRes.universities);
        setAvailableFieldOfStudies(fieldsRes.field_of_studies);
        setAvailableEducationLevels(levelsRes.education_levels.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error('Failed to load education data:', err);
      } finally {
        setLoadingEducationData(false);
      }
    };
    fetchEducationData();
  }, []);

  // Fetch experience autocomplete data
  useEffect(() => {
    const fetchExperienceData = async () => {
      setLoadingExperienceData(true);
      try {
        const [companiesRes, jobTitlesRes] = await Promise.all([
          publicService.getCompanies(),
          publicService.getJobTitles(),
        ]);
        setAvailableCompanies(companiesRes.companies);
        setAvailableJobTitles(jobTitlesRes.job_titles);
      } catch (err) {
        console.error('Failed to load experience data:', err);
      } finally {
        setLoadingExperienceData(false);
      }
    };
    fetchExperienceData();
  }, []);

  // Update selected skill IDs and custom skills when profile or available skills change
  useEffect(() => {
    if (profile && profile.skills_details && availableSkills.length > 0) {
      // Separate skill names into IDs (existing) and custom names (new)
      const skillIds: string[] = [];
      const customSkillNames: string[] = [];

      profile.skills_details.forEach((skillName) => {
        const existingSkill = availableSkills.find((skill) => skill.name === skillName);
        if (existingSkill) {
          skillIds.push(existingSkill.id);
        } else {
          customSkillNames.push(skillName);
        }
      });

      setSelectedSkillIds(skillIds);
      setCustomSkills(customSkillNames);
    }
  }, [profile, availableSkills]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false);
        setSelectedDropdownIndex(-1);
      }
      if (educationDropdownRef.current && !educationDropdownRef.current.contains(event.target as Node)) {
        setActiveAutocomplete(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedDropdownIndex(-1);
  }, [skillSearchQuery]);

  // Scroll selected dropdown item into view
  useEffect(() => {
    if (selectedDropdownIndex >= 0 && showSkillDropdown) {
      const selectedElement = document.querySelector(`[data-skill-index="${selectedDropdownIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedDropdownIndex, showSkillDropdown]);

  const onSubmit = async (data: EmployeeProfileFormData) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Update each field individually as per API design
      // Only send non-empty values (API requires value to be non-null)
      const updates = [];

      // Description
      if (data.description && data.description.trim()) {
        updates.push({ field: 'description', value: data.description.trim() });
      }

      // Address - only if at least one field is filled
      if (data.address && (data.address.street || data.address.city || data.address.state || data.address.zip || data.address.country)) {
        updates.push({ field: 'address', value: data.address });
      }

      // Education - only if array has items
      if (data.education_details && data.education_details.length > 0) {
        // Convert education_level_id to number (or null if empty string)
        const educationData = data.education_details.map(edu => ({
          ...edu,
          education_level_id: edu.education_level_id && edu.education_level_id !== ''
            ? Number(edu.education_level_id)
            : null
        }));
        updates.push({ field: 'education_details', value: educationData });
      }

      // Experience - only if array has items
      if (data.experience_details && data.experience_details.length > 0) {
        updates.push({ field: 'experience_details', value: data.experience_details });
      }

      // Skills - send both skill IDs and custom skill names
      if ((selectedSkillIds && selectedSkillIds.length > 0) || (customSkills && customSkills.length > 0)) {
        // Combine skill IDs and custom skill names
        const allSkills = [...selectedSkillIds, ...customSkills];
        updates.push({ field: 'skills_details', value: allSkills });
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
        description: profile.description || '',
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

      // Reset skills to original values
      if (profile.skills_details && availableSkills.length > 0) {
        const skillIds: string[] = [];
        const customSkillNames: string[] = [];

        profile.skills_details.forEach((skillName) => {
          const existingSkill = availableSkills.find((skill) => skill.name === skillName);
          if (existingSkill) {
            skillIds.push(existingSkill.id);
          } else {
            customSkillNames.push(skillName);
          }
        });

        setSelectedSkillIds(skillIds);
        setCustomSkills(customSkillNames);
      }
    }
  };

  const handleAddSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => [...prev, skillId]);
    setSkillSearchQuery('');
    setShowSkillDropdown(false);
    setSelectedDropdownIndex(-1);
  };

  const handleAddCustomSkill = () => {
    const trimmedSkill = skillSearchQuery.trim();
    if (!trimmedSkill) return;

    // Check if it already exists in selected skills
    const existingSkill = availableSkills.find((skill) => skill.name.toLowerCase() === trimmedSkill.toLowerCase());
    if (existingSkill) {
      // If it's a database skill, add by ID
      if (!selectedSkillIds.includes(existingSkill.id)) {
        handleAddSkill(existingSkill.id);
      }
    } else {
      // Add as custom skill if not already added
      if (!customSkills.some((skill) => skill.toLowerCase() === trimmedSkill.toLowerCase())) {
        setCustomSkills((prev) => [...prev, trimmedSkill]);
      }
    }
    setSkillSearchQuery('');
    setShowSkillDropdown(false);
    setSelectedDropdownIndex(-1);
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  const handleRemoveCustomSkill = (skillName: string) => {
    setCustomSkills((prev) => prev.filter((name) => name !== skillName));
  };

  const getSelectedSkills = () => {
    return availableSkills.filter((skill) => selectedSkillIds.includes(skill.id));
  };

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
      !selectedSkillIds.includes(skill.id)
  );

  // Helper function to filter education autocomplete options
  const getFilteredOptions = (options: Array<{ id: string; name: string }>, searchValue: string) => {
    if (!searchValue) return options.slice(0, 10); // Show first 10 if no search
    return options.filter(option =>
      option.name.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
  };

  // Helper to render autocomplete dropdown
  const renderAutocompleteDropdown = (
    options: Array<{ id: string; name: string }>,
    currentValue: string,
    onSelect: (value: string) => void,
    fieldName: string
  ) => {
    const filtered = getFilteredOptions(options, currentValue);

    return (
      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
        {filtered.length === 0 && currentValue ? (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>"{currentValue}" will be added as new {fieldName} (pending admin approval)</span>
            </div>
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.name)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-gray-900 font-medium transition-colors"
              >
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Highlight matching text in skill names
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={index} className="font-semibold text-blue-700">{part}</strong>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  // Handle keyboard navigation in dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSkillDropdown || loadingSkills) return;

    const totalOptions = filteredSkills.length > 0 ? filteredSkills.length : 1; // 1 for custom skill option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedDropdownIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedDropdownIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedDropdownIndex >= 0) {
          if (filteredSkills.length > 0 && selectedDropdownIndex < filteredSkills.length) {
            // Select from filtered skills
            handleAddSkill(filteredSkills[selectedDropdownIndex].id);
          } else {
            // Add custom skill
            handleAddCustomSkill();
          }
        } else {
          handleAddCustomSkill();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSkillDropdown(false);
        setSelectedDropdownIndex(-1);
        break;
    }
  };

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

          {/* About Me / Description Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
            <FormTextarea
              label="Description"
              name="description"
              register={register}
              error={errors.description}
              disabled={!isEditing}
              placeholder="Tell us about yourself, your career goals, achievements, and what makes you unique..."
              rows={6}
            />
            {!isEditing && !profile?.description && (
              <p className="text-gray-500 italic text-sm mt-2">No description added yet</p>
            )}
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
                      {/* Education Level Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Education Level
                        </label>
                        <select
                          {...register(`education_details.${index}.education_level_id` as const)}
                          disabled={!isEditing}
                          onChange={(e) => {
                            const value = e.target.value;
                            setValue(`education_details.${index}.education_level_id`, value ? Number(value) : null);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                          } border-gray-300`}
                        >
                          <option value="">Select Education Level</option>
                          {availableEducationLevels.map((level) => (
                            <option key={level.id} value={level.id}>
                              {level.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Degree Autocomplete */}
                      <div className="relative" ref={activeAutocomplete?.index === index && activeAutocomplete?.field === 'degree' ? educationDropdownRef : null}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Degree <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`education_details.${index}.degree`)}
                          type="text"
                          disabled={!isEditing}
                          placeholder="e.g., Bachelor of Science"
                          onFocus={() => isEditing && setActiveAutocomplete({ index, field: 'degree' })}
                          onChange={(e) => {
                            setValue(`education_details.${index}.degree`, e.target.value);
                            setActiveAutocomplete({ index, field: 'degree' });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                          } ${errors.education_details?.[index]?.degree ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.education_details?.[index]?.degree && (
                          <p className="text-red-500 text-xs mt-1">{errors.education_details[index]?.degree?.message}</p>
                        )}
                        {isEditing && activeAutocomplete?.index === index && activeAutocomplete?.field === 'degree' && watch(`education_details.${index}.degree`) && (
                          renderAutocompleteDropdown(
                            availableDegrees,
                            watch(`education_details.${index}.degree`) || '',
                            (value) => {
                              setValue(`education_details.${index}.degree`, value);
                              setActiveAutocomplete(null);
                            },
                            'degree'
                          )
                        )}
                      </div>

                      {/* University Autocomplete */}
                      <div className="relative" ref={activeAutocomplete?.index === index && activeAutocomplete?.field === 'university' ? educationDropdownRef : null}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          University <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`education_details.${index}.university`)}
                          type="text"
                          disabled={!isEditing}
                          placeholder="e.g., Stanford University"
                          onFocus={() => isEditing && setActiveAutocomplete({ index, field: 'university' })}
                          onChange={(e) => {
                            setValue(`education_details.${index}.university`, e.target.value);
                            setActiveAutocomplete({ index, field: 'university' });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                          } ${errors.education_details?.[index]?.university ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.education_details?.[index]?.university && (
                          <p className="text-red-500 text-xs mt-1">{errors.education_details[index]?.university?.message}</p>
                        )}
                        {isEditing && activeAutocomplete?.index === index && activeAutocomplete?.field === 'university' && watch(`education_details.${index}.university`) && (
                          renderAutocompleteDropdown(
                            availableUniversities,
                            watch(`education_details.${index}.university`) || '',
                            (value) => {
                              setValue(`education_details.${index}.university`, value);
                              setActiveAutocomplete(null);
                            },
                            'university'
                          )
                        )}
                      </div>

                      {/* Field of Study Autocomplete */}
                      <div className="relative" ref={activeAutocomplete?.index === index && activeAutocomplete?.field === 'field' ? educationDropdownRef : null}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field of Study <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`education_details.${index}.field`)}
                          type="text"
                          disabled={!isEditing}
                          placeholder="e.g., Computer Science"
                          onFocus={() => isEditing && setActiveAutocomplete({ index, field: 'field' })}
                          onChange={(e) => {
                            setValue(`education_details.${index}.field`, e.target.value);
                            setActiveAutocomplete({ index, field: 'field' });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                          } ${errors.education_details?.[index]?.field ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.education_details?.[index]?.field && (
                          <p className="text-red-500 text-xs mt-1">{errors.education_details[index]?.field?.message}</p>
                        )}
                        {isEditing && activeAutocomplete?.index === index && activeAutocomplete?.field === 'field' && watch(`education_details.${index}.field`) && (
                          renderAutocompleteDropdown(
                            availableFieldOfStudies,
                            watch(`education_details.${index}.field`) || '',
                            (value) => {
                              setValue(`education_details.${index}.field`, value);
                              setActiveAutocomplete(null);
                            },
                            'field of study'
                          )
                        )}
                      </div>
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
                        {/* Company Autocomplete */}
                        <div className="relative" ref={activeAutocomplete?.index === index && activeAutocomplete?.field === 'company' ? experienceDropdownRef : null}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register(`experience_details.${index}.company`)}
                            type="text"
                            disabled={!isEditing}
                            placeholder="e.g., Google Inc."
                            onFocus={() => isEditing && setActiveAutocomplete({ index, field: 'company' })}
                            onChange={(e) => {
                              setValue(`experience_details.${index}.company`, e.target.value);
                              setActiveAutocomplete({ index, field: 'company' });
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                            } ${errors.experience_details?.[index]?.company ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.experience_details?.[index]?.company && (
                            <p className="text-red-500 text-xs mt-1">{errors.experience_details[index]?.company?.message}</p>
                          )}
                          {isEditing && activeAutocomplete?.index === index && activeAutocomplete?.field === 'company' && watch(`experience_details.${index}.company`) && (
                            renderAutocompleteDropdown(
                              availableCompanies,
                              watch(`experience_details.${index}.company`) || '',
                              (value) => {
                                setValue(`experience_details.${index}.company`, value);
                                setActiveAutocomplete(null);
                              },
                              'company'
                            )
                          )}
                        </div>

                        {/* Job Title Autocomplete */}
                        <div className="relative" ref={activeAutocomplete?.index === index && activeAutocomplete?.field === 'title' ? experienceDropdownRef : null}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register(`experience_details.${index}.title`)}
                            type="text"
                            disabled={!isEditing}
                            placeholder="e.g., Software Engineer"
                            onFocus={() => isEditing && setActiveAutocomplete({ index, field: 'title' })}
                            onChange={(e) => {
                              setValue(`experience_details.${index}.title`, e.target.value);
                              setActiveAutocomplete({ index, field: 'title' });
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                            } ${errors.experience_details?.[index]?.title ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.experience_details?.[index]?.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.experience_details[index]?.title?.message}</p>
                          )}
                          {isEditing && activeAutocomplete?.index === index && activeAutocomplete?.field === 'title' && watch(`experience_details.${index}.title`) && (
                            renderAutocompleteDropdown(
                              availableJobTitles,
                              watch(`experience_details.${index}.title`) || '',
                              (value) => {
                                setValue(`experience_details.${index}.title`, value);
                                setActiveAutocomplete(null);
                              },
                              'job title'
                            )
                          )}
                        </div>
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
                {(getSelectedSkills().length > 0 || customSkills.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getSelectedSkills().map((skill) => (
                      <div
                        key={skill.id}
                        className="group bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                      >
                        <span>{skill.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center transition-all duration-150"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {customSkills.map((skillName) => (
                      <div
                        key={skillName}
                        className="group bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                      >
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span>{skillName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomSkill(skillName)}
                          className="text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center transition-all duration-150"
                          title="Remove custom skill"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative" ref={skillDropdownRef}>
                  <div className="flex gap-2">
                    <input
                      ref={skillInputRef}
                      type="text"
                      value={skillSearchQuery}
                      onChange={(e) => {
                        setSkillSearchQuery(e.target.value);
                        setShowSkillDropdown(true);
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setShowSkillDropdown(true)}
                      placeholder="Type to search or add custom skill..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={loadingSkills}
                      autoComplete="off"
                    />
                    {skillSearchQuery.trim() && (
                      <button
                        type="button"
                        onClick={handleAddCustomSkill}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
                      >
                        + Add
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  {showSkillDropdown && !loadingSkills && skillSearchQuery && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden animate-fadeIn">
                      <div className="overflow-y-auto max-h-80">
                        {filteredSkills.length === 0 ? (
                          <div className="p-2">
                            <div className="px-3 py-2 text-xs text-gray-400 mb-1">
                              No matching skills
                            </div>
                            <button
                              type="button"
                              onClick={handleAddCustomSkill}
                              data-skill-index="0"
                              className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-150 ${
                                selectedDropdownIndex === 0
                                  ? 'bg-gray-100 border-l-4 border-l-blue-500'
                                  : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {skillSearchQuery.trim()}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Add as custom skill
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        ) : (
                          <div className="p-2">
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Available Skills ({filteredSkills.length})
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {filteredSkills.map((skill, index) => (
                                <button
                                  key={skill.id}
                                  type="button"
                                  onClick={() => handleAddSkill(skill.id)}
                                  onMouseEnter={() => setSelectedDropdownIndex(index)}
                                  data-skill-index={index}
                                  className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all duration-150 ${
                                    selectedDropdownIndex === index
                                      ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm'
                                      : 'border-l-4 border-l-transparent hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-900 font-medium">
                                      {highlightMatch(skill.name, skillSearchQuery)}
                                    </span>
                                    {selectedDropdownIndex === index && (
                                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                            {skillSearchQuery.trim() && (
                              <div className="mt-1 pt-1 border-t border-gray-100">
                                <button
                                  type="button"
                                  onClick={handleAddCustomSkill}
                                  data-skill-index={filteredSkills.length}
                                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-150 ${
                                    selectedDropdownIndex === filteredSkills.length
                                      ? 'bg-gray-100 border-l-4 border-l-blue-500'
                                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 truncate">
                                        {skillSearchQuery.trim()}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Add as custom skill
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Keyboard shortcuts hint */}
                      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">↑↓</kbd>
                              Navigate
                            </span>
                            <span className="flex items-center gap-1">
                              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Enter</kbd>
                              Select
                            </span>
                            <span className="flex items-center gap-1">
                              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Esc</kbd>
                              Close
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingSkills && (
                    <div className="absolute right-3 top-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between mt-3">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">
                      Selected: {selectedSkillIds.length + customSkills.length} skill(s)
                    </span>
                    {customSkills.length > 0 && (
                      <span className="text-green-600 ml-1">
                        ({customSkills.length} custom)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Use arrow keys to navigate, Enter to select
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {(getSelectedSkills().length === 0 && customSkills.length === 0) ? (
                  <p className="text-gray-500 text-center py-4">No skills added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getSelectedSkills().map((skill) => (
                      <div
                        key={skill.id}
                        className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800 px-4 py-2 rounded-full font-medium shadow-sm"
                      >
                        <span>{skill.name}</span>
                      </div>
                    ))}
                    {customSkills.map((skillName) => (
                      <div
                        key={skillName}
                        className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-full font-medium shadow-sm flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span>{skillName}</span>
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
