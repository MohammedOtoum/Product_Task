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
  cardInfo?: CardInfo; // Make optional if not always required
}
