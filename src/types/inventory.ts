export interface InventoryResponse {
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  safetyStock: number;
  belowSafetyStock: boolean;
}