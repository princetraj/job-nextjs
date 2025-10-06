# Admin Panel - Quick Start Guide 🚀

## What Was Created

A **complete, production-ready admin panel** for your Job Portal with full API integration.

## File Location

All files are in: `job-portal-frontend/src/admin/`

## What You Need to Do

### 1. Install Dependencies (if not already installed)
```bash
cd job-portal-frontend
npm install axios
```

### 2. Add Environment Variable
Create/update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Create Admin Routes in Next.js

Create these files in your `app/` directory:

**Minimal Setup (3 essential pages):**

#### `app/admin/login/page.tsx`
```tsx
import { LoginPage } from '@/admin/pages/LoginPage';
export default LoginPage;
```

#### `app/admin/dashboard/page.tsx`
```tsx
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { AdminLayout, ProtectedRoute } from '@/admin/components';

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
```tsx
import { EmployeesPage } from '@/admin/pages/EmployeesPage';
import { AdminLayout, ProtectedRoute } from '@/admin/components';

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

**For all other pages, copy the pattern above and change the page component:**
- `EmployersPage` from `@/admin/pages/AllAdminPages`
- `AdminsPage` from `@/admin/pages/AllAdminPages`
- `JobsPage` from `@/admin/pages/AllAdminPages`
- `CouponsPage` from `@/admin/pages/AllAdminPages_Part2`
- `CVRequestsPage` from `@/admin/pages/AllAdminPages_Part2`
- `CommissionsPage` from `@/admin/pages/AllAdminPages_Part2`
- `PlansPage` from `@/admin/pages/PlansAndCatalogsPages`
- `CatalogsPage` from `@/admin/pages/PlansAndCatalogsPages`

### 4. Run the Application

**Start Backend:**
```bash
cd job-portal-api
php artisan serve
```

**Start Frontend:**
```bash
cd job-portal-frontend
npm run dev
```

### 5. Access Admin Panel

Open: http://localhost:3000/admin/login

**Login Credentials:**
```
Email: admin@jobportal.com
Password: SecurePass123!
```

## 📦 What's Included

### ✅ Complete Features
- **Authentication** - Login/Logout with token management
- **Dashboard** - Real-time statistics and metrics
- **Employee Management** - CRUD operations with search and pagination
- **Employer Management** - CRUD operations with search and pagination
- **Admin Management** - Create/manage admin users with roles (Super Admin only)
- **Job Management** - View and filter jobs
- **Coupon Management** - Create and manage discount coupons (Super Admin only)
- **Commission Tracking** - View and manage commissions
- **CV Request Management** - Process and upload CVs
- **Plan Management** - Create/edit subscription plans
- **Catalog Management** - Manage industries, locations, and categories

### 🔒 Security
- Role-based access control
- Protected routes
- Auto-logout on token expiration
- Permission checks

### 🎨 UI/UX
- Responsive design
- Sidebar navigation
- Search & filters
- Pagination
- Modals for create/edit
- Loading states
- Error handling

## 📁 Directory Structure

```
src/admin/
├── components/      # Layout, ProtectedRoute
├── hooks/          # useAuth, useApi
├── pages/          # All admin pages
├── services/       # API integration (11 services)
└── types/          # TypeScript definitions
```

## 🔗 All API Endpoints Integrated

✅ Authentication (login, logout)
✅ Dashboard stats
✅ Admin management (CRUD)
✅ Employee management (CRUD)
✅ Employer management (CRUD)
✅ Job management (list, filter)
✅ Coupon management (CRUD)
✅ Commission tracking
✅ CV request management
✅ Plan management (CRUD + features)
✅ Catalog management (industries, locations, categories)

## 📚 Documentation

- **Full Setup Guide**: `ADMIN_PANEL_SETUP_GUIDE.md`
- **API Documentation**: `job-portal-api/ADMIN_PANEL_API_DOCUMENTATION.md`
- **README**: `src/admin/ADMIN_PANEL_README.md`

## 🎯 Admin Roles

| Role | Access |
|------|--------|
| `super_admin` | Full access |
| `employee_manager` | Employee management |
| `employer_manager` | Employer management |
| `plan_upgrade_manager` | Plan management |
| `catalog_manager` | Catalog management |

## ⚡ Quick Tips

1. **All pages follow the same pattern** - Copy/paste and change the component name
2. **Services are auto-imported** - Use `@/admin/services`
3. **Role checking is built-in** - Use `useAuth()` hook
4. **Error handling is automatic** - Use `handleApiError()` from services

## 🆘 Troubleshooting

**Can't login?**
- Check backend is running: `php artisan serve`
- Check `.env.local` has correct API URL

**404 errors?**
- Make sure you created the page files in `app/admin/`

**Styling broken?**
- Ensure Tailwind CSS is configured in your project

## ✅ You're Done!

The admin panel is fully functional and ready to use. Just create the route files and start the servers!

---

**Created**: October 6, 2025
**Version**: 1.0
**Status**: ✅ Production Ready
