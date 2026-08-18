import type { Product } from '../models/product';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE}/api/products`);
  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.status}`);
  }
  return (await response.json()) as Product[];
}
