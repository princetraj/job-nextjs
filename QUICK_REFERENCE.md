# 🚀 Quick Reference Card

## ⚡ Installation (30 seconds)
```bash
cd job-portal-frontend
npm install
npm run dev
```
Open: `http://localhost:3000`

---

## 📂 File Structure

```
src/
├── app/                              # Pages (Next.js App Router)
│   ├── page.tsx                     ✅ Home page
│   ├── auth/
│   │   ├── login/page.tsx          ✅ Login
│   │   └── register/
│   │       ├── page.tsx            ✅ Type selector
│   │       └── employee/page.tsx   ✅ Employee registration
│   ├── jobs/page.tsx               ✅ Job listings
│   └── employee/
│       └── dashboard/page.tsx      ✅ Dashboard
│
├── components/                      # Reusable UI components
│   ├── Navbar.tsx                  ✅ Navigation
│   ├── Footer.tsx                  ✅ Footer
│   ├── JobCard.tsx                 ✅ Job card
│   └── LoadingSpinner.tsx          ✅ Loader
│
├── services/                        # API layer
│   ├── authService.ts              ✅ Auth operations
│   ├── employeeService.ts          ✅ Employee ops
│   ├── employerService.ts          ✅ Employer ops
│   ├── publicService.ts            ✅ Public data
│   └── paymentService.ts           ✅ Payments
│
├── lib/
│   └── api.ts                      ✅ Axios config
│
└── types/
    └── index.ts                    ✅ TypeScript types
```

---

## 🎯 Common Tasks

### Create a New Page
```typescript
// File: src/app/employee/profile/page.tsx
'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Your content */}
      </main>
      <Footer />
    </div>
  );
}
```

### Make an API Call
```typescript
import { employeeService } from '@/services/employeeService';

// Get profile
const { user } = await employeeService.getProfile();

// Update profile
await employeeService.updateProfile('skills_details', ['React']);

// Apply for job
await employeeService.applyForJob(jobId);
```

### Handle Errors
```typescript
import { handleApiError } from '@/lib/api';

try {
  await someApiCall();
} catch (error) {
  const message = handleApiError(error);
  setError(message); // Show to user
}
```

### Add Loading State
```typescript
import LoadingSpinner from '@/components/LoadingSpinner';

const [loading, setLoading] = useState(false);

// In JSX:
{loading ? <LoadingSpinner size="lg" /> : <YourContent />}
```

---

## 🎨 Styling Cheat Sheet

```typescript
// Button
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
  Click Me
</button>

// Input
<input className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />

// Card
<div className="bg-white rounded-lg shadow-md p-6">Content</div>

// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Content</div>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* items */}
</div>
```

---

## 🔌 All Available API Methods

### Auth Service
```typescript
authService.login(identifier, password)
authService.logout()
authService.registerEmployeeStep1(data)
authService.registerEmployeeStep2(tempToken, data)
authService.registerEmployeeFinal(tempToken, data)
authService.registerEmployer(data)
```

### Employee Service
```typescript
employeeService.getProfile()
employeeService.updateProfile(field, value)
employeeService.searchJobs(params)
employeeService.applyForJob(jobId)
employeeService.getAppliedJobs()
employeeService.shortlistJob(jobId)
employeeService.getShortlistedJobs()
employeeService.removeFromShortlist(id)
employeeService.generateCV()
employeeService.uploadCV(file)
employeeService.requestProfessionalCV(data)
employeeService.getCVRequests()
```

### Employer Service
```typescript
employerService.getProfile()
employerService.updateProfile(data)
employerService.createJob(data)
employerService.getJob(jobId)
employerService.updateJob(jobId, data)
employerService.deleteJob(jobId)
employerService.getJobApplications(jobId)
employerService.updateApplicationStatus(appId, status)
```

### Public Service
```typescript
publicService.getPlans(type?)
publicService.getPlan(id)
publicService.getIndustries()
publicService.getLocations()
publicService.getCategories()
publicService.searchJobs(params)
publicService.validateCoupon(data)
```

### Payment Service
```typescript
paymentService.subscribe(data)
paymentService.verifyPayment(data)
paymentService.getPaymentHistory()
```

---

## 🔐 Auth Helpers

```typescript
import { getAuthToken, getUserType, clearAuth } from '@/lib/api';

// Get token
const token = getAuthToken();

// Get user type
const userType = getUserType(); // 'employee' | 'employer' | 'admin'

// Clear auth (logout)
clearAuth();
```

---

## 📱 Responsive Breakpoints

```typescript
// Mobile: default
<div className="text-sm">Mobile</div>

// Tablet: md: (≥ 768px)
<div className="md:text-base">Tablet</div>

// Desktop: lg: (≥ 1024px)
<div className="lg:text-lg">Desktop</div>

// Combined
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🐛 Debug Checklist

### API Not Working?
1. ✅ Is Laravel running? `http://localhost:8000`
2. ✅ Check `.env.local` has correct URL
3. ✅ Open Network tab in DevTools
4. ✅ Check browser console for errors
5. ✅ Verify token in localStorage

### Page Not Found?
1. ✅ File is in correct `app/` folder
2. ✅ Named `page.tsx`
3. ✅ Has default export
4. ✅ Restart dev server

### TypeScript Error?
```bash
npm run build
```
Fix errors shown

### CORS Error?
Update Laravel `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000']
```

---

## 📋 Testing Checklist

- [ ] Home page loads
- [ ] Can browse jobs
- [ ] Can register (employee)
- [ ] Can login
- [ ] Dashboard shows after login
- [ ] Navbar updates with auth
- [ ] Can logout
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎯 Remaining Pages to Build

Use templates from **PROJECT_GUIDE.md**:

### Employee:
- [ ] `/employee/profile` - Edit profile
- [ ] `/employee/applications` - View applications
- [ ] `/employee/cv` - CV management
- [ ] `/employee/shortlisted` - Saved jobs

### Employer:
- [ ] `/employer/dashboard` - Overview
- [ ] `/employer/jobs/create` - Post job
- [ ] `/employer/jobs` - Manage jobs
- [ ] `/employer/jobs/[id]/applications` - View applicants
- [ ] `/auth/register/employer` - Employer signup

### Payment:
- [ ] `/plans` - View plans
- [ ] `/checkout` - Payment

---

## 📚 Documentation Files

| File | What It Contains |
|------|------------------|
| **README.md** | Quick overview |
| **SETUP.md** | Installation guide |
| **PROJECT_GUIDE.md** | Complete templates |
| **PROJECT_SUMMARY.md** | High-level overview |
| **QUICK_REFERENCE.md** | This file! |

---

## ⚡ Pro Tips

1. **Copy Existing Patterns** - Look at dashboard page for examples
2. **Use TypeScript** - Let types guide you
3. **Test API First** - Use Postman before frontend
4. **Check Console** - Always keep DevTools open
5. **Read Errors** - Error messages are helpful!

---

## 🎉 You're Ready!

Everything you need is here. Start coding! 🚀

**Next:** Open PROJECT_GUIDE.md for detailed page templates
