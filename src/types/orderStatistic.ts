export interface DailyOrderStatisticResponse {
  orderDate: string;
  orderCount: number;
}

export interface OrderStatisticSearchRequest {
  fromDate: string;
  toDate: string;
}