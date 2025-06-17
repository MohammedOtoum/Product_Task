import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { Product } from '../../model/class/product';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../service/userService.service';
import { UserRefreshResponse } from '../../model/interface/UserRefreshResponse';
import { User } from '../../model/class/Users';
import { GetUser } from '../../model/class/getUser';

@Component({
  selector: 'app-user-products',
  imports: [FormsModule, CommonModule, RouterLink, TranslateModule],
  templateUrl: './UserProducts.component.html',
  styleUrls: ['./UserProducts.component.css'],
})
export class UserProductsComponent implements OnInit {
  productList: Product[] = [];
  pagedProducts: Product[] = [];
  imageUrls: { [key: number]: string } = {};
  currentPage: number = 1;
  itemsPerPage: number = 6;
  Math = Math;
  SelectedProductList: number[] = [];

  selectedCategoryId?: number;
  currentLang = 'en';

  constructor(
    private router: Router,
    private productService: ProductService,
    private translate: TranslateService,
    private userService: UserService
  ) {
    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);
  }

  ngOnInit(): void {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.getUserbyToken();
    this.getAllProducts();
  }

  getToken(): string | null {
    const itemStr = localStorage.getItem('token');
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      const now = new Date();
      if (now.getTime() > item.expiry) {
        localStorage.removeItem('token');
        return null;
      }
      return item.value;
    } catch (e) {
      localStorage.removeItem('token');
      return null;
    }
  }

  getAllProducts(): void {
    this.productService.getAllProducts().subscribe((res: Product[]) => {
      this.productList = res;
      this.updatePagedProducts();

      this.productList.forEach((product) => {
        this.productService.getImageById(product.id).subscribe((blob) => {
          this.imageUrls[product.id] = URL.createObjectURL(blob);
        });
      });
    });
  }

  filterProducts(categoryId?: number, name?: string, sortOrder?: string): void {
    if (name && categoryId && sortOrder) {
      this.productService
        .getSortedProductsByCategoryIdWithName(name, categoryId, sortOrder)
        .subscribe(this.setFilteredProducts);
    } else if (categoryId && sortOrder) {
      this.productService
        .getSortedProductsByCategoryId(categoryId, sortOrder)
        .subscribe(this.setFilteredProducts);
    } else if (name && sortOrder) {
      this.productService
        .getSortedSearch(name, sortOrder)
        .subscribe(this.setFilteredProducts);
    } else if (categoryId && name) {
      this.productService
        .getSortedProductsByCategoryIdWithName(name, categoryId, 'asc')
        .subscribe(this.setFilteredProducts);
    } else if (categoryId) {
      this.productService
        .getProductByCategoryId(categoryId)
        .subscribe(this.setFilteredProducts);
    } else if (name) {
      this.productService.getSearch(name).subscribe(this.setFilteredProducts);
    } else if (sortOrder) {
      this.productService
        .getSortedProduct(sortOrder)
        .subscribe(this.setFilteredProducts);
    } else {
      this.getAllProducts();
    }
  }

  private setFilteredProducts = (res: Product[]): void => {
    this.productList = res;
    this.currentPage = 1;
    this.updatePagedProducts();

    this.productList.forEach((product) => {
      this.productService.getImageById(product.id).subscribe((blob) => {
        this.imageUrls[product.id] = URL.createObjectURL(blob);
      });
    });
  };

  updatePagedProducts(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedProducts = this.productList.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePagedProducts();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
  addCart(Id: number) {
    this.SelectedProductList.push(Id);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  userId: string = '';
  fullName: string = '';
  getUserbyToken() {
    this.userService.refreshToken().subscribe({
      next: (res: UserRefreshResponse) => {
        this.userId = res.userId;
        this.userService
          .getUserbyId(Number(this.userId))
          .subscribe((res: GetUser) => {
            this.fullName =
              res.firstName.toUpperCase() + ' ' + res.lastName.toUpperCase();
          });
      },
      error: (err) => {
        console.error('Token refresh failed:', err);
        alert('Authentication failed. Please login again.');
      },
    });
  }
}
