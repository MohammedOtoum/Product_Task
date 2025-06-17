import { OrderDetail } from './OrderDetail';

export class Order {
  id: number = 0;
  orderDate: string = new Date().toISOString();
  customerId: string = '';
  orderDetails: OrderDetail[] = [];
}
