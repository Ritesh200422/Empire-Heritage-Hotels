export interface CartItem {
  id: string;
  kind: 'room' | 'food';
  name: string;
  price: number; // per unit/night
  quantity: number; // for food: item count, for rooms: room count
  nights?: number; // only for rooms
  // Metadata for rooms
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  roomId?: string; // RoomType id
  // Metadata for food
  foodId?: string; // MenuItem id
  isVeg?: boolean;
}

export const GST_RATE_ROOM = 0.12;
export const GST_RATE_FOOD = 0.05;

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const multiplier = item.kind === 'room' && item.nights ? item.nights : 1;
    return sum + item.price * item.quantity * multiplier;
  }, 0);
}

export function calculateTaxes(items: CartItem[]): { roomTax: number; foodTax: number; totalTax: number } {
  let roomTax = 0;
  let foodTax = 0;

  items.forEach(item => {
    const multiplier = item.kind === 'room' && item.nights ? item.nights : 1;
    const itemTotal = item.price * item.quantity * multiplier;
    if (item.kind === 'room') {
      roomTax += itemTotal * GST_RATE_ROOM;
    } else if (item.kind === 'food') {
      foodTax += itemTotal * GST_RATE_FOOD;
    }
  });

  return {
    roomTax: Math.round(roomTax * 100) / 100,
    foodTax: Math.round(foodTax * 100) / 100,
    totalTax: Math.round((roomTax + foodTax) * 100) / 100,
  };
}

export function calculateTotal(items: CartItem[]): number {
  const subtotal = calculateSubtotal(items);
  const { totalTax } = calculateTaxes(items);
  return Math.round((subtotal + totalTax) * 100) / 100;
}
