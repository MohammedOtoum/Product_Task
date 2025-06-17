import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../model/class/order';
import { OrderResponse } from '../model/interface/OrderResponse';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('https://localhost:7217/api/Orders');
  }

  addOrder(order: Order): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(
      'https://localhost:7217/api/Orders',
      order
    );
  }

  deleteOrder(orderId: number): Observable<void> {
    const url = `https://localhost:7217/api/Orders/${orderId}`;
    return this.http.delete<void>(url);
  }
}
