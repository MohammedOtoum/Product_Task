import { Component, Inject, inject, ViewChild } from '@angular/core';
import { Product } from '../../model/class/product';
import { ProductService } from '../../service/product.service';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductMangeComponent } from '../ProductMange/ProductMange.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-dialog',
  imports: [FormsModule, CommonModule],
  templateUrl: './update_dialog.component.html',
  styleUrl: './update_dialog.component.css',
})
export class Update_dialogComponent {
  @ViewChild(ProductMangeComponent)
  productMangeComponent!: ProductMangeComponent;
  productService = inject(ProductService);
  productObj: Product = new Product();
  imageUrls: { [key: number]: string } = {};
  constructor(@Inject(MAT_DIALOG_DATA) public data: number) {
    this.getProductbyId(data);
  }
  previewUrl: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Preview the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      // No file selected (or input cleared)
      this.selectedFile = null;

      // Fallback to existing image URL if available
      const existingUrl = this.imageUrls[this.productObj.id];
      this.previewUrl = existingUrl ? existingUrl : null;
    }
  }
  getProductbyId(id: number) {
    this.productService.getProductById(id).subscribe((res: Product) => {
      this.productObj = res;
      this.getImagebyId(this.productObj.id);
    });
  }

  selectedFile: File | null = null;
  readonly add_Dialog = inject(MatDialog);
  getImagebyId(Id: number) {
    this.productService.getImageById(this.productObj.id).subscribe((blob) => {
      this.imageUrls[this.productObj.id] = URL.createObjectURL(blob);
    });
  }
  updateProduct() {
    const formData = new FormData();
    formData.append('Name', this.productObj.name);
    formData.append('price', this.productObj.price.toString());
    formData.append('Description', this.productObj.description);
    formData.append('CategoryId', this.productObj.categoryId.toString());

    if (this.selectedFile) {
      formData.append('ImageURL', this.selectedFile);
      this.submitFormData(formData);
    } else {
      // Fetch the existing image blob and re-send it
      this.productService.getImageById(this.productObj.id).subscribe((blob) => {
        const file = new File([blob], 'existing-image.jpg', {
          type: blob.type,
        });
        formData.append('ImageURL', file);
        this.submitFormData(formData);
      });
    }
  }
  submitFormData(formData: FormData) {
    this.productService
      .updateProduct(this.productObj.id, formData)
      .subscribe((res: AddProductResponse) => {
        alert(res.message);
        this.previewUrl = null;
        this.add_Dialog.closeAll();
      });
  }
}
