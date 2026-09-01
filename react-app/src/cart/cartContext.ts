import { createContext } from 'react';
import type { CartItem } from '../models/product';

export interface CartApi {
  items: CartItem[];
  addItem: (id: string, name: string, price: number, quantity: number) => void;
  removeItem: (id: string) => void;
  containsItem: (id: string) => boolean;
  itemQuantity: (id: string) => number;
  totalItems: () => number;
  totalPrice: () => number;
}

export const CartContext = createContext<CartApi | null>(null);
