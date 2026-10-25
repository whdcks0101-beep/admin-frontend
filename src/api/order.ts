import apiClient from './client';
import type {CreateOrderRequest,OrderResponse,OrderDetailResponse,OrderSearchRequest} from '../types/order';
import type { PageResponse } from '../types/page';

export async function createOrder(
  request: CreateOrderRequest
): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>(
    '/orders',
    request
  );

  return response.data;
}

export async function getOrders(
  params: OrderSearchRequest
): Promise<PageResponse<OrderResponse>> {
  const response = await apiClient.get<PageResponse<OrderResponse>>(
    '/orders',
    { params }
  );

  return response.data;
}

export async function getOrder(
  orderId: number
): Promise<OrderDetailResponse> {
  const response = await apiClient.get<OrderDetailResponse>(
    `/orders/${orderId}`
  );

  return response.data;
}