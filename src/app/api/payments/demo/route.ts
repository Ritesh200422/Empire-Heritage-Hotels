import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSubtotal, calculateTaxes, calculateTotal } from '@/lib/pricing';
import { z } from 'zod';
import { checkAvailability } from '@/lib/availability';

const PaymentSchema = z.object({
  items: z.array(z.any()),
  paymentMethod: z.string(),
  idempotencyKey: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, paymentMethod, idempotencyKey } = PaymentSchema.parse(body);
    console.log('Processing payment with idempotencyKey:', idempotencyKey);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Re-validate room availability
    const roomItems = items.filter(i => i.kind === 'room');
    for (const room of roomItems) {
      const res = await checkAvailability(room.checkIn, room.checkOut, room.guests);
      const opt = res.options.find(o => o.roomTypeId === room.roomId);
      if (!opt || opt.unitsLeft < room.quantity) {
        return NextResponse.json({ error: `Room ${room.name} is no longer available for the selected dates.` }, { status: 400 });
      }
    }

    // Server-side price calculation
    const subtotal = calculateSubtotal(items);
    const { totalTax } = calculateTaxes(items);
    const total = calculateTotal(items);

    // Idempotency check: in a real app, verify `idempotencyKey` against a store or db
    // to prevent duplicate orders.
    // For demo, we just create the order.
    
    // Create Order
    const order = await prisma.order.create({
      data: {
        items: JSON.parse(JSON.stringify(items)),
        subtotal,
        tax: totalTax,
        total,
        paymentMethod,
        status: 'completed',
      }
    });

    // Create Bookings for rooms so availability updates
    for (const room of roomItems) {
      for (let i = 0; i < room.quantity; i++) {
        await prisma.booking.create({
          data: {
            roomTypeId: room.roomId,
            checkIn: new Date(room.checkIn + 'T00:00:00Z'),
            checkOut: new Date(room.checkOut + 'T00:00:00Z'),
            status: 'confirmed',
          }
        });
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('Payment API Error:', error);
    return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 500 });
  }
}
