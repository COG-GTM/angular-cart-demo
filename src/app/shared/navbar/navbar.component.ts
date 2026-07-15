import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

interface NavMenuItem {
  title: string;
  link: string;
}

/**
 * Top navigation bar. Ported from the AngularJS `navbar` directive
 * (client/components/navbar/*). Uses Angular router links and ng-bootstrap
 * NgbCollapse for the responsive menu toggle.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgbCollapse],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly menu: NavMenuItem[] = [
    { title: 'Products', link: '/' },
    { title: 'Cart', link: '/cart' }
  ];

  isCollapsed = true;

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
