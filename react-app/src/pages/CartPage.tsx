import { useCart } from '../cart/useCart';
import { currency } from '../utils/currency';
import { Navbar } from '../components/Navbar';

export function CartPage() {
  const cart = useCart();
  const isEmpty = cart.items.length < 1;

  return (
    <>
      <Navbar />

      <div className="container">
        {isEmpty && <div>Your cart is currently empty..</div>}
        <div className="cart-products-box">
          <table className="cart-table">
            <tbody>
              {!isEmpty && (
                <tr>
                  <th style={{ width: '25%' }}>Product</th>
                  <th style={{ width: '25%' }}>Quantity</th>
                  <th style={{ width: '25%' }}>Price</th>
                  <th style={{ width: '25%' }}>Action</th>
                </tr>
              )}
              {cart.items.map(item => (
                <tr key={item._id}>
                  <td>
                    <a className="links" href={`/#/products/${item._id}`}>{item.name}</a>
                  </td>
                  <td className="cart-table-qty">{item.quantity}</td>
                  <td>{currency(item.price)}</td>
                  <td>
                    <button onClick={() => cart.removeItem(item._id)} className="btn btn-primary">
                      Remove from cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isEmpty && (
            <div id="totalPrice" className="orange"><b>Total: {currency(cart.totalPrice())}</b></div>
          )}
        </div>
      </div>
    </>
  );
}
