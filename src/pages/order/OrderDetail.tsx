import PageHeader from '../../common/components/PageHeader';
import TablePanel from '../../common/components/TablePanel';
import Feedback from '../../common/components/Feedback';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/error';

import { getOrder } from '../../api/order';
import type { OrderDetailResponse } from '../../types/order';


export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      setOrder(null);

      const id = Number(orderId);

      if (!Number.isSafeInteger(id) || id <= 0) {
        setError('올바른 주문 번호가 아닙니다.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await getOrder(id);

        if (active) {
          setOrder(data);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(getApiErrorMessage(requestError, '주문 정보를 불러오지 못했습니다.'));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  return <section>
    <PageHeader title="주문 상세" description="주문에 포함된 상품과 수량을 확인하세요."
      actions={<Link className="btn btn-light" to={{ pathname: '/orders', search: searchParams.toString() }}>← 주문 목록</Link>} />
    {isLoading && <Feedback kind="loading">주문 정보를 불러오는 중입니다.</Feedback>}
    {error && <Feedback kind="error">{error}</Feedback>}
    {!isLoading && !error && order && <>
      <dl className="detail-meta"><div><dt>주문 번호</dt><dd>#{order.orderId}</dd></div>
        <div><dt>주문 시각</dt><dd>{order.createdAt.replace('T', ' ')}</dd></div></dl>
      <TablePanel title="주문 상품" count={order.items.length}>
        {order.items.length === 0 ? <Feedback>주문 항목이 없습니다.</Feedback> : <table className="table table-hover data-table">
          <thead><tr><th scope="col">상품 코드</th><th scope="col">상품명</th><th scope="col" className="number-cell">주문 수량</th></tr></thead>
          <tbody>{order.items.map((item) => <tr key={item.productId}>
            <td className="sku-text">{item.sku}</td><td className="product-name">{item.productName}</td><td className="number-cell">{item.quantity.toLocaleString()}개</td>
          </tr>)}</tbody>
        </table>}
      </TablePanel>
    </>}
  </section>;
}
