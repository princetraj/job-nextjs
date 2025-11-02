'use client';

import { useState, useEffect } from 'react';
import { publicService } from '@/services/publicService';

interface EmployeeFilterProps {
  onFilterChange: (filters: {
    q?: string;
    education_level_id?: string;
    degree_id?: string;
    university_id?: string;
    field_of_study_id?: string;
    skill_ids?: string[];
  }) => void;
  onSearch: () => void;
}

export default function EmployeeFilter({ onFilterChange, onSearch }: EmployeeFilterProps) {
  const [educationLevels, setEducationLevels] = useState<Array<{ id: number; name: string }>>([]);
  const [degrees, setDegrees] = useState<Array<{ id: string; name: string }>>([]);
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);
  const [fieldOfStudies, setFieldOfStudies] = useState<Array<{ id: string; name: string }>>([]);
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([]);

  const [filters, setFilters] = useState({
    q: '',
    education_level_id: '',
    degree_id: '',
    university_id: '',
    field_of_study_id: '',
    skill_ids: [] as string[],
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [eduLevels, degreesList, universitiesList, fieldsList, skillsList] = await Promise.all([
        publicService.getEducationLevels(),
        publicService.getDegrees(),
        publicService.getUniversities(),
        publicService.getFieldOfStudies(),
        publicService.getSkills(),
      ]);

      setEducationLevels(eduLevels.education_levels);
      setDegrees(degreesList.degrees);
      setUniversities(universitiesList.universities);
      setFieldOfStudies(fieldsList.field_of_studies);
      setSkills(skillsList.skills);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSkillToggle = (skillId: string) => {
    const currentSkills = filters.skill_ids;
    const newSkills = currentSkills.includes(skillId)
      ? currentSkills.filter((id) => id !== skillId)
      : [...currentSkills, skillId];

    handleFilterChange('skill_ids', newSkills);
  };

  const handleReset = () => {
    const resetFilters = {
      q: '',
      education_level_id: '',
      degree_id: '',
      university_id: '',
      field_of_study_id: '',
      skill_ids: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    onSearch();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Filter Employees</h2>

      {/* Search Input */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name, email..."
          value={filters.q}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          onClick={onSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Education Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Level
              </label>
              <select
                value={filters.education_level_id}
                onChange={(e) => handleFilterChange('education_level_id', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                {educationLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Degree */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree
              </label>
              <select
                value={filters.degree_id}
                onChange={(e) => handleFilterChange('degree_id', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Degrees</option>
                {degrees.map((degree) => (
                  <option key={degree.id} value={degree.id}>
                    {degree.name}
                  </option>
                ))}
              </select>
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University
              </label>
              <select
                value={filters.university_id}
                onChange={(e) => handleFilterChange('university_id', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Universities</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Field of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field of Study
              </label>
              <select
                value={filters.field_of_study_id}
                onChange={(e) => handleFilterChange('field_of_study_id', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Fields</option>
                {fieldOfStudies.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillToggle(skill.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.skill_ids.includes(skill.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
            {filters.skill_ids.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {filters.skill_ids.length} skill(s) selected
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
