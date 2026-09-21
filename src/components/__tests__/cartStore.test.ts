import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../store/cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('adds a new item', () => {
    useCartStore.getState().addItem({
      id: 'food-1',
      kind: 'food',
      name: 'Pizza',
      price: 15,
      quantity: 1,
    });
    
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].name).toBe('Pizza');
  });

  it('merges quantities for existing items', () => {
    useCartStore.getState().addItem({
      id: 'food-1',
      kind: 'food',
      name: 'Pizza',
      price: 15,
      quantity: 1,
    });
    useCartStore.getState().addItem({
      id: 'food-1',
      kind: 'food',
      name: 'Pizza',
      price: 15,
      quantity: 2,
    });
    
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('updates quantity', () => {
    useCartStore.getState().addItem({
      id: 'food-1',
      kind: 'food',
      name: 'Pizza',
      price: 15,
      quantity: 1,
    });
    
    useCartStore.getState().updateQuantity('food-1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes item', () => {
    useCartStore.getState().addItem({
      id: 'food-1',
      kind: 'food',
      name: 'Pizza',
      price: 15,
      quantity: 1,
    });
    
    useCartStore.getState().removeItem('food-1');
    expect(useCartStore.getState().items.length).toBe(0);
  });
});
