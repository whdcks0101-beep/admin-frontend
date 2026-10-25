import axios from 'axios';

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (!axios.isAxiosError<unknown>(error)) {
    return fallbackMessage;
  }

  const response = error.response;

  if (response?.status === 401) {
    return '로그인이 필요하거나 만료되었습니다. 다시 로그인해 주세요.';
  }

  if (response?.status === 429) {
    const rawRetryAfter = response.headers['retry-after'];

    const retryAfterSeconds =
      typeof rawRetryAfter === 'string' &&
      /^\d+$/.test(rawRetryAfter.trim())
        ? Number(rawRetryAfter.trim())
        : NaN;

    if (
      Number.isSafeInteger(retryAfterSeconds) &&
      retryAfterSeconds > 0
    ) {
      return `요청이 너무 많습니다. ${retryAfterSeconds}초 후 다시 시도해 주세요.`;
    }

    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  }  

  if (!response || response.status >= 500) {
    return fallbackMessage;
  }

  const body = response.data;

  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body
  ) {
    const message = body.message;

    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }

  return fallbackMessage;
}
