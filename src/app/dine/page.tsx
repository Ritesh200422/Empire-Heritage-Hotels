import { prisma } from '@/lib/prisma';
import MenuView from './MenuView';

export default async function DinePage() {
  const categories = await prisma.menuCategory.findMany({
    include: {
      items: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-2">Our Menu</h1>
      <p className="text-slate-600 mb-8">Authentic flavors crafted to perfection.</p>
      <MenuView categories={categories} />
    </div>
  );
}
