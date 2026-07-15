import { Injectable } from '@angular/core';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * In-memory shopping cart, ported from the AngularJS `cartService`.
 * Shared across the Products and Cart features.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private _items: { [id: string]: CartItem } = {};

  addItem(id: string, name: string, price: number, quantity: number): void {
    if (!this.containsItem(id)) {
      this._items[id] = { _id: id, name, price, quantity };
    } else {
      this._items[id].quantity += 1;
    }
  }

  removeItem(id: string): boolean {
    if (this.containsItem(id)) {
      if (this._items[id].quantity > 1) {
        this._items[id].quantity--;
      } else {
        delete this._items[id];
      }
      return true;
    }
    return false;
  }

  containsItem(id: string): boolean {
    return id in this._items;
  }

  totalItems(): number {
    return Object.values(this._items).reduce((total, item) => total + item.quantity, 0);
  }

  itemQuantity(id: string): number {
    return this.containsItem(id) ? this._items[id].quantity : 0;
  }

  /** Returns the cart contents as an array (matches AngularJS `items()`). */
  items(): CartItem[] {
    return Object.values(this._items);
  }

  totalPrice(): number {
    return Object.values(this._items).reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  }
}
