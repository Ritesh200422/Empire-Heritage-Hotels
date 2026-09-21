import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-serif font-bold text-[#4a1c1c] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-[#4a1c1c] hover:bg-[#602323] text-white font-medium px-6 py-3 rounded-md transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/stay"
            className="border border-[#4a1c1c] text-[#4a1c1c] hover:bg-[#4a1c1c] hover:text-white font-medium px-6 py-3 rounded-md transition-colors"
          >
            Browse Rooms
          </Link>
        </div>
      </div>
    </div>
  );
}
