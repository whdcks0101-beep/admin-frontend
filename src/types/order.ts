import type { PageRequest } from './page';

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
}

export interface OrderResponse {
  orderId: number;
  createdAt: string;
}

export interface OrderItemResponse {
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
}

export interface OrderDetailResponse {
  orderId: number;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderSearchRequest extends PageRequest {
  orderId?: number;
  fromDate?: string;
  toDate?: string;
}