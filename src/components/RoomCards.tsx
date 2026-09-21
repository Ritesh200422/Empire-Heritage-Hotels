import type { AvailabilityResult, Alternative } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import { getRoomImage } from '@/lib/imageUrls';

interface RoomCardsProps {
  availability: AvailabilityResult;
  alternatives?: Alternative[];
  onAlternativeClick?: (form: { checkIn: string; checkOut: string; adults: number }) => void;
}

export function RoomCards({ availability, alternatives, onAlternativeClick }: RoomCardsProps) {
  const { options, checkIn, checkOut, adults } = availability;
  const { addItem } = useCartStore();

  const handleBook = (option: any) => {
    addItem({
      id: `room-${option.roomTypeId}-${checkIn}-${checkOut}`,
      kind: 'room',
      name: option.name,
      price: option.pricePerNight,
      quantity: 1, // 1 room
      nights: option.nights,
      checkIn,
      checkOut,
      guests: adults,
      roomId: option.roomTypeId,
    });
    alert(`Added ${option.name} to your cart!`);
  };

  if (options.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-start">
          <div className="max-w-[85%] sm:max-w-[75%] bg-amber-50 border border-amber-200 rounded-2xl rounded-bl-md p-4">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-sm font-semibold">No Rooms Available</h3>
            </div>
            <p className="text-sm text-amber-800">
              No rooms are available for {adults} adult{adults > 1 ? 's' : ''} from{' '}
              {checkIn} to {checkOut}. Try different dates or a smaller group.
            </p>
          </div>
        </div>

        {alternatives && alternatives.length > 0 && (
          <div className="flex justify-start">
            <div className="max-w-[95%] sm:max-w-[85%]">
              <p className="text-sm font-medium text-slate-600 mb-2">You might consider these alternatives:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label="Alternative options">
                {alternatives.map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAlternativeClick?.({ checkIn: alt.checkIn, checkOut: alt.checkOut, adults: alt.adults })}
                    className="text-left relative bg-white border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden"
                    role="listitem"
                  >
                    <span className="absolute -top-2 right-3 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full uppercase tracking-wider border border-blue-200 z-10">
                      {alt.description}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 mb-1">{alt.roomName}</h4>
                    <div className="w-full h-32 relative -mx-4 my-3">
                      <Image
                        src={getRoomImage(alt.roomName)}
                        alt={`${alt.roomName} room`}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p className="flex justify-between">
                        <span>Dates</span>
                        <span className="font-medium text-slate-800">{alt.checkIn} to {alt.checkOut}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>{alt.nights} night{alt.nights > 1 ? 's' : ''} total</span>
                        <span className="font-semibold text-blue-600">₹{alt.totalPrice}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const cheapestId = options.reduce(
    (min, opt) => (opt.pricePerNight < min.pricePerNight ? opt : min),
    options[0],
  ).roomTypeId;

  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] sm:max-w-[85%]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label="Available rooms">
          {options.map((option) => (
            <div
              key={option.roomTypeId}
              className="relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              role="listitem"
            >
              {option.roomTypeId === cheapestId && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full uppercase tracking-wider">
                  Best Match
                </span>
              )}
              <h4 className="text-sm font-semibold text-slate-800 mb-1">{option.name}</h4>
              <div className="w-full h-24 relative -mx-4 my-2" style={{width: 'calc(100% + 2rem)'}}>
                <Image
                  src={getRoomImage(option.name)}
                  alt={`${option.name} room`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 text-xs text-slate-600 mb-3 flex-1">
                <p className="flex justify-between">
                  <span>Price per night</span>
                  <span className="font-medium text-slate-800">₹{option.pricePerNight}</span>
                </p>
                <p className="flex justify-between">
                  <span>{option.nights} night{option.nights > 1 ? 's' : ''} total</span>
                  <span className="font-semibold text-[#b8860b]">₹{option.totalPrice}</span>
                </p>
                <p className="flex justify-between">
                  <span>Units available</span>
                  <span
                    className={`font-medium ${option.unitsLeft <= 3 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {option.unitsLeft} left
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleBook(option)}
                className="w-full mt-2 bg-[#b8860b] hover:bg-[#997300] text-white py-1.5 rounded text-xs font-medium transition-colors"
              >
                Book this room
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
