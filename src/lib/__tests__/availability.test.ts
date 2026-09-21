import { describe, it, expect, vi } from 'vitest';
import { validateAvailabilityParams, parseDate, AvailabilityError } from '@/lib/availability';
import * as availabilityModule from '@/lib/availability';

describe('parseDate', () => {
  it('parses valid ISO date', () => {
    const date = parseDate('2026-10-15', 'checkIn');
    expect(date.toISOString()).toBe('2026-10-15T00:00:00.000Z');
  });

  it('rejects invalid format', () => {
    expect(() => parseDate('15/10/2026', 'checkIn')).toThrow(AvailabilityError);
    expect(() => parseDate('2026-1-5', 'checkIn')).toThrow(AvailabilityError);
    expect(() => parseDate('not-a-date', 'checkIn')).toThrow(AvailabilityError);
  });

  it('rejects invalid date values', () => {
    expect(() => parseDate('2026-13-01', 'checkIn')).toThrow(AvailabilityError);
    expect(() => parseDate('2026-02-30', 'checkIn')).toThrow(AvailabilityError);
  });
});

describe('validateAvailabilityParams', () => {
  // Use future dates for testing
  const futureCheckIn = '2027-06-15';
  const futureCheckOut = '2027-06-18';

  it('validates correct parameters', () => {
    const result = validateAvailabilityParams(futureCheckIn, futureCheckOut, 2);
    expect(result.nights).toBe(3);
    expect(result.checkInDate.toISOString()).toBe('2027-06-15T00:00:00.000Z');
    expect(result.checkOutDate.toISOString()).toBe('2027-06-18T00:00:00.000Z');
  });

  it('rejects checkOut before checkIn', () => {
    expect(() =>
      validateAvailabilityParams('2027-06-18', '2027-06-15', 2),
    ).toThrow('checkOut must be after checkIn');
  });

  it('rejects same-day checkIn/checkOut', () => {
    expect(() =>
      validateAvailabilityParams('2027-06-15', '2027-06-15', 2),
    ).toThrow('checkOut must be after checkIn');
  });

  it('rejects past checkIn dates', () => {
    expect(() =>
      validateAvailabilityParams('2020-01-01', '2020-01-05', 2),
    ).toThrow('checkIn cannot be in the past');
  });

  it('rejects stays exceeding 30 nights', () => {
    expect(() =>
      validateAvailabilityParams('2027-06-01', '2027-07-15', 2),
    ).toThrow('Maximum stay is 30 nights');
  });

  it('allows exactly 30 nights', () => {
    const result = validateAvailabilityParams('2027-06-01', '2027-07-01', 2);
    expect(result.nights).toBe(30);
  });

  it('rejects 0 adults', () => {
    expect(() =>
      validateAvailabilityParams(futureCheckIn, futureCheckOut, 0),
    ).toThrow('Number of adults must be between 1 and 6');
  });

  it('rejects 7 adults', () => {
    expect(() =>
      validateAvailabilityParams(futureCheckIn, futureCheckOut, 7),
    ).toThrow('Number of adults must be between 1 and 6');
  });

  it('rejects non-integer adults', () => {
    expect(() =>
      validateAvailabilityParams(futureCheckIn, futureCheckOut, 2.5),
    ).toThrow('Number of adults must be between 1 and 6');
  });

  it('accepts 1 adult', () => {
    const result = validateAvailabilityParams(futureCheckIn, futureCheckOut, 1);
    expect(result.nights).toBe(3);
  });

  it('accepts 6 adults', () => {
    const result = validateAvailabilityParams(futureCheckIn, futureCheckOut, 6);
  });
});

describe('suggestAlternatives', () => {
  it('does not suggest past dates', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkOutStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    // mock checkAvailability to return 0 for exact, but 1 for all shifted
    vi.spyOn(availabilityModule, 'checkAvailability').mockResolvedValue({
      checkIn: '', checkOut: '', adults: 2,
      options: [{ roomTypeId: 'r1', name: 'R1', unitsLeft: 1, pricePerNight: 100, totalPrice: 100, nights: 1 }]
    });

    const alts = await availabilityModule.suggestAlternatives(todayStr, checkOutStr, 2);
    // Since checkIn is today, -1, -2, -3 days should be skipped.
    const pastShifts = alts.filter(a => a.checkIn < todayStr);
    expect(pastShifts.length).toBe(0);

    vi.restoreAllMocks();
  });
});
