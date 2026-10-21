import { useContext } from 'react';
import { CartContext } from './cartContext';
import type { CartApi } from './cartContext';

export function useCart(): CartApi {
  const cart = useContext(CartContext);
  if (!cart) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return cart;
}
