// Type Definitions for Job Portal

export interface User {
  id: string;
  email: string;
  name?: string;
  mobile?: string;
  company_name?: string;
  contact?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Education {
  degree: string;
  university: string;
  year_start: string;
  year_end: string;
  field: string;
}

export interface Experience {
  company: string;
  title: string;
  year_start: string;
  year_end: string;
  description: string;
}

export interface Employee extends User {
  gender?: string;
  dob?: string;
  address?: Address;
  education_details?: Education[];
  experience_details?: Experience[];
  skills_details?: string[];
  cv_url?: string;
  plan_id?: string;
  created_at?: string;
}

export interface Employer extends User {
  company_name: string;
  contact: string;
  address?: Address;
  industry_type?: string;
  plan_id?: string;
  industry?: Industry;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  salary?: string;
  location_id: string;
  category_id: string;
  is_featured?: boolean;
  employer?: {
    id: string;
    company_name: string;
  };
  location?: Location;
  category?: Category;
  created_at?: string;
  applied_at?: string;
  status?: string;
}

export interface Application {
  id: string;
  employee: Employee;
  job?: Job;
  applied_at: string;
  status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected';
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  type: 'employee' | 'employer';
  price: string;
  validity_days: number;
  features?: PlanFeature[];
}

export interface PlanFeature {
  feature_name: string;
  feature_value: string;
}

export interface Industry {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  state?: string;
  country?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Coupon {
  code: string;
  discount_percentage: string;
  expiry_date: string;
}

export interface Payment {
  id: string;
  user_type: string;
  user_id: string;
  plan_id: string;
  amount: string;
  discount_amount?: string;
  final_amount: string;
  coupon_code?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
}

export interface CVRequest {
  id: string;
  notes?: string;
  preferred_template?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  completed_cv_url?: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user_type: 'employee' | 'employer' | 'admin';
  user: User;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
  last_page: number;
}
