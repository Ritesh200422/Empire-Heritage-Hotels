import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTaxes, calculateTotal, CartItem } from '../pricing';

describe('Pricing Logic', () => {
  const mockRoom: CartItem = {
    id: '1',
    kind: 'room',
    name: 'Standard Room',
    price: 100,
    quantity: 1, // 1 room
    nights: 3,
  };

  const mockFood: CartItem = {
    id: '2',
    kind: 'food',
    name: 'Butter Chicken',
    price: 50,
    quantity: 2, // 2 plates
  };

  it('calculates subtotal correctly for rooms', () => {
    expect(calculateSubtotal([mockRoom])).toBe(300);
  });

  it('calculates subtotal correctly for food', () => {
    expect(calculateSubtotal([mockFood])).toBe(100);
  });

  it('calculates subtotal correctly for mixed cart', () => {
    expect(calculateSubtotal([mockRoom, mockFood])).toBe(400);
  });

  it('calculates taxes correctly', () => {
    const taxes = calculateTaxes([mockRoom, mockFood]);
    expect(taxes.roomTax).toBe(36); // 12% of 300
    expect(taxes.foodTax).toBe(5); // 5% of 100
    expect(taxes.totalTax).toBe(41);
  });

  it('calculates total correctly', () => {
    expect(calculateTotal([mockRoom, mockFood])).toBe(441);
  });
});
