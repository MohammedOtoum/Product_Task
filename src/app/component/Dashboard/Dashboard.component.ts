import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../service/Order.service';
import { Order } from '../../model/class/order';
import { ProductService } from '../../service/product.service';
import { Product } from '../../model/class/product';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-Dashboard',
  imports: [TranslateModule, CommonModule, FormsModule],
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  ElectronicList: Product[] = [];
  HomeList: Product[] = [];
  ClothingList: Product[] = [];
  BeautyList: Product[] = [];
  DigitalList: Product[] = [];

  chart!: Chart<'bar', number[], string>;

  orderCount: number = 0;
  productCount: number = 0;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.getCountofOrder();
    this.getCountOfProducts();

    this.loadAllCategories();
  }

  async loadAllCategories() {
    await this.getProductsByCategory(1, this.ElectronicList);
    await this.getProductsByCategory(2, this.HomeList);
    await this.getProductsByCategory(3, this.ClothingList);
    await this.getProductsByCategory(4, this.BeautyList);
    await this.getProductsByCategory(5, this.DigitalList);

    this.initChart();
  }

  initChart() {
    const config: ChartConfiguration<'bar', number[], string> = {
      type: 'bar',
      data: {
        labels: [
          'Electronics',
          'Home & Kitchen',
          'Clothing',
          'Beauty & Personal Care',
          'Digital Products',
        ],
        datasets: [
          {
            label: 'Number of Products',
            data: [
              this.ElectronicList.length,
              this.HomeList.length,
              this.ClothingList.length,
              this.BeautyList.length,
              this.DigitalList.length,
            ],
            backgroundColor: ['red', 'green', 'blue', 'orange', 'purple'],
          },
        ],
      },
      options: {
        aspectRatio: 1,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    this.chart = new Chart('MyChart', config);
  }

  getCountofOrder() {
    this.orderService.getAllOrders().subscribe((res: Order[]) => {
      this.orderCount = res.length;
    });
  }

  getCountOfProducts() {
    this.productService.getAllProducts().subscribe((res: Product[]) => {
      this.productCount = res.length;
    });
  }

  getProductsByCategory(
    categoryId: number,
    productList: Product[]
  ): Promise<void> {
    return new Promise((resolve) => {
      this.productService.getProductByCategoryId(categoryId).subscribe({
        next: (products: Product[]) => {
          productList.length = 0;
          if (products && products.length > 0) {
            productList.push(...products);
          }
          resolve();
        },
        error: (err) => {
          console.error('Error loading products:', err);
          productList.length = 0;
          resolve();
        },
      });
    });
  }
  currentLang: string = 'en';

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}
