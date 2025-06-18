import { Routes } from '@angular/router';
import { LoginPageComponent } from './component/loginPage/loginPage.component';
import { ProductMangeComponent } from './component/ProductMange/ProductMange.component';
import { SignUpComponent } from './component/signUp/signUp.component';
import { UserProductsComponent } from './component/UserProducts/UserProducts.component';
import { CartComponent } from './component/cart/cart.component';
import { DashboardComponent } from './component/Dashboard/Dashboard.component';
import { ViewOrdersComponent } from './component/ViewOrders/ViewOrders.component';
import { ManageUsersComponent } from './component/ManageUsers/ManageUsers.component';
// import { UserProfileComponent } from './component/UserProfile/UserProfile.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'product',
    component: ProductMangeComponent,
  },
  {
    path: 'signup',
    component: SignUpComponent,
  },
  {
    path: 'userProducts',
    component: UserProductsComponent,
  },
  {
    path: 'cart/:ids',
    component: CartComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'viewOrder',
    component: ViewOrdersComponent,
  },
  {
    path: 'manageUser',
    component: ManageUsersComponent,
  },
  // {
  //   path: 'userProfile',
  //   component: UserProfileComponent,
  // },
];
