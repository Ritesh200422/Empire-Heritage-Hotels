import { prisma } from '@/lib/prisma';
import MenuView from './MenuView';

export const dynamic = 'force-dynamic';

export default async function DinePage() {
  let categories = [];
  let dbError = null;

  try {
    categories = await prisma.menuCategory.findMany({
      include: {
        items: true
      }
    });
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Unknown database error";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-2">Our Menu</h1>
      <p className="text-slate-600 mb-8">Authentic flavors crafted to perfection.</p>
      
      {dbError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
          <h2 className="font-bold text-lg mb-2">Database Connection Error</h2>
          <p className="mb-2">We could not fetch the menu from the database. If you just deployed to Vercel, please ensure:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
            <li>You added a valid remote MySQL <strong>DATABASE_URL</strong> in Vercel Environment Variables.</li>
            <li>You ran <code>npx prisma db push</code> and <code>npx prisma db seed</code> on your remote database.</li>
          </ul>
          <div className="mt-4 p-3 bg-white bg-opacity-50 rounded text-xs font-mono text-red-800 break-all">
            {dbError}
          </div>
        </div>
      ) : (
        <MenuView categories={categories} />
      )}
    </div>
  );
}
