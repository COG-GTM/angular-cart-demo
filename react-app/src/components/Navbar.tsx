import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const MENU = [
  { title: 'Products', to: '/' },
  { title: 'Cart', to: '/cart' },
];

export function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

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
              <li key={item.to} className={undefined}>
                <NavLink to={item.to} end className={({ isActive }) => (isActive ? 'active' : '')}>
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
