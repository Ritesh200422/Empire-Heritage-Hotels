'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import { getMenuImage } from '@/lib/imageUrls';

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  spiceLevel: number;
  isBestseller: boolean;
  imageUrl: string | null;
}

interface CategoryData {
  id: string;
  name: string;
  items: MenuItemData[];
}

type VegFilter = 'all' | 'veg' | 'nonveg';
type PriceSort = 'none' | 'asc' | 'desc';

const SPICE_LABELS = ['No spice', 'Mild 🌶️', 'Medium 🌶️🌶️', 'Hot 🌶️🌶️🌶️'] as const;

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function MenuView({ categories }: { categories: CategoryData[] }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [activeTab, setActiveTab] = useState(categories[0]?.id || '');
  const [search, setSearch] = useState('');
  const [filterVeg, setFilterVeg] = useState<VegFilter>('all');
  const [sortPrice, setSortPrice] = useState<PriceSort>('none');
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (item: MenuItemData, quantity: number) => {
    addItem({
      id: `food-${item.id}`,
      kind: 'food',
      name: item.name,
      price: item.price,
      quantity,
      foodId: item.id,
      isVeg: item.isVeg,
    });
  };

  const filteredItems = useMemo(() => {
    const category = categories.find((c) => c.id === activeTab);
    if (!category) return [];
    let items = [...category.items];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
      );
    }

    if (filterVeg === 'veg') items = items.filter((i) => i.isVeg);
    if (filterVeg === 'nonveg') items = items.filter((i) => !i.isVeg);

    if (sortPrice === 'asc') items.sort((a, b) => a.price - b.price);
    if (sortPrice === 'desc') items.sort((a, b) => b.price - a.price);

    return items;
  }, [categories, activeTab, search, filterVeg, sortPrice]);

  if (!mounted) return null;

  return (
    <div>
      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search menu items"
          className="px-4 py-2.5 border rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-[#b8860b] outline-none"
        />
        <div className="flex gap-3">
          <select
            value={filterVeg}
            onChange={(e) => setFilterVeg(e.target.value as VegFilter)}
            aria-label="Filter by dietary preference"
            className="px-4 py-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-[#b8860b] outline-none"
          >
            <option value="all">All</option>
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-Vegetarian</option>
          </select>
          <select
            value={sortPrice}
            onChange={(e) => setSortPrice(e.target.value as PriceSort)}
            aria-label="Sort by price"
            className="px-4 py-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-[#b8860b] outline-none"
          >
            <option value="none">Sort by</option>
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Category Tabs — horizontally scrollable on mobile */}
      <div className="overflow-x-auto pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                activeTab === cat.id
                  ? 'bg-[#4a1c1c] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg mb-2">No items found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  onAdd,
}: {
  item: MenuItemData;
  onAdd: (item: MenuItemData, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAdd(item, qty);
    setJustAdded(true);
    setQty(1);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="h-36 sm:h-40 relative flex items-center justify-center text-slate-400 text-sm">
        <Image
          src={getMenuImage(item.name, item.description)}
          alt={`${item.name} dish`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        {item.isBestseller && (
          <span className="absolute top-2 right-2 bg-[#b8860b] text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider z-10">
            Bestseller
          </span>
        )}
      </div>
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-3 h-3 rounded-sm border flex-shrink-0 ${
                item.isVeg
                  ? 'border-green-600 bg-green-500'
                  : 'border-red-600 bg-red-500'
              }`}
              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            />
            <h4 className="font-bold text-[#4a1c1c] text-base truncate">{item.name}</h4>
          </div>
          <span className="font-bold text-[#b8860b] flex-shrink-0">
            ₹{item.price.toLocaleString('en-IN')}
          </span>
        </div>
        {item.spiceLevel > 0 && (
          <p className="text-xs text-orange-600 mb-1">{SPICE_LABELS[item.spiceLevel]}</p>
        )}
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{item.description}</p>

        {/* Quantity + Add */}
        <div className="flex items-center justify-between border-t pt-3 gap-3">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              aria-label="Decrease quantity"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium" aria-label={`Quantity: ${qty}`}>
              {qty}
            </span>
            <button
              onClick={() => setQty(qty + 1)}
              aria-label="Increase quantity"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            className={`px-5 py-1.5 rounded-lg font-medium text-sm transition-colors ${
              justAdded
                ? 'bg-green-100 text-green-700'
                : 'bg-[#4a1c1c] text-white hover:bg-[#602323]'
            }`}
          >
            {justAdded ? '✓ Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
