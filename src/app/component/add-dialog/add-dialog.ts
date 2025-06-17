import { Component, inject } from '@angular/core';
import { Product } from '../../model/class/product';
import { ProductService } from '../../service/product.service';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-add-dialog',
  imports: [FormsModule],
  templateUrl: './add-dialog.html',
  styleUrl: './add-dialog.css',
})
export class AddDialog {
  productObj: Product = new Product();
  selectedFile: File | null = null;
  productService = inject(ProductService);
  readonly add_Dialog = inject(MatDialog);
  addProduct(): void {
    if (!this.productObj.name || !this.productObj.description) {
      alert('Name and Description are required.');
      return;
    }

    if (!this.productObj.price || this.productObj.price <= 0) {
      alert('Price must be greater than 0.');
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.productObj.name);
    formData.append('price', this.productObj.price.toString());
    formData.append('Description', this.productObj.description);
    formData.append('CategoryId', this.productObj.categoryId.toString());

    if (this.selectedFile) {
      formData.append('ImageURL', this.selectedFile);
    }

    this.productService.AddProduct(formData).subscribe({
      next: (res: AddProductResponse) => {
        alert(res.message);
        this.add_Dialog.closeAll();
      },
      error: (err) => {
        console.error('Add product failed:', err);
        alert('Failed to add product. Please try again.');
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
}
