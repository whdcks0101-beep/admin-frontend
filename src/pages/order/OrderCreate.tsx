import { Link } from 'react-router-dom';
import PageHeader from '../../common/components/PageHeader';
import Feedback from '../../common/components/Feedback';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import type { InventoryResponse } from '../../types/inventory';
import { getInventories } from '../../api/inventory';
import { createOrder } from '../../api/order';
import type { OrderResponse } from '../../types/order';
import { getApiErrorMessage } from '../../api/error';

export default function OrderCreate() {
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState<number | ''>(1);
    const [inventories, setInventories] = useState<InventoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submissionLock = useRef(false);
    const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);

    const fetchInventories = async () => {
        setIsLoading(true);
        setError(null);

        try {
        const data = await getInventories();
        setInventories(data);
        } catch (requestError) {
        setError(getApiErrorMessage(requestError, '상품 목록을 불러오지 못했습니다.'));
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventories();
    }, []);  

    const handleCreateOrder = async () => {
    if (submissionLock.current) return;
    if (!productId || !Number.isSafeInteger(Number(productId)) || Number(productId) <= 0) {
        window.alert('상품을 선택해 주세요.');
        return;
    }

    if (quantity === '' ||!Number.isInteger(quantity) ||quantity <= 0 || quantity > 2147483647) {
        window.alert('주문 수량은 1 이상 2147483647 이하의 정수로 입력해 주세요.');
        return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    setCreatedOrder(null);

    try {
        const order = await createOrder({
        items: [
            {
            productId: Number(productId),
            quantity,
            },
        ],
        });

        setCreatedOrder(order);
        setProductId('');
        setQuantity(1);

        await fetchInventories();
    } catch (requestError) {
        window.alert(
          getApiErrorMessage(requestError, '주문에 실패했습니다.')
        );

        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 409
        ) {
          await fetchInventories();
        }
    } finally {
        submissionLock.current = false;
        setIsSubmitting(false);
    }
    };    

  const selected = inventories.find((item) => item.productId === Number(productId));
  return <section>
    <PageHeader title="새 주문 생성" description="상품과 주문 수량을 선택해 주문을 등록하세요."
      actions={<Link className="btn btn-light" to="/orders">주문 내역 보기 →</Link>} />
    <div className="form-section">
      <h2 className="mb-4">주문 정보</h2>
      {error && <Feedback kind="error">{error}</Feedback>}
      <form onSubmit={(event) => { event.preventDefault(); if (!isSubmitting) void handleCreateOrder(); }}>
        <label className="field"><span>주문 상품 <span className="text-danger">*</span></span>
          <select className="form-select" required value={productId} onChange={(event) => setProductId(event.target.value)} disabled={isSubmitting || isLoading || error !== null}>
            <option value="">{isLoading ? '상품을 불러오는 중...' : '상품을 선택해 주세요'}</option>
            {inventories.map((item) => <option key={item.productId} value={item.productId} disabled={item.quantity === 0}>
              {item.productName} ({item.sku}) — 재고 {item.quantity}개
            </option>)}
          </select></label>
        <label className="field"><span>주문 수량 <span className="text-danger">*</span></span>
          <input className="form-control" type="number" required min={1} step={1} value={quantity} disabled={isSubmitting}
            onChange={(event) => setQuantity(event.target.value === '' ? '' : Number(event.target.value))} /></label>
        <div className="form-summary">
          {selected ? <><strong>{selected.productName}</strong><br />현재 재고 {selected.quantity.toLocaleString()}개 · 주문 수량 {quantity || 0}개</>
            : '상품을 선택하면 현재 재고를 확인할 수 있습니다.'}
        </div>
        <div className="form-actions"><button className="btn btn-primary" type="submit" disabled={isSubmitting || isLoading || error !== null || !productId}>
          {isSubmitting ? '주문 중...' : '주문 등록'}</button></div>
      </form>
      {createdOrder && <Feedback kind="success">주문이 등록되었습니다.
        <Link to={`/orders/${createdOrder.orderId}`}>주문 #{createdOrder.orderId} 확인 →</Link>
      </Feedback>}
    </div>
  </section>;
}
    