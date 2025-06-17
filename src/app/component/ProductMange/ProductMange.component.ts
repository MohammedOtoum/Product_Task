import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../service/product.service';
import { Product } from '../../model/class/product';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AddDialog } from '../add-dialog/add-dialog';
import { Update_dialogComponent } from '../update_dialog/update_dialog.component';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  standalone: true,
  selector: 'app-ProductMange',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './ProductMange.component.html',
  styleUrls: ['./ProductMange.component.css'],
})
export class ProductMangeComponent implements OnInit {
  productService = inject(ProductService);
  private router: Router = new Router();
  productObj: Product = new Product();
  productList: Product[] = [];
  imageUrls: { [key: number]: string } = {};
  readonly add_Dialog = inject(MatDialog);
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pagedProducts: Product[] = [];
  Math = Math;
  selectedCategoryId?: number;
  currentLang = 'en';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
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
  openDialog(): void {
    this.add_Dialog.open(AddDialog, {
      width: '80%',
      height: '500px',
    });
    this.add_Dialog.afterAllClosed.subscribe(() => {
      this.getAllProducts();
    });
  }

  openUpdateDialog(data: number): void {
    this.add_Dialog.open(Update_dialogComponent, {
      width: '80%',
      height: '500px',
      data: data,
    });
    this.add_Dialog.afterAllClosed.subscribe(() => {
      this.getAllProducts();
    });
  }
  // 1. getAllProducts stays same
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

  // 2. updatePagedProducts stays the same
  updatePagedProducts(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedProducts = this.productList.slice(start, end);
  }

  // 3. changePage stays the same
  changePage(page: number): void {
    this.currentPage = page;
    this.updatePagedProducts();
  }

  // 4. Now update the other methods to update productList & reset page:

  OnDelete(Id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteProduct(Id); // run your delete logic here
        this.getAllProducts();
        Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
      }
    });
  }

  deleteProduct(Id: number) {
    this.productService.deleteProduct(Id).subscribe((res: string) => {
      // alert('Delete success');
      this.getAllProducts();
    });
  }

  filterProducts(categoryId?: number, name?: string, sortOrder?: string) {
    if (name && categoryId && sortOrder) {
      this.productService
        .getSortedProductsByCategoryIdWithName(name, categoryId, sortOrder)
        .subscribe((res: Product[]) => {
          this.productList = res;
          this.currentPage = 1;
          this.updatePagedProducts();
        });
    } else if (categoryId && sortOrder) {
      this.productService
        .getSortedProductsByCategoryId(categoryId, sortOrder)
        .subscribe((res: Product[]) => {
          this.productList = res;
          this.currentPage = 1;
          this.updatePagedProducts();
        });
    } else if (name && sortOrder) {
      this.productService
        .getSortedSearch(name, sortOrder)
        .subscribe((res: Product[]) => {
          this.productList = res;
          this.currentPage = 1;
          this.updatePagedProducts();
        });
    } else if (categoryId && name) {
      this.productService
        .getSortedProductsByCategoryIdWithName(name, categoryId, 'asc') // default sort
        .subscribe((res: Product[]) => {
          this.productList = res;
          this.currentPage = 1;
          this.updatePagedProducts();
        });
    } else if (categoryId) {
      this.productService
        .getProductByCategoryId(categoryId)
        .subscribe((res: Product[]) => {
          this.productList = res;
          this.currentPage = 1;
          this.updatePagedProducts();
        });
    } else if (name) {
      this.productService.getSearch(name).subscribe((res: Product[]) => {
        this.productList = res;
        this.currentPage = 1;
        this.updatePagedProducts();
      });
    } else if (sortOrder) {
      this.productService
        .getSortedProduct(sortOrder)
        .subscribe((res: Product[]) => {
          this.productList = res;
          this.currentPage = 1;
          this.updatePagedProducts();
        });
    } else {
      this.productService.getAllProducts().subscribe((res: Product[]) => {
        this.productList = res;
        this.currentPage = 1;
        this.updatePagedProducts();
      });
    }
  }

  filename = 'ExcelSheet.xlsx';
  exportExcel() {
    let data = document.getElementById('data-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, this.filename);
  }
  // exportPdf() {
  //   const doc = new jsPDF();
  //   autoTable(doc, { html: '#data-table' });
  //   doc.save('table.pdf');
  // }
  exportPdf() {
    const doc = new jsPDF();
    const columns = ['#', 'Category', 'Name', 'Price', 'Description', 'Image'];
    const rows: any[] = [];
    const imageMap: { [key: number]: string } = {};
    const imgWidth = 10;
    const imgHeight = 10;

    const imageLoadPromises = this.pagedProducts.map((product, index) => {
      const imageUrl = this.imageUrls[product.id];

      return new Promise<void>((resolve) => {
        if (imageUrl) {
          fetch(imageUrl)
            .then((res) => res.blob())
            .then((blob) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                imageMap[product.id] = reader.result as string;
                rows.push([
                  index + 1,
                  product.categoryName,
                  product.name,
                  product.price,
                  product.description,
                  '', // Placeholder for image
                ]);
                resolve();
              };
              reader.readAsDataURL(blob);
            });
        } else {
          rows.push([
            index + 1,
            product.categoryName,
            product.name,
            product.price,
            product.description,
            'No Image',
          ]);
          resolve();
        }
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 20,
        styles: {
          fontSize: 10,
          cellPadding: 4,
          overflow: 'linebreak',
          valign: 'middle',
        },
        columnStyles: {
          5: { cellWidth: imgWidth + 10 },
        },
        didDrawCell: (data) => {
          if (data.column.index === 5 && data.section === 'body') {
            const rowIndex = data.row.index;
            const product = this.pagedProducts[rowIndex];
            const imgData = imageMap[product.id];

            if (imgData) {
              const x = data.cell.x + (data.cell.width - imgWidth) / 2;
              const y = data.cell.y + (data.cell.height - imgHeight) / 2;
              doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
            }
          }
        },
        didParseCell: (data) => {
          if (data.column.index === 5 && data.section === 'body') {
            data.cell.height = imgHeight + 10;
          }
        },
      });

      doc.save('products-with-images.pdf');
    });
  }
  Logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
