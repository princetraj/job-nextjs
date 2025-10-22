'use client';

import { useState, useEffect } from 'react';
import { paymentAPI, handleApiError } from '@/lib/api';

interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_percentage: number;
  expiry_date: string;
  coupon_for: string;
  assigned_at: string;
}

interface CouponSelectionProps {
  planId: string;
  planPrice: number;
  onCouponApplied: (couponCode: string, discount: number, finalAmount: number) => void;
  onCouponRemoved: () => void;
  userType: 'employee' | 'employer';
}

export default function CouponSelection({
  planId,
  planPrice,
  onCouponApplied,
  onCouponRemoved,
  userType,
}: CouponSelectionProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const fetchMyCoupons = async () => {
    try {
      const response = await paymentAPI.getMyAssignedCoupons();
      setCoupons(response.data.coupons || []);
      setError(null);
    } catch (err: any) {
      console.error('Fetch coupons error:', err);

      // Don't show error if it's just no coupons available
      // Only show error for actual failures
      if (err?.response?.status !== 401) {
        const errorMessage = handleApiError(err);
        console.warn('Could not load coupons:', errorMessage);
      }
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (couponCode: string) => {
    setValidating(true);
    setError(null);

    try {
      const response = await paymentAPI.validateCoupon(couponCode, planId);

      if (response.data.valid) {
        setSelectedCoupon(couponCode);
        const discount = parseFloat(response.data.discount_amount);
        const finalAmount = parseFloat(response.data.final_amount);
        onCouponApplied(couponCode, discount, finalAmount);
        setShowCoupons(false);
      } else {
        setError(response.data.message || 'Invalid coupon');
      }
    } catch (err: any) {
      console.error('Coupon validation error:', err);

      // Check if it's an authentication error
      if (err?.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        const errorMessage = handleApiError(err);
        setError(errorMessage || 'Failed to validate coupon. Please try again.');
      }
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setError(null);
    onCouponRemoved();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const themeColor = userType === 'employer' ? 'green' : 'blue';
  const bgColor = userType === 'employer' ? 'bg-green-600' : 'bg-blue-600';
  const hoverColor = userType === 'employer' ? 'hover:bg-green-700' : 'hover:bg-blue-700';
  const textColor = userType === 'employer' ? 'text-green-600' : 'text-blue-600';
  const borderColor = userType === 'employer' ? 'border-green-500' : 'border-blue-500';

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Loading available coupons...</p>
      </div>
    );
  }

  if (coupons.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {!selectedCoupon ? (
        <div>
          {!showCoupons ? (
            <button
              onClick={() => setShowCoupons(true)}
              className={`w-full py-3 px-4 ${bgColor} ${hoverColor} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Have a Coupon? Click to Apply
            </button>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Available Coupons ({coupons.length})</h3>
                <button
                  onClick={() => {
                    setShowCoupons(false);
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-3 py-1 ${bgColor} text-white text-sm font-bold rounded`}>
                            {coupon.code}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            {coupon.discount_percentage}% OFF
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{coupon.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Valid until: {formatDate(coupon.expiry_date)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyCoupon(coupon.code)}
                        disabled={validating}
                        className={`px-4 py-2 ${bgColor} ${hoverColor} text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {validating ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 pt-2 border-t border-gray-100">
                      Save ₹{((planPrice * coupon.discount_percentage) / 100).toFixed(2)} on this plan
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`bg-green-50 border-2 ${borderColor} rounded-lg p-4`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Coupon Applied Successfully!</p>
                <p className="text-xs text-gray-600 mt-1">
                  Coupon code: <span className="font-bold">{selectedCoupon}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
