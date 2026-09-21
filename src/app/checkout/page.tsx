'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { calculateTotal } from '@/lib/pricing';

export default function CheckoutPage() {
  const { email } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'upi' | 'hotel'>('wallet');
  const [walletBalance, setWalletBalance] = useState(50000);
  
  // Card Details
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  
  // UPI
  const [upiId, setUpiId] = useState('demo@upi');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiWaiting, setUpiWaiting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !email) {
      router.push('/login?redirect=/checkout');
    }
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, email, items, router]);

  if (!mounted || !email || items.length === 0) return null;

  const total = calculateTotal(items);

  const processPayment = async () => {
    setError('');
    setIsProcessing(true);

    try {
      // Simulate validation & payment processing
      if (paymentMethod === 'card') {
        if (cardNumber === '4000000000000002') {
          throw new Error('Payment declined by bank (Demo Mode)');
        }
      }
      
      if (paymentMethod === 'wallet') {
        if (total > walletBalance) {
          throw new Error('Insufficient demo wallet balance');
        }
        setWalletBalance(prev => prev - total);
      }

      if (paymentMethod === 'upi') {
        setUpiWaiting(true);
        await new Promise(r => setTimeout(r, 3000));
        setUpiWaiting(false);
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }

      // API Call
      const res = await fetch('/api/payments/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          paymentMethod,
          idempotencyKey: crypto.randomUUID()
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process order');
      }

      clearCart();
      router.push(`/orders/${data.orderId}`);
      
    } catch (err: any) {
      setError(err.message);
      setUpiWaiting(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 sticky top-16 z-40">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-bold">
              DEMO MODE: No real money is charged. Do not enter real card details.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {/* Guest Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-serif font-bold text-[#4a1c1c] mb-4 border-b pb-2">Guest Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" defaultValue="Guest User" className="w-full px-4 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={email} readOnly className="w-full px-4 py-2 border rounded-md bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" defaultValue="+91 99999 99999" className="w-full px-4 py-2 border rounded-md" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-serif font-bold text-[#4a1c1c] mb-4 border-b pb-2">Payment Method</h2>
            
            <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
              {['wallet', 'card', 'upi', 'hotel'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={`px-4 py-2 rounded-md whitespace-nowrap ${
                    paymentMethod === method ? 'bg-[#4a1c1c] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {method === 'wallet' && 'Demo Wallet'}
                  {method === 'card' && 'Credit/Debit Card'}
                  {method === 'upi' && 'UPI'}
                  {method === 'hotel' && 'Pay at Hotel'}
                </button>
              ))}
            </div>

            <div className="p-4 border rounded-md bg-slate-50 min-h-[150px]">
              {paymentMethod === 'wallet' && (
                <div>
                  <p className="font-bold text-lg mb-2">Demo Wallet Balance: ₹{walletBalance.toFixed(2)}</p>
                  <p className="text-slate-600 text-sm">Paying ₹{total.toFixed(2)} will leave you with ₹{(walletBalance - total).toFixed(2)}</p>
                </div>
              )}
              
              {paymentMethod === 'card' && (
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label htmlFor="cardNumber" className="block text-xs font-bold text-slate-700 uppercase mb-1">Card Number</label>
                    <input id="cardNumber" type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full px-4 py-2 border rounded-md font-mono" />
                    <p className="text-xs text-slate-500 mt-1">Use 4000000000000002 to test decline.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry</label>
                      <input type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full px-4 py-2 border rounded-md font-mono" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CVV</label>
                      <input type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full px-4 py-2 border rounded-md font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="max-w-sm">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">UPI ID</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full px-4 py-2 border rounded-md" />
                </div>
              )}

              {paymentMethod === 'hotel' && (
                <div className="flex items-center gap-4 h-full">
                  <p className="text-slate-600">Pay via cash or card upon arrival at the hotel.</p>
                </div>
              )}
            </div>
            
            {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
            <h2 className="text-xl font-bold text-[#4a1c1c] mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 border-b pb-4">
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="truncate pr-4">{i.quantity}x {i.name}</span>
                  <span>₹{i.price * i.quantity * (i.nights || 1)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-xl text-[#4a1c1c] mb-6">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button 
              onClick={processPayment} 
              disabled={isProcessing}
              className="w-full bg-[#b8860b] hover:bg-[#997300] text-white text-center font-bold py-3 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  {upiWaiting ? 'Approve on Phone...' : 'Processing...'}
                </>
              ) : (
                `Pay ₹${total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
