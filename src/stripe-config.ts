export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: string;
  currency: string;
}

export const products: Product[] = [
  {
    id: 'prod_SZsgmLb9tYCf5T',
    priceId: 'price_1ReiujHBaRE0VTJVwB223h0s',
    name: 'Jio Recharge',
    description: 'Monthly mobile recharge plan with unlimited data and calls',
    mode: 'subscription',
    price: '₹299.00',
    currency: '₹'
  }
];

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): Product | undefined {
  return products.find(product => product.priceId === priceId);
}