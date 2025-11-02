import { z } from 'zod';

// Address validation schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(3, 'ZIP code must be at least 3 characters'),
  country: z.string().min(1, 'Country is required'),
});

// Education validation schema
export const educationSchema = z.object({
  education_level_id: z.union([z.number(), z.string(), z.null()]).optional(),
  degree: z.string().min(1, 'Degree is required'),
  university: z.string().min(1, 'University is required'),
  field: z.string().min(1, 'Field of study is required'),
  year_start: z.string().min(4, 'Start year is required'),
  year_end: z.string().min(4, 'End year is required'),
}).refine((data) => {
  const start = parseInt(data.year_start);
  const end = parseInt(data.year_end);
  return end >= start;
}, {
  message: 'End year must be after or equal to start year',
  path: ['year_end'],
});

// Experience validation schema
export const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  year_start: z.string().min(4, 'Start year is required'),
  year_end: z.string().min(4, 'End year is required'),
}).refine((data) => {
  const start = parseInt(data.year_start);
  const end = parseInt(data.year_end);
  return end >= start;
}, {
  message: 'End year must be after or equal to start year',
  path: ['year_end'],
});

// Main employee profile validation schema
export const employeeProfileSchema = z.object({
  // Basic info (read-only in this form, but included for type safety)
  name: z.string().optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
  dob: z.string().optional(),

  // Editable fields
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  address: addressSchema.optional(),
  education_details: z.array(educationSchema).optional(),
  experience_details: z.array(experienceSchema).optional(),
  skills_details: z.array(z.string().min(1, 'Skill cannot be empty')).optional(),
  cv_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// Type inference from schema
export type EmployeeProfileFormData = z.infer<typeof employeeProfileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;
