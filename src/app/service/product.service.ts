import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../model/class/product';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(
      'https://localhost:7217/api/Product/GetProducts'
    );
  }

  getProductById(Id: number): Observable<Product> {
    return this.http.get<Product>(
      'https://localhost:7217/api/Product/productById/' + Id
    );
  }

  getSortedProduct(sortType: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      'https://localhost:7217/api/Product/GetProductsSortedByPrice?sortOrder=' +
        sortType
    );
  }

  getSortedSearch(name: string, sortType: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `https://localhost:7217/api/Product/GetProductsSortedByTitleandPrice?name=${name}&sortOrder=${sortType}`
    );
  }

  getSearch(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      'https://localhost:7217/api/Product/Getproductbyname' + name
    );
  }
  getImageById(id: number): Observable<Blob> {
    return this.http.get(
      `https://localhost:7217/api/Product/GetImageProduct/${id}`,
      {
        responseType: 'blob',
      }
    );
  }

  AddProduct(product: FormData): Observable<AddProductResponse> {
    return this.http.post<AddProductResponse>(
      'https://localhost:7217/api/Product/addProduct',
      product
    );
  }

  updateProduct(Id: number, product: FormData): Observable<AddProductResponse> {
    return this.http.put<AddProductResponse>(
      'https://localhost:7217/api/Product/' + Id,
      product
    );
  }
  deleteProduct(Id: number): Observable<string> {
    return this.http.delete<string>(
      'https://localhost:7217/api/Product/DeleteProductbyId' + Id
    );
  }

  getProductByCategoryId(CategoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(
      'https://localhost:7217/api/Product/productByCategoryId/' + CategoryId
    );
  }

  getSortedProductsByCategoryId(
    CategoryId: number,
    sortOrder: string
  ): Observable<Product[]> {
    return this.http.get<Product[]>(
      `https://localhost:7217/api/Product/GetProductsSortedByCategoryIdandPrice?CategoryId=${CategoryId}&sortOrder=${sortOrder}`
    );
  }
  getSortedProductsByCategoryIdWithName(
    Name: string,
    CategoryId: number,
    sortOrder: string
  ): Observable<Product[]> {
    return this.http.get<Product[]>(
      `https://localhost:7217/api/Product/GetProductsSortedByCategoryIdandPriceandName?name=${Name}&CategoryId=${CategoryId}&sortOrder=${sortOrder}`
    );
  }
}
