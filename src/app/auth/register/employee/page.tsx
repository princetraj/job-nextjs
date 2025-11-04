'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { authService } from '@/services/authService';
import { publicService } from '@/services/publicService';
import { handleApiError } from '@/lib/api';
import { Skill } from '@/types';

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [step1Data, setStep1Data] = useState({
    email: '',
    mobile: '',
    name: '',
    password: '',
    confirmPassword: '',
    gender: 'M',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [step2Data, setStep2Data] = useState({
    dob: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);
  const skillDropdownRef = useRef<HTMLDivElement>(null);
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

  // Form for Step 3
  const {
    register: registerStep3,
    control,
    handleSubmit: handleSubmitStep3,
    watch,
    setValue,
    formState: { errors: errorsStep3 },
  } = useForm({
    defaultValues: {
      education_details: [] as Array<{ degree: string; university: string; field: string; year_start: string; year_end: string; education_level_id?: number | null }>,
      experience_details: [] as Array<{ company: string; title: string; description: string; year_start: string; year_end: string; month_start: string; month_end: string }>,
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
      if (experienceDropdownRef.current && !experienceDropdownRef.current.contains(event.target as Node)) {
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

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
      !selectedSkillIds.includes(skill.id)
  );

  const getSelectedSkills = () => {
    return availableSkills.filter((skill) => selectedSkillIds.includes(skill.id));
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
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>&ldquo;{currentValue}&rdquo; will be added as new {fieldName} (pending admin approval)</span>
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

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step1Data.password !== step1Data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.registerEmployeeStep1({
        email: step1Data.email,
        mobile: step1Data.mobile,
        name: step1Data.name,
        password: step1Data.password,
        gender: step1Data.gender,
      });
      setTempToken(response.tempToken);
      setStep(2);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.registerEmployeeStep2(tempToken, {
        dob: step2Data.dob,
        address: {
          street: step2Data.street,
          city: step2Data.city,
          state: step2Data.state,
          zip: step2Data.zip,
          country: step2Data.country,
        },
      });
      setStep(3);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = handleSubmitStep3(async (data) => {
    setError('');
    setLoading(true);

    try {
      // Combine skill IDs and custom skill names
      const allSkills = [...selectedSkillIds, ...customSkills];

      await authService.registerEmployeeFinal(tempToken, {
        education: data.education_details.filter((ed) => ed.degree && ed.university && ed.field),
        experience: data.experience_details.filter((ex) => ex.company && ex.title),
        skills: allSkills,
      });
      router.push('/employee/dashboard');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  });


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
              Job Seeker Registration
            </h1>
            <p className="text-center text-gray-600 mb-8">Step {step} of 3</p>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">Basic Info</span>
                <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Personal Details
                </span>
                <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Professional Info
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={step1Data.name}
                    onChange={(e) => setStep1Data({ ...step1Data, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={step1Data.email}
                    onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                  <input
                    type="tel"
                    value={step1Data.mobile}
                    onChange={(e) => setStep1Data({ ...step1Data, mobile: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={step1Data.gender}
                    onChange={(e) => setStep1Data({ ...step1Data, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={step1Data.password}
                      onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={step1Data.confirmPassword}
                      onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300 flex items-center justify-center"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Next Step'}
                </button>
              </form>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={step2Data.dob}
                    onChange={(e) => setStep2Data({ ...step2Data, dob: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                  <input
                    type="text"
                    value={step2Data.street}
                    onChange={(e) => setStep2Data({ ...step2Data, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={step2Data.city}
                      onChange={(e) => setStep2Data({ ...step2Data, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={step2Data.state}
                      onChange={(e) => setStep2Data({ ...step2Data, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={step2Data.zip}
                      onChange={(e) => setStep2Data({ ...step2Data, zip: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={step2Data.country}
                      onChange={(e) => setStep2Data({ ...step2Data, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300 flex items-center justify-center"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Next Step'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Professional Information */}
            {step === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-6">
                {/* Education Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Education (Optional)</h3>
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
                  </div>

                  {educationFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No education added yet. Click &quot;+ Add Education&quot; to start.</p>
                  ) : (
                    <div className="space-y-4">
                      {educationFields.map((field, index) => (
                        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-800">Education #{index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeEducation(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Education Level Dropdown */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Education Level
                              </label>
                              <select
                                {...registerStep3(`education_details.${index}.education_level_id` as const)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setValue(`education_details.${index}.education_level_id`, value ? Number(value) : null);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                Degree
                              </label>
                              <input
                                {...registerStep3(`education_details.${index}.degree`)}
                                type="text"
                                placeholder="e.g., Bachelor of Science"
                                onFocus={() => setActiveAutocomplete({ index, field: 'degree' })}
                                onChange={(e) => {
                                  setValue(`education_details.${index}.degree`, e.target.value);
                                  setActiveAutocomplete({ index, field: 'degree' });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {activeAutocomplete?.index === index && activeAutocomplete?.field === 'degree' && watch(`education_details.${index}.degree`) && (
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
                                University/College/School
                              </label>
                              <input
                                {...registerStep3(`education_details.${index}.university`)}
                                type="text"
                                placeholder="e.g., Stanford University"
                                onFocus={() => setActiveAutocomplete({ index, field: 'university' })}
                                onChange={(e) => {
                                  setValue(`education_details.${index}.university`, e.target.value);
                                  setActiveAutocomplete({ index, field: 'university' });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {activeAutocomplete?.index === index && activeAutocomplete?.field === 'university' && watch(`education_details.${index}.university`) && (
                                renderAutocompleteDropdown(
                                  availableUniversities,
                                  watch(`education_details.${index}.university`) || '',
                                  (value) => {
                                    setValue(`education_details.${index}.university`, value);
                                    setActiveAutocomplete(null);
                                  },
                                  'university/college/school'
                                )
                              )}
                            </div>

                            {/* Field of Study Autocomplete */}
                            <div className="relative" ref={activeAutocomplete?.index === index && activeAutocomplete?.field === 'field' ? educationDropdownRef : null}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Field of Study
                              </label>
                              <input
                                {...registerStep3(`education_details.${index}.field`)}
                                type="text"
                                placeholder="e.g., Computer Science"
                                onFocus={() => setActiveAutocomplete({ index, field: 'field' })}
                                onChange={(e) => {
                                  setValue(`education_details.${index}.field`, e.target.value);
                                  setActiveAutocomplete({ index, field: 'field' });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {activeAutocomplete?.index === index && activeAutocomplete?.field === 'field' && watch(`education_details.${index}.field`) && (
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
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                                <input
                                  {...registerStep3(`education_details.${index}.year_start`)}
                                  type="text"
                                  placeholder="2018"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                                <input
                                  {...registerStep3(`education_details.${index}.year_end`)}
                                  type="text"
                                  placeholder="2022"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Experience (Optional)</h3>
                    <button
                      type="button"
                      onClick={() =>
                        appendExperience({
                          company: '',
                          title: '',
                          description: '',
                          year_start: '',
                          year_end: '',
                          month_start: '',
                          month_end: '',
                        })
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      + Add Experience
                    </button>
                  </div>

                  {experienceFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No experience added yet. Click &quot;+ Add Experience&quot; to start.</p>
                  ) : (
                    <div className="space-y-4">
                      {experienceFields.map((field, index) => (
                        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-800">Experience #{index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeExperience(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Company Autocomplete */}
                              <div className="relative" ref={activeAutocomplete?.index === index && activeAutocomplete?.field === 'company' ? experienceDropdownRef : null}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Company
                                </label>
                                <input
                                  {...registerStep3(`experience_details.${index}.company`)}
                                  type="text"
                                  placeholder="e.g., Google Inc."
                                  onFocus={() => setActiveAutocomplete({ index, field: 'company' })}
                                  onChange={(e) => {
                                    setValue(`experience_details.${index}.company`, e.target.value);
                                    setActiveAutocomplete({ index, field: 'company' });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {activeAutocomplete?.index === index && activeAutocomplete?.field === 'company' && watch(`experience_details.${index}.company`) && (
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
                                  Job Title
                                </label>
                                <input
                                  {...registerStep3(`experience_details.${index}.title`)}
                                  type="text"
                                  placeholder="e.g., Software Engineer"
                                  onFocus={() => setActiveAutocomplete({ index, field: 'title' })}
                                  onChange={(e) => {
                                    setValue(`experience_details.${index}.title`, e.target.value);
                                    setActiveAutocomplete({ index, field: 'title' });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {activeAutocomplete?.index === index && activeAutocomplete?.field === 'title' && watch(`experience_details.${index}.title`) && (
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
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                {...registerStep3(`experience_details.${index}.description`)}
                                placeholder="Describe your role and achievements..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <select
                                    {...registerStep3(`experience_details.${index}.month_start`)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Month</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                  </select>
                                  <input
                                    {...registerStep3(`experience_details.${index}.year_start`)}
                                    type="text"
                                    placeholder="Year"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <select
                                    {...registerStep3(`experience_details.${index}.month_end`)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Month</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                  </select>
                                  <input
                                    {...registerStep3(`experience_details.${index}.year_end`)}
                                    type="text"
                                    placeholder="Year"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>

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

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300 flex items-center justify-center"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Complete Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
