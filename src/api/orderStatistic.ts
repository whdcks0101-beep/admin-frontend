import apiClient from './client';

import type {
    DailyOrderStatisticResponse,
    OrderStatisticSearchRequest,
} from '../types/orderStatistic';

export async function getDailyOrderStatistics(params: OrderStatisticSearchRequest): Promise<DailyOrderStatisticResponse[]> {
    const response = await apiClient.get<DailyOrderStatisticResponse[]>(
        '/order-statistics/daily',
        { params }
    );

    return response.data;
}