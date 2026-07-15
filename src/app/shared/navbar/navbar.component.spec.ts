import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts collapsed', () => {
    expect(component.isCollapsed).toBe(true);
  });

  it('toggles the collapse state', () => {
    component.toggleCollapsed();
    expect(component.isCollapsed).toBe(false);
    component.toggleCollapsed();
    expect(component.isCollapsed).toBe(true);
  });

  it('exposes Products and Cart menu items', () => {
    expect(component.menu).toEqual([
      { title: 'Products', link: '/' },
      { title: 'Cart', link: '/cart' }
    ]);
  });

  it('renders the brand text', () => {
    const brand = (fixture.nativeElement as HTMLElement).querySelector('.navbar-brand');
    expect(brand?.textContent?.trim()).toBe('angular-clothes-shop');
  });

  it('renders a nav link per menu item', () => {
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.navbar-nav li a');
    expect(links.length).toBe(2);
    expect(links[0].textContent?.trim()).toBe('Products');
    expect(links[1].textContent?.trim()).toBe('Cart');
  });

  it('toggles collapse when the toggle button is clicked', () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.navbar-toggle'
    ) as HTMLButtonElement;
    button.click();
    expect(component.isCollapsed).toBe(false);
  });
});
