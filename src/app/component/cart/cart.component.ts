import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { Product } from '../../model/class/product';
import { CartItem } from '../../model/interface/CartItem';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { OrderService } from '../../service/Order.service';
import { Order } from '../../model/class/order';
import { UserService } from '../../service/userService.service';
import { UserRefreshResponse } from '../../model/interface/UserRefreshResponse';
import { OrderDetail } from '../../model/class/OrderDetail';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CheckoutForm } from '../../model/interface/checkout';
import { PaymentMethod } from '../../model/enum/PaymentMethod.enum';
import { CheckoutService } from '../../service/checkout.service';
import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

(jsPDF as any).API.events.push([
  'addFonts',
  () => {
    (jsPDF as any).API.addFileToVFS('Amiri-Regular.ttf', ``); // ← Base64 هنا
    (jsPDF as any).API.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  },
]);

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
  }
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  currentLang = 'en';
  productList: CartItem[] = [];
  imageUrls: { [key: number]: string } = {};

  orderObj: Order = new Order();
  orderDetailObj: OrderDetail[] = [];
  submitted = false;
  checkoutForm = {
    fullName: '',
    phoneNumber: '',
    email: '',
    country: '',
    state: '',
    city: '',
    address1: '',
    address2: '',
    postalCode: '',
    notes: '',
    paymentMethod: '',
    orderId: 0,
    cardInfo: {
      cardHolderName: '',
      cardNumber: '',
      expirationDate: '',
      cvv: '',
    },
  };

  paymentMethods = Object.values(PaymentMethod);
  selectedPayment: PaymentMethod | '' = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private orderService: OrderService,
    private userService: UserService,
    private translate: TranslateService,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit() {
    const idsParam = this.route.snapshot.paramMap.get('ids');
    const ids = idsParam ? idsParam.split(',').map(Number) : [];

    ids.forEach((id) => this.loadProduct(id));
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe((res: Product) => {
      const item: CartItem = { ...res, quantity: 1 };
      this.productList.push(item);

      this.productService.getImageById(res.id).subscribe((blob) => {
        this.imageUrls[res.id] = URL.createObjectURL(blob);
      });
    });
  }

  increaseQuantity(product: CartItem) {
    product.quantity++;
  }

  decreaseQuantity(product: CartItem) {
    if (product.quantity > 1) {
      product.quantity--;
    }
  }

  removeFromCart(product: CartItem) {
    this.productList = this.productList.filter((p) => p.id !== product.id);
  }

  isCardPayment(): boolean {
    return this.checkoutForm.paymentMethod === PaymentMethod.Card;
  }

  validateCheckoutForm(): boolean {
    const {
      fullName,
      phoneNumber,
      email,
      country,
      state,
      city,
      address1,
      paymentMethod,
    } = this.checkoutForm;

    // Basic required fields check
    if (
      !fullName ||
      !phoneNumber ||
      !email ||
      !country ||
      !state ||
      !city ||
      !address1 ||
      !paymentMethod
    ) {
      return false;
    }

    // Validate card info only if card payment
    if (this.isCardPayment()) {
      const card = this.checkoutForm.cardInfo;
      if (
        !card ||
        !card.cardHolderName ||
        !card.cardNumber ||
        !card.expirationDate ||
        !card.cvv
      ) {
        return false;
      }
    }

    return true;
  }

  proceedToPayment() {
    if (!this.validateCheckoutForm()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Prepare order details
    this.orderDetailObj = this.productList.map((product) => ({
      productId: product.id,
      quantity: product.quantity,
      unitPrice: product.price,
    }));

    this.orderObj.orderDetails = this.orderDetailObj;

    this.userService.refreshToken().subscribe({
      next: (res: UserRefreshResponse) => {
        this.orderObj.customerId = res.userId;
        this.orderService.addOrder(this.orderObj).subscribe({
          next: (response) => {
            this.checkoutForm.orderId = response.orderId;
            this.checkoutService.addCheckout(this.checkoutForm).subscribe({
              next: (res: CheckoutForm) => {
                alert('Order created: ' + response.message);

                this.generateInvoicePdf();
              },
              error: (err) => {
                console.error('Checkout saving error:', err);
                alert('Failed to save checkout details.');
              },
            });
          },
          error: (err) => {
            console.error('Order creation failed:', err);
            alert('Failed to create order.');
          },
        });
      },
      error: (err) => {
        console.error('Token refresh failed:', err);
        alert('Authentication failed. Please login again.');
      },
    });
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  reverseArabic(text: string): string {
    return text.split('').reverse().join('');
  }

  // Helper to format currency
  currencyFormat(value: number): string {
    return new Intl.NumberFormat(this.currentLang, {
      style: 'currency',
      currency: 'JOD',
    }).format(value);
  }
  previewOnly: boolean = true;
  generateInvoicePdf(previewOnly = true): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const isArabic = this.currentLang === 'ar';
    const alignRight = isArabic ? 'right' : 'left';
    const alignLeft = isArabic ? 'left' : 'right';

    // Add Amiri font for Arabic
    if (isArabic) {
      doc.addFileToVFS('Amiri-Regular.ttf', 'BASE64_HERE'); // Replace BASE64_HERE with actual Base64
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.setFont('Amiri');
    } else {
      doc.setFont('helvetica');
    }

    const reverseArabic = (text: string) =>
      isArabic ? text.split('').reverse().join('') : text;

    const t = (key: string) => reverseArabic(this.translate.instant(key));

    const invoiceId = 'INV-' + new Date().getTime();
    const invoiceDate = new Date().toLocaleDateString(
      isArabic ? 'ar-JO' : 'en-US'
    );

    // Title
    doc.setFontSize(18);
    doc.text(t('INVOICE'), 105, 20, { align: 'center' });

    // Company Info
    doc.setFontSize(10);
    const companyInfo = [
      'Company Name',
      'Phone: +962-000-0000',
      'Email: support@company.com',
      'Website: www.company.com',
      'Address: Amman, Jordan',
    ].map((line) => t(line));

    companyInfo.forEach((line, i) => {
      doc.text(line, 10, 50 + i * 6, { align: 'left' });
    });

    // Customer Info
    const checkout = this.checkoutForm;
    const customerInfo = [
      t('BILL_TO') + ':',
      checkout.fullName,
      `${checkout.address1}, ${checkout.city}, ${checkout.country}`,
      t('Phone') + ': ' + checkout.phoneNumber,
      t('Email') + ': ' + checkout.email,
      t('Order Id') + ': ' + checkout.orderId,
    ].map((line) => t(line));

    customerInfo.forEach((line, i) => {
      doc.text(line, isArabic ? 200 : 130, 50 + i * 6, { align: alignRight });
    });

    // Invoice metadata
    doc.text(t('INVOICE_NO') + ': ' + invoiceId, 10, 80);
    doc.text(t('DATE') + ': ' + invoiceDate, 10, 85);
    doc.text(t('PAYMENT_METHOD') + ': ' + t(checkout.paymentMethod), 10, 90);

    // Table
    const rows = this.productList.map((p) => [
      t(p.name),
      p.quantity.toString(),
      this.currencyFormat(p.price),
      this.currencyFormat(p.price * p.quantity),
    ]);

    autoTable(doc, {
      startY: 100,
      head: [[t('PRODUCT'), t('QTY'), t('UNIT_PRICE'), t('TOTAL')]],
      body: rows,
      theme: 'striped',
      styles: { font: isArabic ? 'Amiri' : 'helvetica' },
      headStyles: { halign: isArabic ? 'right' : 'left' },
      bodyStyles: { halign: isArabic ? 'right' : 'left' },
    });

    // Totals
    const subtotal = this.productList.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const tax = subtotal * 0.07;
    const shipping = 5;
    const grandTotal = subtotal + tax + shipping;

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    const summaryY = finalY + 10;

    doc.setFontSize(10);
    doc.text(t('SUBTOTAL'), 125, summaryY, { align: alignRight });
    doc.text(this.currencyFormat(subtotal), 180, summaryY, { align: 'right' });

    doc.text(t('TAX'), 125, summaryY + 6, { align: alignRight });
    doc.text(this.currencyFormat(tax), 180, summaryY + 6, { align: 'right' });

    doc.text(t('SHIPPING'), 125, summaryY + 12, { align: alignRight });
    doc.text(this.currencyFormat(shipping), 180, summaryY + 12, {
      align: 'right',
    });

    doc.setFontSize(12);
    doc.text(t('TOTAL'), 125, summaryY + 20, { align: alignRight });
    doc.text(this.currencyFormat(grandTotal), 180, summaryY + 20, {
      align: 'right',
    });

    // Footer
    doc.setFontSize(10);
    doc.text(t('THANK_YOU'), 105, 280, { align: 'center' });
    doc.text(t('RETURN_POLICY'), 10, 290, { align: 'left' });

    // ✅ PREVIEW: Open in new tab using blob
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');

    // ✅ DOWNLOAD if not previewOnly
    if (!previewOnly) {
      doc.save(invoiceId + '.pdf');
    }
  }

  isInvalid(control: NgModel | null | undefined): boolean {
    return Boolean(control?.invalid) && (control?.touched || this.submitted);
  }

  onSubmit(form: NgForm) {
    this.submitted = true;

    if (form.invalid) {
      console.log('Form is invalid');
      return;
    }

    console.log('Form Submitted Successfully:', this.checkoutForm);
  }

  cardNumberInvalid = false;
  expirationDateInvalid = false;

  validateCardNumber(): void {
    const cardNumber = this.checkoutForm.cardInfo.cardNumber;

    // Basic Luhn check or custom validation here
    const isValid = this.luhnCheck(cardNumber);

    if (!isValid) {
      alert('Invalid card number');
    }
  }

  luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    // Luhn algorithm
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = +cardNumber[i];

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  validateExpirationDate(): void {
    const value = this.checkoutForm.cardInfo.expirationDate;
    const match = value?.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);
    if (!match) {
      this.expirationDateInvalid = true;
      return;
    }

    const [_, mm, yyyy] = match;
    const now = new Date();
    const exp = new Date(parseInt(yyyy), parseInt(mm));
    this.expirationDateInvalid = exp <= now;
  }
  formattedCardNumber = '';

  onCardNumberChange(value: string): void {
    // Remove all non-digit characters
    const rawValue = value.replace(/\D/g, '');

    // Limit to 16 digits
    const trimmed = rawValue.substring(0, 16);

    // Format with space every 4 digits
    this.formattedCardNumber = trimmed.replace(/(\d{4})(?=\d)/g, '$1 ');

    // Update the raw value in the model
    this.checkoutForm.cardInfo.cardNumber = trimmed;
  }
}
