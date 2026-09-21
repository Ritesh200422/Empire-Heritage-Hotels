import { getRoomTypes } from './actions';
import RoomsView from './RoomsView';

export const dynamic = 'force-dynamic';

export default async function StayPage() {
  let rooms: any[] = [];
  let dbError = null;

  try {
    rooms = await getRoomTypes();
  } catch (error) {
    console.error('Failed to load room types:', error);
    dbError = 'Database unavailable';
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-2">Our Rooms & Suites</h1>
      <p className="text-slate-600 mb-8">Select your dates to check availability and book your stay.</p>
      
      {dbError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
          <h2 className="font-bold text-lg mb-2">Database Connection Error</h2>
          <p className="mb-2">We could not fetch the rooms from the database. If you just deployed to Vercel, please ensure:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
            <li>You added a valid remote MySQL <strong>DATABASE_URL</strong> in Vercel Environment Variables.</li>
            <li>You ran <code>npx prisma db push</code> on your remote database to create the tables.</li>
            <li>You ran <code>npx prisma db seed</code> to populate the rooms data.</li>
          </ul>
          <p className="mt-4 text-xs text-red-600">
            Check the server logs for the connection details.
          </p>
        </div>
      ) : (
        <RoomsView initialRooms={rooms} />
      )}
    </div>
  );
}
