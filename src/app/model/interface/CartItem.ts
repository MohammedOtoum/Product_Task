// cart-item.model.ts (optional but clean

import { Product } from '../class/product';

export interface CartItem extends Product {
  quantity: number;
}
