import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintButton from './PrintButton';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    notFound();
  }

  const items = order.items as any[];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-[#4a1c1c] mb-2">Demo Payment Successful!</h1>
        <p className="text-slate-600 mb-8">Thank you for your order. Your reservation and/or food order has been confirmed.</p>
        
        <div className="bg-slate-50 p-6 rounded-xl text-left border border-slate-100 mb-8">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <p className="text-sm text-slate-500">Order ID</p>
              <p className="font-mono font-bold text-slate-800">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-[#4a1c1c] border-b pb-2">Order Items</h3>
            {items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-bold">{item.quantity}x {item.name}</p>
                  {item.kind === 'room' && (
                    <p className="text-slate-500 text-xs">{item.checkIn} to {item.checkOut}</p>
                  )}
                </div>
                <p>₹{item.price * item.quantity * (item.nights || 1)}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm text-slate-600 text-right">
            <p>Subtotal: ₹{order.subtotal.toFixed(2)}</p>
            <p>Tax: ₹{order.tax.toFixed(2)}</p>
            <p className="font-bold text-lg text-[#4a1c1c] mt-2 pt-2 border-t">Total: ₹{order.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 print:hidden">
          <Link href="/" className="bg-[#4a1c1c] text-white px-6 py-2 rounded-md hover:bg-[#602323]">Return Home</Link>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
