# Admin Panel Complete Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [File Structure](#file-structure)
4. [Next.js Integration](#nextjs-integration)
5. [Environment Configuration](#environment-configuration)
6. [Running the Admin Panel](#running-the-admin-panel)
7. [Features](#features)
8. [API Integration](#api-integration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Complete React-based admin panel with full integration of all API endpoints from the `ADMIN_PANEL_API_DOCUMENTATION.md`. Built with:
- **React/Next.js** - Framework
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Role-Based Access Control** - Security

---

## Installation

### Step 1: Install Dependencies

```bash
cd job-portal-frontend
npm install axios
```

If axios is already installed, you're good to go!

### Step 2: Verify Directory Structure

All admin files are located in `src/admin/`:

```
src/admin/
├── components/
│   ├── Layout.tsx
│   └── ProtectedRoute.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── index.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── EmployeesPage.tsx
│   ├── AllAdminPages.tsx (Employers, Admins, Jobs)
│   ├── AllAdminPages_Part2.tsx (Coupons, CV Requests, Commissions)
│   └── PlansAndCatalogsPages.tsx (Plans, Catalogs)
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── dashboardService.ts
│   ├── adminService.ts
│   ├── employeeService.ts
│   ├── employerService.ts
│   ├── jobService.ts
│   ├── couponService.ts
│   ├── commissionService.ts
│   ├── cvRequestService.ts
│   ├── planService.ts
│   ├── catalogService.ts
│   └── index.ts
└── types/
    └── index.ts
```

---

## File Structure

### Core Components

1. **Layout.tsx** - Main admin layout with sidebar navigation
2. **ProtectedRoute.tsx** - Authentication guard for routes
3. **Services** - Complete API integration for all endpoints
4. **Hooks** - Custom React hooks for auth and API calls
5. **Pages** - All admin management pages

---

## Next.js Integration

### Step 1: Create Admin Routes

Create the following files in your `app/` directory:

#### `app/admin/login/page.tsx`
```typescript
import { LoginPage } from '@/admin/pages/LoginPage';

export default function AdminLogin() {
  return <LoginPage />;
}
```

#### `app/admin/dashboard/page.tsx`
```typescript
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <DashboardPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/employees/page.tsx`
```typescript
import { EmployeesPage } from '@/admin/pages/EmployeesPage';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminEmployees() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <EmployeesPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/employers/page.tsx`
```typescript
import { EmployersPage } from '@/admin/pages/AllAdminPages';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminEmployers() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <EmployersPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/admins/page.tsx`
```typescript
import { AdminsPage } from '@/admin/pages/AllAdminPages';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminManagement() {
  return (
    <ProtectedRoute requiredRoles={['super_admin']}>
      <AdminLayout>
        <AdminsPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/jobs/page.tsx`
```typescript
import { JobsPage } from '@/admin/pages/AllAdminPages';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminJobs() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <JobsPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/coupons/page.tsx`
```typescript
import { CouponsPage } from '@/admin/pages/AllAdminPages_Part2';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminCoupons() {
  return (
    <ProtectedRoute requiredRoles={['super_admin']}>
      <AdminLayout>
        <CouponsPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/cv-requests/page.tsx`
```typescript
import { CVRequestsPage } from '@/admin/pages/AllAdminPages_Part2';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminCVRequests() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <CVRequestsPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/commissions/page.tsx`
```typescript
import { CommissionsPage } from '@/admin/pages/AllAdminPages_Part2';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminCommissions() {
  return (
    <ProtectedRoute requiredRoles={['super_admin']}>
      <AdminLayout>
        <CommissionsPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/plans/page.tsx`
```typescript
import { PlansPage } from '@/admin/pages/PlansAndCatalogsPages';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminPlans() {
  return (
    <ProtectedRoute requiredRoles={['super_admin', 'plan_upgrade_manager']}>
      <AdminLayout>
        <PlansPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

#### `app/admin/catalogs/page.tsx`
```typescript
import { CatalogsPage } from '@/admin/pages/PlansAndCatalogsPages';
import { AdminLayout } from '@/admin/components/Layout';
import { ProtectedRoute } from '@/admin/components/ProtectedRoute';

export default function AdminCatalogs() {
  return (
    <ProtectedRoute requiredRoles={['super_admin', 'catalog_manager']}>
      <AdminLayout>
        <CatalogsPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

---

## Environment Configuration

### Create/Update `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

This configures the API base URL for all admin services.

---

## Running the Admin Panel

### Step 1: Start Backend API
```bash
cd job-portal-api
php artisan serve
```

### Step 2: Start Frontend
```bash
cd job-portal-frontend
npm run dev
```

### Step 3: Access Admin Panel
```
http://localhost:3000/admin/login
```

### Default Admin Credentials
```
Email: admin@jobportal.com
Password: SecurePass123!
```

---

## Features

### ✅ Complete API Integration

All endpoints from the API documentation are integrated:

#### Authentication
- ✅ Admin login
- ✅ Admin logout
- ✅ Get admin profile
- ✅ Token-based authentication
- ✅ Auto logout on 401

#### Dashboard
- ✅ Real-time statistics
- ✅ Employee count
- ✅ Employer count
- ✅ Job statistics
- ✅ CV request counts
- ✅ Commission totals (Super Admin)
- ✅ Coupon counts (Super Admin)

#### Admin Management (Super Admin Only)
- ✅ List all admins
- ✅ Create new admin with role
- ✅ Update admin details
- ✅ Delete admin (except self)
- ✅ Role management

#### Employee Management
- ✅ List employees with pagination
- ✅ Search employees
- ✅ View employee details
- ✅ View employee CV
- ✅ Update employee information
- ✅ Delete employee

#### Employer Management
- ✅ List employers with pagination
- ✅ Search employers
- ✅ View employer details
- ✅ View company information
- ✅ Update employer information
- ✅ Delete employer

#### Job Management
- ✅ List all jobs with pagination
- ✅ Filter by status (active/inactive/expired)
- ✅ Search jobs
- ✅ View job details
- ✅ View applications count
- ✅ Featured job indicators

#### Coupon Management (Super Admin Only)
- ✅ Create discount coupons
- ✅ List all coupons
- ✅ Toggle coupon active status
- ✅ Delete coupons
- ✅ Track usage statistics
- ✅ Set expiry dates

#### Commission Management
- ✅ View all commissions (Super Admin)
- ✅ View personal commissions (Staff)
- ✅ Add manual commissions
- ✅ Track total earnings
- ✅ Commission types

#### CV Request Management
- ✅ List CV requests with pagination
- ✅ Filter by status
- ✅ Update request status
- ✅ Upload completed CVs (PDF)
- ✅ Mark as in progress/completed/rejected
- ✅ View employee details

#### Plan Management
- ✅ Create subscription plans
- ✅ List all plans
- ✅ Update plan details
- ✅ Delete plans
- ✅ Add plan features
- ✅ Remove plan features
- ✅ Employee/Employer plan types

#### Catalog Management
- ✅ Manage industries (CRUD)
- ✅ Manage locations (CRUD)
- ✅ Manage job categories (CRUD)
- ✅ Tab-based interface

### 🔒 Security Features

- **Role-Based Access Control** - Different permissions for different admin roles
- **Protected Routes** - Authentication required for all admin pages
- **Auto Logout** - Automatic redirect on token expiration
- **Token Storage** - Secure token management in localStorage
- **Permission Checks** - Both client and server-side validation

### 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Sidebar Navigation** - Easy access to all modules
- **Search & Filters** - Quick data filtering
- **Pagination** - Efficient data loading
- **Modals** - Clean create/edit interfaces
- **Loading States** - User feedback during operations
- **Error Handling** - User-friendly error messages

---

## API Integration

### Service Structure

Each module has its own service file:

```typescript
// Example: employeeService.ts
import api from './api';

export const employeeService = {
  getEmployees: async (params) => {
    const response = await api.get('/admin/employees', { params });
    return response.data.employees;
  },
  // ... other methods
};
```

### Using Services in Components

```typescript
import { employeeService, handleApiError } from '@/admin/services';

// In component
const fetchEmployees = async () => {
  try {
    const data = await employeeService.getEmployees({ page: 1 });
    setEmployees(data);
  } catch (err) {
    alert(handleApiError(err));
  }
};
```

### Custom Hooks

```typescript
// useAuth hook
import { useAuth } from '@/admin/hooks';

function MyComponent() {
  const { isAuthenticated, currentAdmin, isSuperAdmin } = useAuth();

  if (isSuperAdmin()) {
    return <SuperAdminContent />;
  }
}
```

---

## Admin Roles & Permissions

| Role | Access |
|------|--------|
| **super_admin** | Full access to all features |
| **employee_manager** | Manage employees only |
| **employer_manager** | Manage employers only |
| **plan_upgrade_manager** | Manage plans and subscriptions |
| **catalog_manager** | Manage industries, locations, categories |

### Role-Based Navigation

The sidebar automatically shows/hides menu items based on user role:

```typescript
// In Layout.tsx
const navigation = [
  { name: 'Dashboard', roles: ['*'] }, // All roles
  { name: 'Admins', roles: ['super_admin'] }, // Super admin only
  { name: 'Employees', roles: ['*'] }, // All roles
  // ... etc
];
```

---

## Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Check if backend API is running and admin credentials are correct

### Issue: CORS Errors
**Solution**: Ensure Laravel backend has CORS configured properly in `config/cors.php`

### Issue: Cannot find module '@/admin/...'
**Solution**: Make sure `tsconfig.json` has the correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Styling not working
**Solution**: Ensure Tailwind CSS is configured in `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ... rest of config
}
```

### Issue: API calls failing
**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Verify backend is running on `http://localhost:8000`
3. Check browser console for specific error messages

---

## Quick Reference

### Admin Panel URLs

| Page | URL | Access |
|------|-----|--------|
| Login | `/admin/login` | Public |
| Dashboard | `/admin/dashboard` | All Admins |
| Employees | `/admin/employees` | All Admins |
| Employers | `/admin/employers` | All Admins |
| Admins | `/admin/admins` | Super Admin Only |
| Jobs | `/admin/jobs` | All Admins |
| Coupons | `/admin/coupons` | Super Admin Only |
| Commissions | `/admin/commissions` | Super Admin Only |
| CV Requests | `/admin/cv-requests` | All Admins |
| Plans | `/admin/plans` | Super Admin, Plan Manager |
| Catalogs | `/admin/catalogs` | Super Admin, Catalog Manager |

### Key Files to Check

1. **Authentication**: `src/admin/services/authService.ts`
2. **API Config**: `src/admin/services/api.ts`
3. **Types**: `src/admin/types/index.ts`
4. **Layout**: `src/admin/components/Layout.tsx`

---

## Support

For API documentation, refer to:
`job-portal-api/ADMIN_PANEL_API_DOCUMENTATION.md`

---

## Version Information

- **Admin Panel Version**: 1.0
- **API Version**: 1.0
- **Last Updated**: October 6, 2025
- **Status**: ✅ Production Ready

---

## Next Steps

1. ✅ All services created
2. ✅ All pages created
3. ✅ Layout and navigation implemented
4. ✅ Role-based access control implemented
5. ✅ Complete API integration

**You're ready to use the admin panel!**

Just create the Next.js page files as shown above and start the application.
