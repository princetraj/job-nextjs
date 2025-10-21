'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { planAPI, paymentAPI, handleApiError } from '@/lib/api';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Feature {
  id: string;
  feature_name: string;
  feature_value: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  validity_days: number;
  features: Feature[];
  is_current: boolean;
}

export default function UpgradePlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  const fetchAvailablePlans = async () => {
    try {
      const response = await planAPI.getAvailablePlans();
      setPlans(response.data.plans);
      setError(null);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!window.Razorpay) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    setUpgrading(planId);
    try {
      // Step 1: Create Razorpay order
      const orderResponse = await paymentAPI.createRazorpayOrder(planId);
      const { razorpay_order_id, amount, currency, razorpay_key, plan } = orderResponse.data;

      // Step 2: Configure Razorpay options
      const options = {
        key: razorpay_key,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        name: 'Job Portal',
        description: `Upgrade to ${plan.name}`,
        order_id: razorpay_order_id,
        handler: async function (response: any) {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await paymentAPI.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert(verifyResponse.data.message || 'Payment successful! Plan upgraded.');
            router.push('/employee/dashboard');
          } catch (verifyErr) {
            const errorMessage = handleApiError(verifyErr);
            alert('Payment verification failed: ' + errorMessage);
            setUpgrading(null);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#2563eb', // Blue color matching the theme
        },
        modal: {
          ondismiss: function() {
            setUpgrading(null);
          }
        }
      };

      // Step 4: Open Razorpay payment modal
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        alert('Payment failed: ' + (response.error.description || 'Unknown error'));
        setUpgrading(null);
      });
      razorpay.open();

    } catch (err) {
      const errorMessage = handleApiError(err);
      alert('Failed to initiate payment: ' + errorMessage);
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading plans...</h1>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h1>
          <p className="text-red-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/employee/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-lg text-gray-600">
            Choose a plan that fits your career goals
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                plan.is_current ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.is_current && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  CURRENT PLAN
                </div>
              )}

              <div className="p-8">
                {/* Plan Name & Price */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h2>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-extrabold text-blue-600">
                      ${parseFloat(plan.price).toFixed(0)}
                    </span>
                    <span className="text-gray-500 ml-2">/{plan.validity_days} days</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6">
                  {plan.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Features:
                  </h3>
                  {plan.features.map((feature) => (
                    <div key={feature.id} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {feature.feature_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {feature.feature_value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upgrade Button */}
                {!plan.is_current && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                      upgrading === plan.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {upgrading === plan.id ? 'Upgrading...' : 'Upgrade Now'}
                  </button>
                )}
                {plan.is_current && (
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-gray-400 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No upgrade plans available at the moment.
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/employee/dashboard')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
