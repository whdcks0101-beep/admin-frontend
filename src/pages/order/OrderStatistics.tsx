import { useEffect, useState } from 'react';

import PageHeader from '../../common/components/PageHeader';
import SearchPanel from '../../common/components/SearchPanel';
import TablePanel from '../../common/components/TablePanel';
import Feedback from '../../common/components/Feedback';

import { getDailyOrderStatistics } from '../../api/orderStatistic';
import { getApiErrorMessage } from '../../api/error';
import { useSearchParams } from 'react-router-dom';

import type {
  DailyOrderStatisticResponse,
  OrderStatisticSearchRequest,
} from '../../types/orderStatistic';

export default function OrderStatistics() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [formValues, setFormValues] =
    useState<OrderStatisticSearchRequest>(() => ({
      fromDate: searchParams.get('fromDate') ?? '',
      toDate: searchParams.get('toDate') ?? '',
    }));

  const [rows, setRows] = useState<DailyOrderStatisticResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 같은 검색 조건으로 다시 조회할 때 사용
  const [refreshKey, setRefreshKey] = useState(0);

  const hasSearch =
    searchParams.has('fromDate') || searchParams.has('toDate');

  const handleSearch = () => {
    if (!formValues.fromDate || !formValues.toDate) {
      setError('시작일과 종료일을 입력해 주세요.');
      return;
    }

    if (formValues.fromDate > formValues.toDate) {
      setError('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }

    const isSameSearch =
      searchParams.get('fromDate') === formValues.fromDate &&
      searchParams.get('toDate') === formValues.toDate;

    if (isSameSearch) {
      setRefreshKey((previous) => previous + 1);
      return;
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      next.set('fromDate', formValues.fromDate);
      next.set('toDate', formValues.toDate);

      return next;
    });
  };

  useEffect(() => {
    const fromDate = searchParams.get('fromDate') ?? '';
    const toDate = searchParams.get('toDate') ?? '';

    // 새로고침·뒤로 가기 시 URL과 입력창을 맞춘다.
    setFormValues({ fromDate, toDate });
    setRows([]);
    setError(null);
    setIsLoading(false);

    const hasConditions =
      searchParams.has('fromDate') || searchParams.has('toDate');

    if (!hasConditions) {
      return;
    }

    if (!fromDate || !toDate) {
      setError('시작일과 종료일을 모두 지정해 주세요.');
      return;
    }

    if (fromDate > toDate) {
      setError('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }

    let active = true;

    const fetchStatistics = async () => {
      setIsLoading(true);

      try {
        const data = await getDailyOrderStatistics({
          fromDate,
          toDate,
        });

        if (active) {
          setRows(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            getApiErrorMessage(
              requestError,
              '주문 통계를 불러오지 못했습니다.'
            )
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void fetchStatistics();

    return () => {
      active = false;
    };
  }, [searchParams, refreshKey]);

  return (
    <section>
      <PageHeader
        title="주문 통계"
        description="이벤트로 수집된 주문의 날짜별 건수를 조회합니다. 반영까지 잠시 지연될 수 있습니다."
      />

      <SearchPanel
        onSearch={handleSearch}
        disabled={isLoading}
        actions={
          <button className="btn btn-primary" type="submit">
            검색
          </button>
        }
      >
        <label className="field">
          시작일
          <input
            className="form-control"
            type="date"
            required
            max="9999-12-31"
            value={formValues.fromDate}
            onChange={(event) =>
              setFormValues((previous) => ({
                ...previous,
                fromDate: event.target.value,
              }))
            }
          />
        </label>

        <label className="field">
          종료일
          <input
            className="form-control"
            type="date"
            required
            min={formValues.fromDate || undefined}
            max="9999-12-31"
            value={formValues.toDate}
            onChange={(event) =>
              setFormValues((previous) => ({
                ...previous,
                toDate: event.target.value,
              }))
            }
          />
        </label>
      </SearchPanel>

      <TablePanel title="날짜별 주문 건수">
        {isLoading ? (
          <Feedback kind="loading">
            주문 통계를 불러오는 중입니다.
          </Feedback>
        ) : error ? (
          <Feedback kind="error">{error}</Feedback>
        ) : !hasSearch ? (
          <Feedback>조회할 기간을 선택하고 검색해 주세요.</Feedback>
        ) : rows.length === 0 ? (
          <Feedback>해당 기간에 수집된 주문 기록이 없습니다.</Feedback>
        ) : (
          <table className="table table-hover data-table">
            <thead>
              <tr>
                <th scope="col">주문일</th>
                <th scope="col" className="text-end">주문 건수</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.orderDate}>
                  <td>{row.orderDate}</td>
                  <td className="text-end">
                    {row.orderCount.toLocaleString()}건
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TablePanel>
    </section>
  );
}