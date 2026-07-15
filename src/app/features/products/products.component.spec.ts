import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartService } from '../../core/cart.service';
import { Product } from '../../core/product.service';
import { SocketService } from '../../core/socket.service';
import { ProductsComponent } from './products.component';

class MockSocketService {
  syncUpdates = jasmine.createSpy('syncUpdates');
  unsyncUpdates = jasmine.createSpy('unsyncUpdates');
}

const PRODUCTS: Product[] = [
  {
    _id: '2',
    name: 'T Shirt',
    description: 'A comfy tee',
    price: 15,
    images: ['/assets/images/tshirt.jpg'],
    quantity: 3,
    active: true
  },
  {
    _id: '1',
    name: 'Blue Cap',
    description: 'A blue cap',
    price: 10,
    images: ['/assets/images/cap.jpg'],
    quantity: 0,
    active: true
  }
];

describe('ProductsComponent', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let component: ProductsComponent;
  let httpMock: HttpTestingController;
  let socket: MockSocketService;
  let cart: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SocketService, useClass: MockSocketService }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    socket = TestBed.inject(SocketService) as unknown as MockSocketService;
    cart = TestBed.inject(CartService);
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => httpMock.verify());

  function flushProducts(products: Product[] = PRODUCTS): void {
    fixture.detectChanges(); // triggers ngOnInit
    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(products);
  }

  it('should load products on init and live-sync the product model', () => {
    flushProducts();
    expect(component.products.length).toBe(2);
    expect(socket.syncUpdates).toHaveBeenCalledWith('product', component.products);
  });

  it('should order visible products by name and filter by search text', () => {
    flushProducts();
    expect(component.visibleProducts.map((p) => p.name)).toEqual([
      'Blue Cap',
      'T Shirt'
    ]);

    component.searchText = 'shirt';
    expect(component.visibleProducts.map((p) => p.name)).toEqual(['T Shirt']);
  });

  it('should add an in-stock product to the cart, capped at its quantity', () => {
    flushProducts();
    const tshirt = component.products.find((p) => p._id === '2')!;

    component.addToCart(tshirt);
    expect(cart.containsItem('2')).toBeTrue();
    expect(component.productInCart(tshirt)).toBeTrue();
    expect(cart.itemQuantity('2')).toBe(1);
  });

  it('should not add an out-of-stock product to the cart', () => {
    flushProducts();
    const cap = component.products.find((p) => p._id === '1')!;

    component.addToCart(cap);
    expect(cart.containsItem('1')).toBeFalse();
  });

  it('should remove a product from the cart', () => {
    flushProducts();
    const tshirt = component.products.find((p) => p._id === '2')!;

    component.addToCart(tshirt);
    component.removeFromCart(tshirt);
    expect(cart.containsItem('2')).toBeFalse();
  });

  it('should unsync the product model on destroy', () => {
    flushProducts();
    fixture.destroy();
    expect(socket.unsyncUpdates).toHaveBeenCalledWith('product');
  });
});
