export interface CreateProductRequest {
  sku: string;
  name: string;
  safetyStock: number;
  initialQuantity: number;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  safetyStock: number;
}

export interface UpdateProductRequest {
  name: string;
  safetyStock: number;
}
