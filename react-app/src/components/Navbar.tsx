import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MENU = [
  { title: 'Products', to: '/' },
  { title: 'Cart', to: '/cart' },
];

export function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { pathname } = useLocation();

  return (
    <div className="navbar navbar-default navbar-static-top">
      <div className="container">
        <div className="navbar-header">
          <button
            className="navbar-toggle"
            type="button"
            onClick={() => setIsCollapsed(collapsed => !collapsed)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link to="/" className="navbar-brand">angular-clothes-shop</Link>
        </div>
        <div className={`navbar-collapse collapse${isCollapsed ? '' : ' in'}`} id="navbar-main">
          <ul className="nav navbar-nav">
            {MENU.map(item => (
              <li key={item.to} className={pathname === item.to ? 'active' : undefined}>
                <Link to={item.to}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
