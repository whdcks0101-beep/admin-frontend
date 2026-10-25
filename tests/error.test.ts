import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getApiErrorMessage } from '../src/api/error';

function createRateLimitError(retryAfter?: string) {
    const config = {
        headers: new AxiosHeaders(),
    };

    return new AxiosError(
        '요청 횟수 초과',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        {
            status: 429,
            statusText: 'Too Many Requests',
            headers:
                retryAfter === undefined
                    ? {}
                    : { 'retry-after': retryAfter },
            data: {
                message: '요청이 너무 많습니다.',
            },
            config,
        }
    );
}

describe('요청 제한 오류 안내', () => {
    it('Retry-After가 유효하면 대기 시간을 안내한다', () => {
        const error = createRateLimitError('23');

        const message = getApiErrorMessage(
            error,
            '주문에 실패했습니다.'
        );

        expect(message).toBe(
            '요청이 너무 많습니다. 23초 후 다시 시도해 주세요.'
        );
    });

    it('Retry-After가 없으면 일반 안내를 반환한다', () => {
        const error = createRateLimitError();

        expect(
            getApiErrorMessage(error, '주문에 실패했습니다.')
        ).toBe(
            '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
        );
    });

    it.each(['abc', '-1', '0', '1.5', '', '9007199254740992'])(
        'Retry-After가 "%s"이면 일반 안내를 반환한다',
        (retryAfter) => {
            const error = createRateLimitError(retryAfter);

            expect(
                getApiErrorMessage(error, '주문에 실패했습니다.')
            ).toBe(
                '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
            );
        }
    );
});