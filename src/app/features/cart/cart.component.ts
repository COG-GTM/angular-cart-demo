import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItem, CartService } from '../../core/cart.service';

/**
 * Shopping cart, ported from the AngularJS `CartController` + `cart.html`.
 * Lists the shared CartService items, removes items, and shows the total price.
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  private readonly cart = inject(CartService);

  readonly items = signal<CartItem[]>(this.cart.items());

  removeFromCart(item: CartItem): void {
    this.cart.removeItem(item._id);
    this.items.set(this.cart.items());
  }

  totalCartPrice(): number {
    return this.cart.totalPrice();
  }
}
