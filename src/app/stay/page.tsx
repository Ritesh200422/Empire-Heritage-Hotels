import { getRoomTypes } from './actions';
import RoomsView from './RoomsView';

export default async function StayPage() {
  const rooms = await getRoomTypes();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-2">Our Rooms & Suites</h1>
      <p className="text-slate-600 mb-8">Select your dates to check availability and book your stay.</p>
      <RoomsView initialRooms={rooms} />
    </div>
  );
}
