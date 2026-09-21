'use client';

import { useCartStore } from '@/store/cartStore';
import { calculateSubtotal, calculateTaxes, calculateTotal } from '@/lib/pricing';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;

  const subtotal = calculateSubtotal(items);
  const taxes = calculateTaxes(items);
  const total = calculateTotal(items);

  const roomItems = items.filter(i => i.kind === 'room');
  const foodItems = items.filter(i => i.kind === 'food');

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif font-bold text-[#4a1c1c] mb-4">Your Cart is Empty</h1>
        <p className="text-slate-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <div className="flex justify-center gap-4">
          <Link href="/stay" className="bg-[#4a1c1c] text-white px-6 py-3 rounded-md hover:bg-[#602323]">Book a Room</Link>
          <Link href="/dine" className="bg-white text-[#4a1c1c] border border-[#4a1c1c] px-6 py-3 rounded-md hover:bg-slate-50">Order Food</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {roomItems.length > 0 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#4a1c1c] mb-4 border-b pb-2">Room Reservations</h2>
              <div className="space-y-4">
                {roomItems.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#4a1c1c]">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.checkIn} to {item.checkOut} ({item.nights} nights)</p>
                      <p className="text-sm text-slate-500">{item.guests} Guests</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-[#b8860b]">₹{item.price * (item.nights || 1) * item.quantity}</p>
                        <p className="text-xs text-slate-400">₹{item.price}/night</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {foodItems.length > 0 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#4a1c1c] mb-4 border-b pb-2">Food & Beverages</h2>
              <div className="space-y-4">
                {foodItems.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <h3 className="font-bold text-lg text-[#4a1c1c]">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 border rounded-md overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200">-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200">+</button>
                      </div>
                      <div className="text-right w-20">
                        <p className="font-bold text-[#b8860b]">₹{item.price * item.quantity}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
            <h2 className="text-xl font-bold text-[#4a1c1c] mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm text-slate-600 mb-6 border-b pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Room Tax (12%)</span>
                <span>₹{taxes.roomTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Food Tax (5%)</span>
                <span>₹{taxes.foodTax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg text-[#4a1c1c] mb-6">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="block w-full bg-[#b8860b] hover:bg-[#997300] text-white text-center font-medium py-3 rounded-md transition-colors">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
