import apiClient from './client';
import type { CurrentUserResponse, CsrfTokenResponse} from '../types/auth';

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await apiClient.get<CurrentUserResponse>('/auth/me');

  return response.data;
}

export async function getCsrfToken(): Promise<CsrfTokenResponse> {
  const response =
    await apiClient.get<CsrfTokenResponse>('/auth/csrf');

  return response.data;
}