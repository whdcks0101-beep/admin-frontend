import PageHeader from '../../common/components/PageHeader';
import TablePanel from '../../common/components/TablePanel';
import Feedback from '../../common/components/Feedback';
import { useEffect, useState } from 'react';

import { getOrders } from '../../api/order';
import { getApiErrorMessage } from '../../api/error';
import type { OrderResponse } from '../../types/order';
import type { PageResponse } from '../../types/page';
import Pagination from '../../common/components/Pagination';
import { Link, useSearchParams } from 'react-router-dom';
import OrderSearchForm from './components/OrderSearchForm';
import type { OrderSearchFormValues } from './components/OrderSearchForm';

export default function OrderList() {
  const [result, setResult] = useState<PageResponse<OrderResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [formValues, setFormValues] = useState<OrderSearchFormValues>(
  () => ({
    orderId: searchParams.get('orderId') ?? '',
    fromDate: searchParams.get('fromDate') ?? '',
    toDate: searchParams.get('toDate') ?? '',
   })
  );

  const handleSearch = () => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      for (const [key, rawValue] of Object.entries(formValues)) {
        const value = rawValue.trim();

        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }

      next.set('page', '0');

      return next;
    });
  };

  const handleReset = () => {
    setFormValues({
      orderId: '',
      fromDate: '',
      toDate: '',
    });

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      for (const key of Object.keys(formValues)) {
        next.delete(key);
      }

      next.set('page', '0');

      return next;
    });
  };

  const handlePageChange = (nextPage: number) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('page', String(nextPage));
      return next;
    });
  };  

  useEffect(() => {
    const requestedPage = Number(searchParams.get('page') ?? '0');
    const page = Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage: 0;
    const orderId = searchParams.get('orderId') ?? '';
    const fromDate = searchParams.get('fromDate') ?? '';
    const toDate = searchParams.get('toDate') ?? '';

    setFormValues({
     orderId,
     fromDate,
     toDate,
    });

    let active = true;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (
          orderId &&
          (!Number.isSafeInteger(Number(orderId)) || Number(orderId) <= 0)
        ) {
          throw new Error('올바르지 않은 주문 번호입니다.');
        }

        const data = await getOrders({
          page,
          size: 10,
          ...(orderId ? { orderId: Number(orderId) } : {}),
          ...(fromDate ? { fromDate } : {}),
          ...(toDate ? { toDate } : {}),
        });

        if (active) {
          setResult(data);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, '주문 목록을 불러오지 못했습니다.'));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [searchParams]);

  return <section>
    <PageHeader title="주문 내역" description="주문 번호와 기간으로 필요한 주문을 빠르게 찾아보세요."
      actions={<Link className="btn btn-primary" to="/orders/new">＋ 주문 생성</Link>} />
    <OrderSearchForm value={formValues} onChange={setFormValues} onSearch={handleSearch} onReset={handleReset} disabled={isLoading} />
    <TablePanel title="주문 목록" count={!isLoading && !error && result ? result.totalElements : undefined}
      footer={!isLoading && !error && result && <Pagination page={result.page} totalPages={result.totalPages} disabled={isLoading} onPageChange={handlePageChange} />}>
      {isLoading ? <Feedback kind="loading">주문 목록을 불러오는 중입니다.</Feedback>
        : error ? <Feedback kind="error">{error}</Feedback>
        : !result || result.content.length === 0 ? <Feedback>검색 조건에 맞는 주문이 없습니다.</Feedback>
        : <table className="table table-hover data-table">
          <thead><tr><th scope="col">주문 번호</th><th scope="col">주문 시각</th><th scope="col" className="text-end">상세</th></tr></thead>
          <tbody>{result.content.map((order) => <tr key={order.orderId}>
            <td><Link className="fw-semibold" to={`/orders/${order.orderId}?${searchParams.toString()}`}>#{order.orderId}</Link></td>
            <td>{order.createdAt.replace('T', ' ')}</td>
            <td className="text-end"><Link className="btn btn-light btn-sm" to={`/orders/${order.orderId}?${searchParams.toString()}`}>상세 보기 →</Link></td>
          </tr>)}</tbody>
        </table>}
    </TablePanel>
  </section>;
}
