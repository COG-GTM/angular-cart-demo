import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CartService } from '../../core/cart.service';
import { Product, ProductService } from '../../core/product.service';
import { SocketService } from '../../core/socket.service';

/**
 * Product grid, ported from the AngularJS `ProductsController` + `products.html`.
 * Loads products, live-syncs the `'product'` model over the socket, and lets the
 * user add/remove items via the shared {@link CartService}.
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly socket = inject(SocketService);
  private readonly cart = inject(CartService);

  products: Product[] = [];
  searchText = '';

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products) => {
      this.products = products;
      this.socket.syncUpdates('product', this.products);
    });
  }

  ngOnDestroy(): void {
    this.socket.unsyncUpdates('product');
  }

  /** Products filtered by the search box and ordered by name (ported pipes). */
  get visibleProducts(): Product[] {
    const search = this.searchText.trim().toLowerCase();
    return this.products
      .filter((product) => this.matchesSearch(product, search))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  addToCart(product: Product): void {
    if (product.quantity > this.cart.itemQuantity(product._id)) {
      this.cart.addItem(product._id, product.name, product.price, 1);
    }
  }

  removeFromCart(product: Product): void {
    this.cart.removeItem(product._id);
  }

  productInCart(product: Product): boolean {
    return this.cart.containsItem(product._id);
  }

  private matchesSearch(product: Product, search: string): boolean {
    if (!search) {
      return true;
    }
    return [product.name, product.description, String(product.price)].some(
      (field) => field.toLowerCase().includes(search)
    );
  }
}
