'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { planAPI, paymentAPI, handleApiError } from '@/lib/api';
import CouponSelection from '@/components/CouponSelection';

// Declare Razorpay types
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayError) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
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
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

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

  const handleSelectPlan = (planId: string, planPrice: number) => {
    setSelectedPlanId(planId);
    setFinalAmount(planPrice);
    setShowCheckout(true);
  };

  const handleCouponApplied = (couponCode: string, discount: number, finalAmt: number) => {
    setAppliedCoupon(couponCode);
    setDiscountAmount(discount);
    setFinalAmount(finalAmt);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    if (selectedPlan) {
      setFinalAmount(parseFloat(selectedPlan.price));
    }
  };

  const handleProceedToPayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      alert('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }

    if (!selectedPlanId) return;

    setUpgrading(selectedPlanId);
    try {
      // Step 1: Create Razorpay order (with coupon if applied)
      const orderResponse = await paymentAPI.createRazorpayOrder(selectedPlanId, appliedCoupon || undefined);
      const { razorpay_order_id, amount, currency, razorpay_key, plan } = orderResponse.data;

      // Step 2: Configure Razorpay options
      const options = {
        key: razorpay_key,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        name: 'Job Portal',
        description: `Upgrade to ${plan.name}`,
        order_id: razorpay_order_id,
        handler: async function (response: RazorpayResponse) {
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
      razorpay.on('payment.failed', function (response: RazorpayError) {
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

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

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
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Razorpay script loaded successfully');
          setRazorpayLoaded(true);
        }}
        onError={(e) => {
          console.error('Failed to load Razorpay script', e);
          setError('Failed to load payment gateway. Please refresh the page.');
        }}
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
                      ₹{parseFloat(plan.price).toFixed(0)}
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
                    onClick={() => handleSelectPlan(plan.id, parseFloat(plan.price))}
                    disabled={upgrading === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                      upgrading === plan.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {upgrading === plan.id ? 'Upgrading...' : 'Select Plan'}
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

        {/* Checkout Modal */}
        {showCheckout && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Complete Your Upgrade</h2>
                    <p className="text-gray-600 mt-1">Review and proceed to payment</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setSelectedPlanId(null);
                      setAppliedCoupon(null);
                      setDiscountAmount(0);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Plan Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan Name:</span>
                      <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Validity:</span>
                      <span className="font-semibold text-gray-900">{selectedPlan.validity_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="font-semibold text-gray-900">₹{parseFloat(selectedPlan.price).toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2"></div>
                      </>
                    )}
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900">Total Amount:</span>
                      <span className="font-bold text-blue-600">₹{finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Selection */}
                <CouponSelection
                  planId={selectedPlan.id}
                  planPrice={parseFloat(selectedPlan.price)}
                  onCouponApplied={handleCouponApplied}
                  onCouponRemoved={handleCouponRemoved}
                  userType="employee"
                />

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={!!upgrading || !razorpayLoaded}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-colors ${
                    upgrading || !razorpayLoaded
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {!razorpayLoaded
                    ? 'Loading payment gateway...'
                    : upgrading
                    ? 'Processing...'
                    : `Proceed to Payment - ₹${finalAmount.toFixed(2)}`}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You will be redirected to Razorpay for secure payment processing
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
