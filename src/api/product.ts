import apiClient from './client';
import type { CreateProductRequest, ProductResponse, UpdateProductRequest } from '../types/product';
import type { InventoryResponse } from '../types/inventory';

export async function getProduct(productId: number): Promise<ProductResponse> {
  const response = await apiClient.get<ProductResponse>(`/products/${productId}`);
  return response.data;
}

export async function updateProduct(
  productId: number,
  request: UpdateProductRequest
): Promise<ProductResponse> {
  const response = await apiClient.put<ProductResponse>(`/products/${productId}`, request);
  return response.data;
}

export async function createProduct(
  request: CreateProductRequest
): Promise<InventoryResponse> {
  const response = await apiClient.post<InventoryResponse>(
    '/products',
    request
  );

  return response.data;
}

export async function getProductForEdit(
  productId: number
): Promise<ProductResponse> {
  const response = await apiClient.get<ProductResponse>(
    `/products/${productId}/edit`
  );

  return response.data;
}