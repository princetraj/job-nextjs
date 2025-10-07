'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function RegisterContent() {
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<'employee' | 'employer'>('employee');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'employer') {
      setUserType('employer');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Create Account</h1>
            <p className="text-center text-gray-600 mb-8">Join JobPortal today</p>

            {/* User Type Toggle */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setUserType('employee')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                  userType === 'employee'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Job Seeker
              </button>
              <button
                onClick={() => setUserType('employer')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                  userType === 'employer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Employer
              </button>
            </div>

            <div className="space-y-4">
              {userType === 'employee' ? (
                <Link
                  href="/auth/register/employee"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue as Job Seeker
                </Link>
              ) : (
                <Link
                  href="/auth/register/employer"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue as Employer
                </Link>
              )}
            </div>

            <p className="text-center text-gray-600 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
