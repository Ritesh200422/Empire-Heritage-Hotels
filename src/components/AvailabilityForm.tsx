'use client';

import { useState } from 'react';
import type { MissingField } from '@/lib/types';

interface AvailabilityFormProps {
  missingFields: MissingField[];
  prefillData?: Partial<{ checkIn: string; checkOut: string; adults: number }>;
  onSubmit: (form: { checkIn: string; checkOut: string; adults: number }) => void;
  onCancel: () => void;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function AvailabilityForm({
  missingFields,
  prefillData,
  onSubmit,
  onCancel,
}: AvailabilityFormProps) {
  const [checkIn, setCheckIn] = useState(prefillData?.checkIn || getTodayString());
  const [checkOut, setCheckOut] = useState(prefillData?.checkOut || getTomorrowString());
  const [adults, setAdults] = useState(prefillData?.adults || 2);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const today = getTodayString();
    if (checkIn < today) {
      setError('Check-in date cannot be in the past.');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (nights > 30) {
      setError('Maximum stay is 30 nights.');
      return;
    }

    onSubmit({ checkIn, checkOut, adults });
  };

  const showCheckIn = missingFields.includes('checkIn') || !prefillData?.checkIn;
  const showCheckOut = missingFields.includes('checkOut') || !prefillData?.checkOut;
  const showAdults = missingFields.includes('adults') || !prefillData?.adults;

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] sm:max-w-[80%] bg-white shadow-md border border-blue-100 rounded-2xl rounded-bl-md p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Check Availability
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {showCheckIn && (
              <div>
                <label htmlFor="check-in" className="block text-xs font-medium text-slate-600 mb-1">
                  Check-in
                </label>
                <input
                  id="check-in"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={getTodayString()}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                  required
                />
              </div>
            )}
            {showCheckOut && (
              <div>
                <label htmlFor="check-out" className="block text-xs font-medium text-slate-600 mb-1">
                  Check-out
                </label>
                <input
                  id="check-out"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || getTodayString()}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                  required
                />
              </div>
            )}
          </div>

          {showAdults && (
            <div>
              <label htmlFor="adults" className="block text-xs font-medium text-slate-600 mb-1">
                Number of Adults
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Decrease adults"
                >
                  −
                </button>
                <span id="adults" className="text-sm font-medium text-slate-800 w-6 text-center" aria-live="polite">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() => setAdults(Math.min(6, adults + 1))}
                  className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Increase adults"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search Rooms
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
