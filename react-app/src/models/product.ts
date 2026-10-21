export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  quantity: number;
}

/** A product that has been added to the cart, tracked with its own quantity. */
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}
