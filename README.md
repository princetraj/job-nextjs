# Job Portal Frontend

A modern, elegant Next.js frontend for your Job Portal API.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install axios

# 2. Start development server
npm run dev
```

Visit `http://localhost:3000`

## ✅ What's Included

### Complete & Ready to Use:
- ✅ Home page with hero section
- ✅ Login page
- ✅ Employee registration (3-step process)
- ✅ Job search & listings with filters
- ✅ Employee dashboard (example)
- ✅ Responsive Navbar & Footer
- ✅ Complete API integration layer
- ✅ TypeScript types for all entities
- ✅ Error handling & loading states

### API Services Ready:
- ✅ Authentication (login, register, logout)
- ✅ Employee operations (profile, jobs, applications, CV)
- ✅ Employer operations (jobs, applications)
- ✅ Public data (locations, categories, industries)
- ✅ Payment & subscriptions

### Components:
- ✅ Navbar (with auth detection)
- ✅ Footer
- ✅ JobCard
- ✅ LoadingSpinner

## 📝 Next Steps

Complete the remaining pages using the templates in `PROJECT_GUIDE.md`:

1. **Employee Pages**: Profile, Applications, CV Management
2. **Employer Pages**: Dashboard, Job Management, Employer Registration
3. **Payment Pages**: Plans, Checkout

## 📖 Documentation

See `PROJECT_GUIDE.md` for:
- Complete project structure
- Page templates for all remaining pages
- API usage examples
- Styling guidelines
- Troubleshooting

## 🔧 Configuration

Environment variables (`.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## 🎨 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 📦 Key Features

- Modern, clean UI design
- Fully responsive (mobile, tablet, desktop)
- Type-safe with TypeScript
- Automatic token management
- Global error handling
- Loading states
- Protected routes

## 🌐 API Integration

All API calls are configured in `src/services/`:
- `authService.ts` - Authentication
- `employeeService.ts` - Employee operations
- `employerService.ts` - Employer operations
- `publicService.ts` - Public data
- `paymentService.ts` - Payments

Example usage:
```typescript
import { employeeService } from '@/services/employeeService';

const { user, plan } = await employeeService.getProfile();
```

## 🎯 Getting Help

- Check `PROJECT_GUIDE.md` for detailed instructions
- Review `COMPLETE_API_DOCUMENTATION.md` for API reference
- Check browser console for errors
- Verify Laravel API is running

## 📄 License

Part of your Job Portal application.
