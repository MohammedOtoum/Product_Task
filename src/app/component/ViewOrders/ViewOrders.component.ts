import { Component, OnInit } from '@angular/core';
import { CheckoutService } from '../../service/checkout.service';
import { ViewOrder } from '../../model/class/checkout';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../service/Order.service';

@Component({
  selector: 'app-ViewOrders',
  imports: [CommonModule],
  templateUrl: './ViewOrders.component.html',
  styleUrls: ['./ViewOrders.component.css'],
})
export class ViewOrdersComponent implements OnInit {
  orders: ViewOrder[] = [];

  constructor(
    private checkoutService: CheckoutService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.getAllOrderManaged();
  }

  getAllOrderManaged() {
    this.checkoutService.getManagedOrders().subscribe({
      next: (orders) => {
        this.orders = orders; // assuming you have an orders property in your component
        console.log('Orders loaded:', orders);
      },
      error: (error) => {
        console.error('Failed to load orders:', error);
      },
    });
  }
  DeleteOrder(id: number, orderId: number) {
    console.log('Deleting order with id:', id);
    if (id == null) {
      console.error('Invalid id provided!');
      return;
    }
    this.checkoutService.deleteCheckout(id).subscribe({
      next: () => {
        console.log('Order deleted successfully');
        this.getAllOrderManaged();
        this.orderService.deleteOrder(orderId).subscribe({
          next: () => {
            // On success, remove the order from local list or refresh orders
            this.orders = this.orders.filter(
              (order) => order.checkoutFormId !== id
            );
            console.log(`Order with id ${id} deleted.`);
          },
          error: (err) => {
            console.error('Delete failed', err);
          },
        });
      },
      error: (error) => {
        console.error('Error deleting order:', error);
      },
    });
  }
}
