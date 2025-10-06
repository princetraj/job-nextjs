'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { authService } from '@/services/authService';
import { handleApiError } from '@/lib/api';

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [step1Data, setStep1Data] = useState({
    email: '',
    mobile: '',
    name: '',
    password: '',
    confirmPassword: '',
    gender: 'M',
  });

  const [step2Data, setStep2Data] = useState({
    dob: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const [step3Data, setStep3Data] = useState({
    education: [{ degree: '', university: '', year_start: '', year_end: '', field: '' }],
    experience: [{ company: '', title: '', year_start: '', year_end: '', description: '' }],
    skills: '',
  });

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step1Data.password !== step1Data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.registerEmployeeStep1({
        email: step1Data.email,
        mobile: step1Data.mobile,
        name: step1Data.name,
        password: step1Data.password,
        gender: step1Data.gender,
      });
      setTempToken(response.tempToken);
      setStep(2);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.registerEmployeeStep2(tempToken, {
        dob: step2Data.dob,
        address: {
          street: step2Data.street,
          city: step2Data.city,
          state: step2Data.state,
          zip: step2Data.zip,
          country: step2Data.country,
        },
      });
      setStep(3);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const skillsArray = step3Data.skills.split(',').map((s) => s.trim()).filter((s) => s);
      await authService.registerEmployeeFinal(tempToken, {
        education: step3Data.education.filter((ed) => ed.degree),
        experience: step3Data.experience.filter((ex) => ex.company),
        skills: skillsArray,
      });
      router.push('/employee/dashboard');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
              Job Seeker Registration
            </h1>
            <p className="text-center text-gray-600 mb-8">Step {step} of 3</p>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">Basic Info</span>
                <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Personal Details
                </span>
                <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Professional Info
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={step1Data.name}
                    onChange={(e) => setStep1Data({ ...step1Data, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={step1Data.email}
                    onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                  <input
                    type="tel"
                    value={step1Data.mobile}
                    onChange={(e) => setStep1Data({ ...step1Data, mobile: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={step1Data.gender}
                    onChange={(e) => setStep1Data({ ...step1Data, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={step1Data.password}
                    onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={step1Data.confirmPassword}
                    onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300 flex items-center justify-center"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Next Step'}
                </button>
              </form>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={step2Data.dob}
                    onChange={(e) => setStep2Data({ ...step2Data, dob: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                  <input
                    type="text"
                    value={step2Data.street}
                    onChange={(e) => setStep2Data({ ...step2Data, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={step2Data.city}
                      onChange={(e) => setStep2Data({ ...step2Data, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={step2Data.state}
                      onChange={(e) => setStep2Data({ ...step2Data, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={step2Data.zip}
                      onChange={(e) => setStep2Data({ ...step2Data, zip: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={step2Data.country}
                      onChange={(e) => setStep2Data({ ...step2Data, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300 flex items-center justify-center"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Next Step'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Professional Information */}
            {step === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Education (Optional)</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={step3Data.education[0].degree}
                      onChange={(e) =>
                        setStep3Data({
                          ...step3Data,
                          education: [{ ...step3Data.education[0], degree: e.target.value }],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="University"
                      value={step3Data.education[0].university}
                      onChange={(e) =>
                        setStep3Data({
                          ...step3Data,
                          education: [{ ...step3Data.education[0], university: e.target.value }],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={step3Data.education[0].field}
                      onChange={(e) =>
                        setStep3Data({
                          ...step3Data,
                          education: [{ ...step3Data.education[0], field: e.target.value }],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Start Year"
                        value={step3Data.education[0].year_start}
                        onChange={(e) =>
                          setStep3Data({
                            ...step3Data,
                            education: [{ ...step3Data.education[0], year_start: e.target.value }],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="End Year"
                        value={step3Data.education[0].year_end}
                        onChange={(e) =>
                          setStep3Data({
                            ...step3Data,
                            education: [{ ...step3Data.education[0], year_end: e.target.value }],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Experience (Optional)</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Company"
                      value={step3Data.experience[0].company}
                      onChange={(e) =>
                        setStep3Data({
                          ...step3Data,
                          experience: [{ ...step3Data.experience[0], company: e.target.value }],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={step3Data.experience[0].title}
                      onChange={(e) =>
                        setStep3Data({
                          ...step3Data,
                          experience: [{ ...step3Data.experience[0], title: e.target.value }],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Start Year"
                        value={step3Data.experience[0].year_start}
                        onChange={(e) =>
                          setStep3Data({
                            ...step3Data,
                            experience: [{ ...step3Data.experience[0], year_start: e.target.value }],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="End Year"
                        value={step3Data.experience[0].year_end}
                        onChange={(e) =>
                          setStep3Data({
                            ...step3Data,
                            experience: [{ ...step3Data.experience[0], year_end: e.target.value }],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={step3Data.experience[0].description}
                      onChange={(e) =>
                        setStep3Data({
                          ...step3Data,
                          experience: [{ ...step3Data.experience[0], description: e.target.value }],
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={step3Data.skills}
                    onChange={(e) => setStep3Data({ ...step3Data, skills: e.target.value })}
                    placeholder="JavaScript, React, Node.js"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300 flex items-center justify-center"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Complete Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
