import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartComponent } from './cart.component';
import { CartService } from '../../core/cart.service';

describe('CartComponent', () => {
  let fixture: ComponentFixture<CartComponent>;
  let component: CartComponent;
  let cart: CartService;

  function create(): void {
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    cart = TestBed.inject(CartService);
  });

  it('should show the empty-cart message when there are no items', () => {
    create();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Your cart is currently empty..');
    expect(fixture.nativeElement.querySelector('.cart-table')).toBeNull();
  });

  it('should render a row per cart item with product, quantity and price', () => {
    cart.addItem('a1', 'Red Shirt', 10, 2);
    cart.addItem('b2', 'Blue Hat', 5, 1);
    create();

    const rows: NodeListOf<HTMLTableRowElement> =
      fixture.nativeElement.querySelectorAll('.cart-table tr');
    // header row + 2 item rows
    expect(rows.length).toBe(3);

    const body: string = fixture.nativeElement.textContent;
    expect(body).toContain('Red Shirt');
    expect(body).toContain('Blue Hat');
    expect(body).toContain('£10.00');
  });

  it('should format the total price as GBP with a £ symbol', () => {
    cart.addItem('a1', 'Red Shirt', 10, 2);
    cart.addItem('b2', 'Blue Hat', 5, 1);
    create();

    const total: HTMLElement = fixture.nativeElement.querySelector('#totalPrice');
    expect(total.textContent).toContain('£25.00');
  });

  it('should remove an item and refresh the displayed list', () => {
    cart.addItem('a1', 'Red Shirt', 10, 1);
    cart.addItem('b2', 'Blue Hat', 5, 1);
    create();

    const removeSpy = spyOn(cart, 'removeItem').and.callThrough();
    component.removeFromCart({ _id: 'a1', name: 'Red Shirt', price: 10, quantity: 1 });
    fixture.detectChanges();

    expect(removeSpy).toHaveBeenCalledWith('a1');
    expect(component.items().some((i) => i._id === 'a1')).toBe(false);
    expect(component.items().length).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('Red Shirt');
  });
});
