import Link from 'next/link';
import Image from 'next/image';
import { getRoomImage } from '@/lib/imageUrls';

const featuredRooms = [
  {
    name: 'Standard Room',
    description: 'A refined and comfortable stay with everything you need for a relaxing visit.',
  },
  {
    name: 'Deluxe Ocean View',
    description: 'Wake up to sweeping views and enjoy extra space designed for an indulgent escape.',
  },
  {
    name: 'Family Suite',
    description: 'Spacious family-friendly accommodation with room for everyone to unwind.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex items-center justify-center bg-[#4a1c1c] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {/* You could use an image background here, but keeping it simple/gradient for now as per instructions "no hotlinking copyrighted photos" */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a1c1c] to-[#602323]"></div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#fcfbf8] leading-tight">
            Experience Royal Heritage
          </h1>
          <p className="text-xl md:text-2xl text-slate-200">
            Luxury stays and exquisite dining in the heart of the city.
          </p>
          <div className="pt-8">
            <Link href="/stay" className="inline-block bg-[#b8860b] hover:bg-[#997300] text-white font-medium text-lg px-8 py-4 rounded-md transition-colors shadow-lg">
              Book Your Stay
            </Link>
            <Link href="/dine" className="inline-block bg-white text-[#4a1c1c] hover:bg-slate-100 font-medium text-lg px-8 py-4 rounded-md transition-colors shadow-lg ml-4">
              Explore Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 px-4 bg-[#fcfbf8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif text-center text-[#4a1c1c] mb-12">Our Signature Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <div key={room.name} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow overflow-hidden border border-slate-100">
                <div className="h-48 relative">
                  <Image
                    src={getRoomImage(room.name)}
                    alt={`${room.name} at Empire Heritage Hotels`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#4a1c1c] mb-2">{room.name}</h3>
                  <p className="text-slate-600 mb-4 line-clamp-2">{room.description}</p>
                  <Link href="/stay" className="text-[#b8860b] font-medium hover:underline">View Details &rarr;</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining Strip */}
      <section className="py-20 px-4 bg-[#4a1c1c] text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-6 text-[#fcfbf8]">Culinary Excellence</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
            Savor the authentic flavors of our heritage recipes, crafted by master chefs using the finest ingredients.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Starters', 'Biryani', 'Kebabs', 'Curries', 'Desserts'].map((item) => (
              <span key={item} className="px-6 py-2 border border-[#b8860b] text-[#b8860b] rounded-full text-lg">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/dine" className="inline-block bg-white text-[#4a1c1c] hover:bg-slate-100 font-medium text-lg px-8 py-3 rounded-md transition-colors">
              Order Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[#fcfbf8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif text-[#4a1c1c] mb-12">Guest Experiences</h2>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
            <div className="text-[#b8860b] text-6xl font-serif absolute top-4 left-8 opacity-20">&quot;</div>
            <p className="text-xl text-slate-700 italic relative z-10 mb-6">
              &quot;The most wonderful stay! The AI assistant made booking a breeze, and the room service from the in-house restaurant was simply phenomenal.&quot;
            </p>
            <p className="font-bold text-[#4a1c1c]">- Sarah J., Verified Guest</p>
          </div>
        </div>
      </section>
    </div>
  );
}
