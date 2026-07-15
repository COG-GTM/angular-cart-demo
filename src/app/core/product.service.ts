import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * A product as returned by the Express/Mongo backend (`GET /api/products`).
 * Ported from the AngularJS clothes-shop data model.
 */
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  quantity: number;
  active: boolean;
}

/**
 * Loads products from the backend REST API.
 * Ports the `$http.get('/api/products')` call from `ProductsController`.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }
}
