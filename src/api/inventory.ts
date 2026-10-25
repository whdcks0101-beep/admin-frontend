import apiClient from './client';
import type { InventoryResponse } from '../types/inventory';

export async function getInventories(): Promise<InventoryResponse[]> {
  const response = await apiClient.get<InventoryResponse[]>('/inventories');

  return response.data;
}

export async function stockIn(
  productId: number,
  quantity: number
): Promise<InventoryResponse> {
  const response = await apiClient.post<InventoryResponse>(
    `/products/${productId}/stock-in`,
    { quantity }
  );

  return response.data;
}

export async function stockOut(
  productId: number,
  quantity: number
): Promise<InventoryResponse> {
  const response = await apiClient.post<InventoryResponse>(
    `/products/${productId}/stock-out`,
    { quantity }
  );

  return response.data;
}