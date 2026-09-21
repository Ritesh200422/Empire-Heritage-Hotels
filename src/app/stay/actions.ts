'use server';

import { prisma } from '@/lib/prisma';
import { checkAvailability } from '@/lib/availability';
import type { AvailabilityResult } from '@/lib/types';

export async function getRoomTypes() {
  const rooms = await prisma.roomType.findMany({
    orderBy: { pricePerNight: 'asc' },
  });
  return rooms.map(r => ({ ...r, amenities: r.amenities as string[] }));
}

export async function checkRoomAvailability(
  checkIn: string,
  checkOut: string,
  adults: number,
): Promise<AvailabilityResult> {
  try {
    return await checkAvailability(checkIn, checkOut, adults);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(message);
  }
}
