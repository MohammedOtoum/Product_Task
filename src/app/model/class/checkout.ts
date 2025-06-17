export interface CardInfo {
  cardHolderName: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
}

export interface CheckoutForm {
  fullName: string;
  phoneNumber: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address1: string;
  address2?: string;
  postalCode?: string;
  notes?: string;
  paymentMethod: string;
  orderId: number;
  cardInfo?: CardInfo; // Make optional if not always required
}

export class OrderDetailDto {
  productId: number = 0;
  quantity: number = 0;
  unitPrice: number = 0;
}

export class OrderDto {
  id: number = 0;
  orderDate: string = '';
  customerId: string = '';
  orderDetails: OrderDetailDto[] = [new OrderDetailDto()];
}

export class ViewOrder {
  checkoutFormId: number = 0;
  orderId: number = 0;
  orderDto: OrderDto = new OrderDto();
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  customerLocation: string = '';
  price: number = 0;
  paymentMethod: string = '';
}
