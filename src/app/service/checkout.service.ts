import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutForm, ViewOrder } from '../model/class/checkout';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  constructor(private http: HttpClient) {}

  getAllCheckout(): Observable<CheckoutForm[]> {
    return this.http.get<CheckoutForm[]>(
      'https://localhost:7217/api/CheckoutForm'
    );
  }

  addCheckout(checkout: CheckoutForm): Observable<CheckoutForm> {
    return this.http.post<CheckoutForm>(
      'https://localhost:7217/api/CheckoutForm',
      checkout
    );
  }

  deleteCheckout(id: number): Observable<void> {
    return this.http.delete<void>(
      `https://localhost:7217/api/CheckoutForm/${id}`
    );
  }

  getManagedOrders(): Observable<ViewOrder[]> {
    return this.http.get<ViewOrder[]>(
      'https://localhost:7217/api/CheckoutForm/managed'
    );
  }
}
