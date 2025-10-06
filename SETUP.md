# Job Portal Frontend - Setup Instructions

## ✅ What Has Been Created

Your Next.js frontend is ready with the following structure:

### 📂 Project Structure
```
job-portal-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                          ✅ Home page
│   │   ├── auth/
│   │   │   ├── login/page.tsx               ✅ Login page
│   │   │   └── register/
│   │   │       ├── page.tsx                 ✅ Registration type selector
│   │   │       └── employee/page.tsx        ✅ Employee 3-step registration
│   │   ├── jobs/page.tsx                    ✅ Job search & listings
│   │   └── employee/
│   │       └── dashboard/page.tsx           ✅ Employee dashboard (example)
│   ├── components/                          ✅ All components created
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── JobCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── services/                            ✅ Complete API layer
│   │   ├── authService.ts
│   │   ├── employeeService.ts
│   │   ├── employerService.ts
│   │   ├── publicService.ts
│   │   └── paymentService.ts
│   ├── lib/
│   │   └── api.ts                           ✅ Axios setup with interceptors
│   └── types/
│       └── index.ts                         ✅ All TypeScript types
├── .env.local                               ✅ Environment configuration
├── README.md                                ✅ Quick reference
├── PROJECT_GUIDE.md                         ✅ Complete guide
└── package.json
```

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd job-portal-frontend
npm install axios
```

### Step 2: Verify Configuration
Check that `.env.local` has the correct API URL:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

## 🎯 What Works Right Now

### ✅ You Can Test These Features:

1. **Home Page** - Modern landing page with hero section
   - Visit: `http://localhost:3000`

2. **Browse Jobs** - Search and filter jobs (no auth required)
   - Visit: `http://localhost:3000/jobs`
   - Filter by location, category, search keywords

3. **User Registration** - Complete employee registration flow
   - Visit: `http://localhost:3000/auth/register`
   - Complete 3-step employee registration
   - Form validation included

4. **Login** - Authenticate users
   - Visit: `http://localhost:3000/auth/login`
   - Login with email/mobile and password
   - Auto-redirect based on user type

5. **Employee Dashboard** - View application stats
   - Visit: `http://localhost:3000/employee/dashboard` (after login)
   - See applied jobs, shortlisted jobs, profile stats

## 📝 Pages to Complete

You still need to create these pages (templates provided in PROJECT_GUIDE.md):

### Employee Pages (Missing):
- [ ] `/employee/profile` - Edit profile, education, experience
- [ ] `/employee/applications` - View all job applications
- [ ] `/employee/cv` - CV management, upload, generate
- [ ] `/employee/shortlisted` - View shortlisted jobs

### Employer Pages (Missing):
- [ ] `/employer/dashboard` - Employer overview
- [ ] `/employer/jobs/create` - Post new job
- [ ] `/employer/jobs` - Manage jobs
- [ ] `/employer/jobs/[id]/applications` - View applications
- [ ] `/auth/register/employer` - Employer registration

### Payment Pages (Missing):
- [ ] `/plans` - View subscription plans
- [ ] `/checkout` - Payment and subscription

## 🛠️ How to Add Missing Pages

### Example: Creating Employee Profile Page

1. Create file: `src/app/employee/profile/page.tsx`

2. Use this template:
```typescript
'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { employeeService } from '@/services/employeeService';
import { Employee } from '@/types';

export default function EmployeeProfile() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { user } = await employeeService.getProfile();
      setProfile(user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field: string, value: any) => {
    try {
      await employeeService.updateProfile(field, value);
      alert('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          {/* Add your form here */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

3. The page will automatically be available at the route matching its folder structure

## 🔌 API Services Available

All services are ready to use. Import and call them:

### Authentication
```typescript
import { authService } from '@/services/authService';

// Login
await authService.login('email@example.com', 'password');

// Logout
await authService.logout();

// Register employee (3 steps)
const { tempToken } = await authService.registerEmployeeStep1(data);
await authService.registerEmployeeStep2(tempToken, data);
await authService.registerEmployeeFinal(tempToken, data);
```

### Employee Operations
```typescript
import { employeeService } from '@/services/employeeService';

// Get profile
const { user, plan } = await employeeService.getProfile();

// Update profile
await employeeService.updateProfile('skills_details', ['JavaScript', 'React']);

// Search jobs
const { jobs } = await employeeService.searchJobs({ q: 'developer' });

// Apply for job
await employeeService.applyForJob(jobId);

// Get applied jobs
const { jobs } = await employeeService.getAppliedJobs();

// Shortlist job
await employeeService.shortlistJob(jobId);
```

### Employer Operations
```typescript
import { employerService } from '@/services/employerService';

// Create job
const { job_id } = await employerService.createJob({
  title: 'Software Engineer',
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

// Get plans
const { plans } = await publicService.getPlans('employee');
```

## 🎨 Styling Guide

Use Tailwind CSS classes consistently:

```typescript
// Buttons
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
  Click Me
</button>

// Input Fields
<input
  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
/>

// Cards
<div className="bg-white rounded-lg shadow-md p-6">
  Content here
</div>

// Containers
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  Content here
</div>
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'axios'"
```bash
npm install axios
```

### Issue: CORS errors
Add to Laravel `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### Issue: 401 Unauthorized
- Check that Laravel API is running
- Verify token is stored in localStorage
- Check API URL in `.env.local`

### Issue: TypeScript errors
```bash
npm run build
```
This will show all type errors. Fix them before proceeding.

## 📚 Resources

- **PROJECT_GUIDE.md** - Complete templates for all pages
- **README.md** - Quick reference
- **API Documentation** - `../job-portal-api/COMPLETE_API_DOCUMENTATION.md`

## ✅ Testing Checklist

Before completing the project, test:

- [ ] Home page loads correctly
- [ ] Can browse jobs without login
- [ ] Can register as employee (3 steps)
- [ ] Can login with credentials
- [ ] Employee dashboard shows after login
- [ ] Navbar changes based on auth state
- [ ] Can logout successfully
- [ ] Mobile responsive on all pages
- [ ] No console errors
- [ ] API calls work correctly

## 🎉 Next Steps

1. Install dependencies: `npm install axios`
2. Start dev server: `npm run dev`
3. Test existing pages
4. Create missing pages using PROJECT_GUIDE.md templates
5. Test thoroughly
6. Deploy to production

## 📞 Need Help?

- Check PROJECT_GUIDE.md for detailed examples
- Review browser console for errors
- Check Network tab in DevTools for API issues
- Verify Laravel backend is running

Good luck building your job portal! 🚀
