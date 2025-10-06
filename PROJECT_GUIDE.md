# Job Portal Frontend - Next.js Application

A modern, elegant, and responsive job portal frontend built with Next.js 15, TypeScript, and Tailwind CSS, integrated with your Laravel backend API.

## 🚀 Features

- ✅ **Authentication System**: Login, Employee & Employer Registration (3-step process for employees)
- ✅ **Job Search & Listings**: Advanced filtering by location, category, and keywords
- ✅ **Employee Dashboard**: Profile management, job applications, CV management
- ✅ **Employer Dashboard**: Job posting, application management
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **API Integration**: Complete integration with Laravel backend
- ✅ **Modern UI**: Clean, professional interface with smooth animations

## 📁 Project Structure

```
job-portal-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   │       ├── employee/
│   │   │       └── employer/
│   │   ├── jobs/              # Job listings
│   │   ├── employee/          # Employee dashboard & pages
│   │   └── employer/          # Employer dashboard & pages
│   ├── components/            # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── JobCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── services/              # API service layer
│   │   ├── authService.ts
│   │   ├── employeeService.ts
│   │   ├── employerService.ts
│   │   ├── publicService.ts
│   │   └── paymentService.ts
│   ├── lib/                   # Core utilities
│   │   └── api.ts            # Axios configuration & interceptors
│   └── types/                 # TypeScript type definitions
│       └── index.ts
├── .env.local                 # Environment variables
└── package.json
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ installed
- Laravel backend API running on `http://localhost:8000`
- npm or yarn package manager

### Step 1: Install Dependencies

```bash
cd job-portal-frontend
npm install axios
```

### Step 2: Configure Environment

The `.env.local` file is already created with:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Update this URL if your Laravel API is running on a different port.

### Step 3: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Step 4: Build for Production

```bash
npm run build
npm start
```

## 🎨 Completed Pages

### ✅ Public Pages
- **Home Page** (`/`) - Landing page with hero section and features
- **Job Listings** (`/jobs`) - Browse and search jobs with filters
- **Login** (`/auth/login`) - User authentication
- **Register** (`/auth/register`) - User type selection
- **Employee Registration** (`/auth/register/employee`) - 3-step registration process

### ✅ Components
- **Navbar** - Responsive navigation with user type detection
- **Footer** - Site-wide footer with links
- **JobCard** - Reusable job listing card
- **LoadingSpinner** - Loading indicator

### ✅ Services & API Integration
- Complete API client with Axios
- Authentication service with token management
- Employee, Employer, and Public services
- Payment service
- Global error handling
- Request/response interceptors

## 📝 Pages to Complete

### Employee Pages
Create these pages in `src/app/employee/`:

#### 1. Dashboard (`dashboard/page.tsx`)
```typescript
'use client';
import { useState, useEffect } from 'react';
import { employeeService } from '@/services/employeeService';

export default function EmployeeDashboard() {
  // Fetch profile, applied jobs, and shortlisted jobs
  // Display statistics and recent applications
  // Quick links to profile, CV, and job search
}
```

#### 2. Profile (`profile/page.tsx`)
```typescript
'use client';
import { employeeService } from '@/services/employeeService';

export default function EmployeeProfile() {
  // Display and edit profile information
  // Update education, experience, skills
  // Address management
}
```

#### 3. Applied Jobs (`applications/page.tsx`)
```typescript
'use client';
import { employeeService } from '@/services/employeeService';

export default function AppliedJobs() {
  // List all applied jobs
  // Show application status (applied, shortlisted, interview_scheduled, selected, rejected)
  // Filter by status
}
```

#### 4. CV Management (`cv/page.tsx`)
```typescript
'use client';
import { employeeService } from '@/services/employeeService';

export default function CVManagement() {
  // Generate CV
  // Upload CV file
  // Request professional CV service
  // View CV request history
}
```

### Employer Pages
Create these pages in `src/app/employer/`:

#### 1. Dashboard (`dashboard/page.tsx`)
```typescript
'use client';
import { employerService } from '@/services/employerService';

export default function EmployerDashboard() {
  // Display statistics: total jobs, active jobs, applications received
  // Recent applications
  // Quick actions: post job, view applications
}
```

#### 2. Job Creation (`jobs/create/page.tsx`)
```typescript
'use client';
import { employerService } from '@/services/employerService';
import { publicService } from '@/services/publicService';

export default function CreateJob() {
  // Job posting form
  // Title, description, salary, location, category
  // Load locations and categories from API
}
```

#### 3. Job Management (`jobs/page.tsx`)
```typescript
'use client';
import { employerService } from '@/services/employerService';

export default function ManageJobs() {
  // List all employer's jobs
  // Edit, delete jobs
  // View applications per job
}
```

#### 4. Job Applications (`jobs/[id]/applications/page.tsx`)
```typescript
'use client';
import { employerService } from '@/services/employerService';

export default function JobApplications({ params }) {
  // List all applications for a specific job
  // View candidate profiles and CVs
  // Update application status
  // Send WhatsApp notifications (handled by backend)
}
```

#### 5. Employer Registration (`auth/register/employer/page.tsx`)
```typescript
'use client';
import { authService } from '@/services/authService';
import { publicService } from '@/services/publicService';

export default function EmployerRegister() {
  // Single-step registration form
  // Company details, contact, address
  // Industry type selection
}
```

### Payment & Subscription Pages
Create these pages in `src/app/`:

#### 1. Plans Page (`plans/page.tsx`)
```typescript
'use client';
import { publicService } from '@/services/publicService';

export default function PlansPage() {
  // Display all subscription plans
  // Filter by type (employee/employer)
  // Show features and pricing
  // "Subscribe" button for each plan
}
```

#### 2. Checkout Page (`checkout/page.tsx`)
```typescript
'use client';
import { paymentService } from '@/services/paymentService';
import { publicService } from '@/services/publicService';

export default function CheckoutPage() {
  // Plan selection summary
  // Coupon code validation
  // Payment details form
  // Payment processing
}
```

## 🎯 API Service Usage Examples

### Authentication
```typescript
import { authService } from '@/services/authService';

// Login
const { token, user_type, user } = await authService.login('email@example.com', 'password');

// Logout
await authService.logout();
```

### Employee Operations
```typescript
import { employeeService } from '@/services/employeeService';

// Get profile
const { user, plan } = await employeeService.getProfile();

// Search jobs
const { jobs } = await employeeService.searchJobs({ q: 'developer', location_id: 'uuid' });

// Apply for job
await employeeService.applyForJob(jobId);

// Upload CV
await employeeService.uploadCV(file);
```

### Employer Operations
```typescript
import { employerService } from '@/services/employerService';

// Create job
const { job_id } = await employerService.createJob({
  title: 'Senior Developer',
  description: 'Job description...',
  salary: '$100,000',
  location_id: 'uuid',
  category_id: 'uuid'
});

// Get applications
const { applications } = await employerService.getJobApplications(jobId);

// Update application status
await employerService.updateApplicationStatus(appId, 'shortlisted');
```

### Public Data
```typescript
import { publicService } from '@/services/publicService';

// Get locations
const { locations } = await publicService.getLocations();

// Get categories
const { categories } = await publicService.getCategories();

// Get industries
const { industries } = await publicService.getIndustries();

// Validate coupon
const result = await publicService.validateCoupon({
  coupon_code: 'SAVE20',
  plan_id: 'uuid'
});
```

## 🔐 Authentication Flow

The app uses localStorage to store:
- `auth_token` - JWT token from backend
- `user_type` - 'employee', 'employer', or 'admin'

Axios interceptor automatically:
- Adds token to all requests
- Redirects to login on 401 Unauthorized
- Handles errors globally

## 🎨 Styling Guidelines

- Uses Tailwind CSS utility classes
- Primary color: `blue-600`
- Hover states: `hover:bg-blue-700`
- Focus states: `focus:ring-2 focus:ring-blue-500`
- Shadows: `shadow-md` for cards, `shadow-lg` on hover
- Rounded corners: `rounded-md` or `rounded-lg`
- Spacing: Consistent padding (`p-6`, `p-8`) and margins

## 📱 Responsive Design

All pages are responsive with breakpoints:
- Mobile: default (< 768px)
- Tablet: `md:` (≥ 768px)
- Desktop: `lg:` (≥ 1024px)

## 🚨 Error Handling

Errors are handled via `handleApiError` utility:
```typescript
import { handleApiError } from '@/lib/api';

try {
  await someApiCall();
} catch (error) {
  const errorMessage = handleApiError(error);
  setError(errorMessage); // Display to user
}
```

## 🧪 Testing the Application

### 1. Test Authentication
- Register as employee (3-step process)
- Register as employer (single step)
- Login with created accounts
- Verify token storage in browser DevTools

### 2. Test Job Listings
- Browse jobs without authentication
- Search with filters
- Login and apply for jobs

### 3. Test Employee Features
- View dashboard
- Update profile
- Upload CV
- Track applications

### 4. Test Employer Features
- Create job posting
- View applications
- Update application status

## 🔧 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your Laravel backend has CORS properly configured in `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### API Connection Issues
- Verify Laravel API is running on `http://localhost:8000`
- Check `.env.local` has correct API URL
- Test API endpoints with Postman/cURL first

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run dev
```

## 📦 Additional Packages (Optional)

Consider adding these for enhanced functionality:

```bash
# Form validation
npm install react-hook-form zod

# Date handling
npm install date-fns

# Rich text editor (for job descriptions)
npm install react-quill

# Toast notifications
npm install react-hot-toast

# Icons
npm install lucide-react
```

## 🎯 Next Steps

1. **Complete Remaining Pages**: Use the templates above to create employee/employer dashboards
2. **Add Form Validation**: Implement client-side validation with react-hook-form or custom validators
3. **Enhance UX**: Add loading states, success messages, and better error handling
4. **Add Tests**: Write unit tests for components and integration tests for API calls
5. **Optimize Performance**: Implement code splitting, lazy loading, and image optimization
6. **Add Analytics**: Integrate Google Analytics or similar
7. **SEO Optimization**: Add meta tags, Open Graph tags, and sitemap

## 📞 Support

For issues or questions:
- Check the API documentation: `COMPLETE_API_DOCUMENTATION.md`
- Review Laravel backend logs
- Check browser console for frontend errors
- Verify network requests in DevTools

## 📄 License

This project is part of your job portal application.

---

**Happy Coding! 🚀**
