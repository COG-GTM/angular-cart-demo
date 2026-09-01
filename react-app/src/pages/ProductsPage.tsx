import { useEffect, useState } from 'react';
import type { Product } from '../models/product';
import { fetchProducts } from '../services/productService';
import { useCart } from '../cart/useCart';
import { currency } from '../utils/currency';
import { Navbar } from '../components/Navbar';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const cart = useCart();

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then(loaded => {
        if (active) {
          setProducts(loaded);
        }
      })
      .catch((error: unknown) => {
        console.error(error);
      });
    return () => {
      active = false;
    };
  }, []);

  const addToCart = (product: Product): void => {
    if (product.quantity > cart.itemQuantity(product._id)) {
      cart.addItem(product._id, product.name, product.price, 1);
    }
  };

  // AngularJS `orderBy: 'name' | filter: searchText`
  const needle = searchText.toLowerCase();
  const visible = [...products]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(product =>
      needle === ''
        ? true
        : Object.values(product).some(field => String(field).toLowerCase().includes(needle))
    );

  return (
    <>
      <Navbar />

      <div className="container">
        <div className="row">
          <form className="navbar-form navbar-left" role="search" onSubmit={event => event.preventDefault()}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search"
                name="search-text"
                id="search-text"
                value={searchText}
                onChange={event => setSearchText(event.target.value)}
              />
              <div className="input-group-btn">
                <button className="btn btn-default" type="submit">
                  <i className="glyphicon glyphicon-search"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="row">
          {visible.map(product => {
            const inCart = cart.containsItem(product._id);
            const outOfStock = product.quantity === 0;
            return (
              <div key={product._id}>
                <div
                  className={`col-xs-12 col-sm-6 col-md-4 product-box${outOfStock ? ' outOfStock' : ''}`}
                >
                  <div className="product-holder">
                    <a href={`#/products/${product._id}`}>
                      <img className="front-icon" src={product.images[0]} title={product.description} />
                      <div className="product-details links row">
                        <div className="col-xs-7 col-md-5">
                          <p id="product-name" className="pull-left">{product.name}</p>
                        </div>
                        <div className="col-xs-3 col-md-3">
                          <p id="product-price" className="pull-right">{currency(product.price)}</p>
                        </div>
                        <div className="col-xs-3 col-md-3">
                          <p id="add-button" className="button-box pull-right">
                            <button
                              className={`btn ${inCart ? 'btn-success' : 'btn-warning'}`}
                              disabled={outOfStock}
                              onClick={event => {
                                event.preventDefault();
                                addToCart(product);
                              }}
                            >
                              Add
                            </button>
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
