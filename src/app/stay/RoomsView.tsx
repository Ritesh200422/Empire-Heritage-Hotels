'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { checkRoomAvailability } from './actions';
import { useCartStore } from '@/store/cartStore';
import type { AvailabilityResult, AvailabilityOption } from '@/lib/types';
import Image from 'next/image';
import { getRoomImage } from '@/lib/imageUrls';

interface RoomType {
  id: string;
  name: string;
  description: string;
  maxAdults: number;
  maxOccupancy: number;
  pricePerNight: number;
  bedType: string;
  totalUnits: number;
  amenities: string[];
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function getLocalDateString(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateString(tomorrow);
}

export default function RoomsView({ initialRooms }: { initialRooms: RoomType[] }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [checkIn, setCheckIn] = useState(getLocalDateString());
  const [checkOut, setCheckOut] = useState(getTomorrowString());
  const [adults, setAdults] = useState(2);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const today = getLocalDateString();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAvailability(null);
    setAddedIds(new Set());
    setIsLoading(true);

    try {
      const res = await checkRoomAvailability(checkIn, checkOut, adults);
      setAvailability(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (room: RoomType, option: AvailabilityOption) => {
    addItem({
      id: `room-${room.id}-${checkIn}-${checkOut}`,
      kind: 'room',
      name: room.name,
      price: room.pricePerNight,
      quantity: 1,
      nights: option.nights,
      checkIn,
      checkOut,
      guests: adults,
      roomId: room.id,
    });
    setAddedIds((prev) => new Set(prev).add(room.id));
    router.push('/cart');
  };

  if (!mounted) return null;

  return (
    <div>
      {/* Availability Form */}
      <form
        onSubmit={handleCheck}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="checkin" className="block text-sm font-medium text-slate-700 mb-1">
              Check-in
            </label>
            <input
              id="checkin"
              required
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#b8860b] outline-none"
            />
          </div>
          <div>
            <label htmlFor="checkout" className="block text-sm font-medium text-slate-700 mb-1">
              Check-out
            </label>
            <input
              id="checkout"
              required
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#b8860b] outline-none"
            />
          </div>
          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-slate-700 mb-1">
              Guests
            </label>
            <input
              id="guests"
              required
              type="number"
              min="1"
              max="6"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#b8860b] outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#4a1c1c] text-white px-6 py-2.5 rounded-lg hover:bg-[#602323] disabled:opacity-50 transition-colors font-medium"
          >
            {isLoading ? 'Checking...' : 'Check Availability'}
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-sm">
          {error}
        </div>
      )}

      {/* Room Cards */}
      <div className="space-y-6">
        {initialRooms.map((room) => {
          const availOption = availability?.options?.find(
            (o: AvailabilityOption) => o.roomTypeId === room.id,
          );
          const isSearched = availability !== null;
          const wasAdded = addedIds.has(room.id);

          return (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/3 h-48 md:h-auto min-h-[200px] relative">
                <Image
                  src={getRoomImage(room.name)}
                  alt={`${room.name} room`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              {/* Details */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#4a1c1c]">{room.name}</h3>
                  <div className="sm:text-right flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-[#b8860b]">
                      ₹{room.pricePerNight.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-500 text-sm block">per night</span>
                  </div>
                </div>
                <p className="text-slate-600 mb-4 text-sm sm:text-base">{room.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-700">
                    Up to {room.maxOccupancy} guests
                  </span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-700">
                    {room.bedType}
                  </span>
                  {(room.amenities as string[]).slice(0, 4).map((amenity: string) => (
                    <span
                      key={amenity}
                      className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="mt-auto border-t pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {isSearched ? (
                    availOption ? (
                      <>
                        <div>
                          <span className="text-green-600 text-sm font-medium">
                            {availOption.unitsLeft} room(s) available
                          </span>
                          <span className="text-slate-400 text-xs block">
                            {availOption.nights} night(s) &middot; ₹
                            {availOption.totalPrice.toLocaleString('en-IN')} total
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(room, availOption)}
                          disabled={wasAdded}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto text-center ${
                            wasAdded
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-[#b8860b] text-white hover:bg-[#997300]'
                          }`}
                        >
                          {wasAdded ? '✓ Added to Cart' : 'Add to Cart'}
                        </button>
                      </>
                    ) : (
                      <span className="text-red-500 text-sm font-medium">
                        Sold out for selected dates
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400 text-sm italic">
                      Select dates above to check availability
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
