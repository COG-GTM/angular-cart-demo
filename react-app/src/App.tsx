import { Navigate, Route, Routes } from 'react-router-dom';
import { CartProvider } from './cart/CartProvider';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';

export function App() {
  return (
    <CartProvider>
      <div>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </CartProvider>
  );
}
