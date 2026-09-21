/**
 * Deterministic availability logic — NO LLM calls here.
 * Pure TypeScript + SQL over Booking/RoomType tables.
 */

import { prisma } from '@/lib/prisma';
import type { AvailabilityOption, AvailabilityResult } from '@/lib/types';

export class AvailabilityError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'AvailabilityError';
  }
}

/** Validate and parse an ISO date string (YYYY-MM-DD). Returns midnight UTC. */
export function parseDate(dateStr: string, fieldName: string): Date {
  const match = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  if (!match) {
    throw new AvailabilityError(
      `${fieldName} must be in YYYY-MM-DD format (got "${dateStr}")`,
      'INVALID_DATE_FORMAT',
    );
  }
  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    throw new AvailabilityError(
      `${fieldName} is not a valid date`,
      'INVALID_DATE',
    );
  }
  // Verify the date components match the input (catches cases like Feb 30 → Mar 2)
  const [year, month, day] = dateStr.split('-').map(Number);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new AvailabilityError(
      `${fieldName} is not a valid date (${dateStr})`,
      'INVALID_DATE',
    );
  }
  return date;
}

/** Validate all business rules for an availability check */
export function validateAvailabilityParams(
  checkIn: string,
  checkOut: string,
  adults: number,
): { checkInDate: Date; checkOutDate: Date; nights: number } {
  const checkInDate = parseDate(checkIn, 'checkIn');
  const checkOutDate = parseDate(checkOut, 'checkOut');

  // Check-out must be after check-in
  if (checkOutDate <= checkInDate) {
    throw new AvailabilityError(
      'checkOut must be after checkIn',
      'CHECKOUT_BEFORE_CHECKIN',
    );
  }

  // Check-in must not be in the past (compare date-only, UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (checkInDate < today) {
    throw new AvailabilityError(
      'checkIn cannot be in the past',
      'CHECKIN_IN_PAST',
    );
  }

  // Max stay 30 nights
  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (nights > 30) {
    throw new AvailabilityError(
      'Maximum stay is 30 nights',
      'MAX_STAY_EXCEEDED',
    );
  }

  // Adults 1..6
  if (!Number.isInteger(adults) || adults < 1 || adults > 6) {
    throw new AvailabilityError(
      'Number of adults must be between 1 and 6',
      'INVALID_ADULTS',
    );
  }

  return { checkInDate, checkOutDate, nights };
}

/**
 * Check room availability for given dates and number of adults.
 * Counts overlapping confirmed bookings per room type, then computes units left.
 */
export async function checkAvailability(
  checkIn: string,
  checkOut: string,
  adults: number,
): Promise<AvailabilityResult> {
  const { checkInDate, checkOutDate, nights } = validateAvailabilityParams(
    checkIn,
    checkOut,
    adults,
  );

  // Get room types that can accommodate the number of adults
  const roomTypes = await prisma.roomType.findMany({
    where: { maxOccupancy: { gte: adults } },
    include: {
      bookings: {
        where: {
          status: 'confirmed',
          // Overlap condition: booking.checkIn < requested.checkOut AND booking.checkOut > requested.checkIn
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      },
    },
  });

  const options: AvailabilityOption[] = roomTypes
    .map((rt) => {
      const overlappingBookings = rt.bookings.length;
      const unitsLeft = rt.totalUnits - overlappingBookings;

      return {
        roomTypeId: rt.id,
        name: rt.name,
        unitsLeft: Math.max(0, unitsLeft),
        pricePerNight: rt.pricePerNight,
        totalPrice: rt.pricePerNight * nights,
        nights,
      };
    })
    .filter((opt) => opt.unitsLeft > 0)
    .sort((a, b) => a.pricePerNight - b.pricePerNight);

  return {
    checkIn,
    checkOut,
    adults,
    options,
  };
}

/**
 * Find room types that can accommodate a given number of adults.
 * Used when the guest asks about rooms for N guests without providing dates.
 */
export async function findRoomsForGuests(adults: number) {
  if (!Number.isInteger(adults) || adults < 1 || adults > 6) {
    throw new AvailabilityError(
      'Number of adults must be between 1 and 6',
      'INVALID_ADULTS',
    );
  }

  const roomTypes = await prisma.roomType.findMany({
    where: { maxOccupancy: { gte: adults } },
    orderBy: { pricePerNight: 'asc' },
  });

  return roomTypes.map((rt) => ({
    roomTypeId: rt.id,
    name: rt.name,
    description: rt.description,
    maxAdults: rt.maxAdults,
    maxOccupancy: rt.maxOccupancy,
    pricePerNight: rt.pricePerNight,
    bedType: rt.bedType,
    amenities: rt.amenities,
  }));
}

/**
 * Suggest alternatives when rooms are sold out for the requested dates.
 */
export async function suggestAlternatives(
  checkIn: string,
  checkOut: string,
  adults: number,
): Promise<import('@/lib/types').Alternative[]> {
  const { checkInDate, checkOutDate, nights } = validateAvailabilityParams(checkIn, checkOut, adults);
  const alternatives: import('@/lib/types').Alternative[] = [];
  
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Strategy: Shift dates by -3 to +3 days
  const shifts = [-3, -2, -1, 1, 2, 3];
  for (const shift of shifts) {
    if (alternatives.length >= 3) break;
    
    const shiftedIn = new Date(checkInDate);
    shiftedIn.setUTCDate(shiftedIn.getUTCDate() + shift);
    
    const shiftedOut = new Date(checkOutDate);
    shiftedOut.setUTCDate(shiftedOut.getUTCDate() + shift);
    
    if (shiftedIn >= today) {
      const cInStr = shiftedIn.toISOString().split('T')[0];
      const cOutStr = shiftedOut.toISOString().split('T')[0];
      try {
        const res = await checkAvailability(cInStr, cOutStr, adults);
        if (res.options.length > 0) {
          const bestOption = res.options[0];
          alternatives.push({
            type: 'shifted_dates',
            checkIn: cInStr,
            checkOut: cOutStr,
            adults,
            roomTypeId: bestOption.roomTypeId,
            roomName: bestOption.name,
            nights,
            pricePerNight: bestOption.pricePerNight,
            totalPrice: bestOption.totalPrice,
            unitsLeft: bestOption.unitsLeft,
            description: `Shifted by ${Math.abs(shift)} day${Math.abs(shift) > 1 ? 's' : ''} ${shift > 0 ? 'later' : 'earlier'}`
          });
        }
      } catch {
        // ignore errors from invalid dates etc
      }
    }
  }

  // Strategy: Shorter stay (if nights > 1)
  if (alternatives.length < 3 && nights > 1) {
    const shortOut = new Date(checkOutDate);
    shortOut.setUTCDate(shortOut.getUTCDate() - 1);
    
    const cInStr = checkInDate.toISOString().split('T')[0];
    const cOutStr = shortOut.toISOString().split('T')[0];
    
    try {
      const res = await checkAvailability(cInStr, cOutStr, adults);
      if (res.options.length > 0) {
        const bestOption = res.options[0];
        alternatives.push({
          type: 'shorter_stay',
          checkIn: cInStr,
          checkOut: cOutStr,
          adults,
          roomTypeId: bestOption.roomTypeId,
          roomName: bestOption.name,
          nights: nights - 1,
          pricePerNight: bestOption.pricePerNight,
          totalPrice: bestOption.totalPrice,
          unitsLeft: bestOption.unitsLeft,
          description: `Shorter stay (1 day less)`
        });
      }
    } catch {
      // ignore
    }
  }

  return alternatives.slice(0, 3);
}
