'use client';

import { useEffect, useState } from 'react';
import { planAPI, handleApiError } from '@/lib/api';
import Link from 'next/link';

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
  features: Feature[];
  is_default: boolean;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  is_expired: boolean;
  days_remaining: number | null;
}

export default function PlanCard() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const response = await planAPI.getCurrentPlan();
      setPlan(response.data.plan);
      setError(null);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">Unable to load plan information</p>
      </div>
    );
  }

  const expiryDate = new Date(plan.expires_at);
  const isExpiringSoon = plan.days_remaining !== null && plan.days_remaining < 30;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">{plan.name}</p>
          </div>
          {plan.is_default && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Default
            </span>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="text-lg font-semibold text-gray-900">
              ${parseFloat(plan.price).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Expires:</span>
            <span className={`text-sm font-medium ${
              plan.is_expired
                ? 'text-red-600'
                : isExpiringSoon
                ? 'text-orange-600'
                : 'text-gray-900'
            }`}>
              {expiryDate.toLocaleDateString()}
            </span>
          </div>

          {plan.days_remaining !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Days Remaining:</span>
              <span className={`text-sm font-bold ${
                plan.is_expired
                  ? 'text-red-600'
                  : plan.days_remaining < 30
                  ? 'text-orange-600'
                  : 'text-green-600'
              }`}>
                {plan.is_expired ? 'Expired' : `${plan.days_remaining} days`}
              </span>
            </div>
          )}
        </div>

        {plan.features && plan.features.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Features:</h4>
            <ul className="space-y-2">
              {plan.features.slice(0, 3).map((feature) => (
                <li key={feature.id} className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    <p className="text-sm font-medium text-gray-900">{feature.feature_name}</p>
                    <p className="text-xs text-gray-600">{feature.feature_value}</p>
                  </div>
                </li>
              ))}
              {plan.features.length > 3 && (
                <li className="text-xs text-gray-500 italic">
                  +{plan.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {(plan.is_default || isExpiringSoon || plan.is_expired) && (
          <Link
            href="/employee/upgrade-plan"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {plan.is_expired
              ? 'Renew Plan'
              : plan.is_default
              ? 'Upgrade Plan'
              : 'Explore Upgrades'}
          </Link>
        )}
      </div>
    </div>
  );
}
