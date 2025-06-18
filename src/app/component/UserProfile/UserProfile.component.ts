// import { Component, OnInit } from '@angular/core';
// import { OrderService } from '../../service/Order.service';

// @Component({
//   selector: 'app-UserProfile',
//   templateUrl: './UserProfile.component.html',
//   styleUrls: ['./UserProfile.component.css'],
// })
// export class UserProfileComponent implements OnInit {
//   userId = 'string'; // set dynamically or from auth
//   orders: any[] = [];
//   productNames: { [id: number]: string } = {};

//   constructor(private orderService: OrderService) {}

//   ngOnInit() {
//     this.orderService.getOrdersByCustomerId(this.userId).subscribe((orders) => {
//       this.orders = orders;

//       // Fetch product names
//       const productIds = new Set<number>();
//       orders.forEach((order) => {
//         order.orderDetails.forEach((item: any) =>
//           productIds.add(item.productId)
//         );
//       });

//       productIds.forEach((id) => {
//         this.orderService.getProductById(id).subscribe((product) => {
//           this.productNames[id] = product.name; // Assuming response has 'name'
//         });
//       });
//     });
//   }
// }
