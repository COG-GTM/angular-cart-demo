import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../models/product';
import { CartContext } from './cartContext';
import type { CartApi } from './cartContext';

type ItemMap = Record<string, CartItem>;

/** In-memory cart mirroring the AngularJS `cartService` singleton. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [itemMap, setItemMap] = useState<ItemMap>({});

  const addItem = useCallback((id: string, name: string, price: number, quantity: number) => {
    setItemMap(current => {
      const existing = current[id];
      if (!existing) {
        return { ...current, [id]: { _id: id, name, price, quantity } };
      }
      return { ...current, [id]: { ...existing, quantity: existing.quantity + 1 } };
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItemMap(current => {
      const existing = current[id];
      if (!existing) {
        return current;
      }
      if (existing.quantity > 1) {
        return { ...current, [id]: { ...existing, quantity: existing.quantity - 1 } };
      }
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  return (
    <CartContext.Provider value={useMemo<CartApi>(() => {
      const items = Object.values(itemMap);
      return {
        items,
        addItem,
        removeItem,
        containsItem: id => id in itemMap,
        itemQuantity: id => itemMap[id]?.quantity ?? 0,
        totalItems: () => items.reduce((total, item) => total + item.quantity, 0),
        totalPrice: () => items.reduce((total, item) => total + item.quantity * item.price, 0),
      };
    }, [itemMap, addItem, removeItem])}>
      {children}
    </CartContext.Provider>
  );
}
