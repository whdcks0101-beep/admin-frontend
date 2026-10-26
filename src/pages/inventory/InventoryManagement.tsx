import { useEffect, useState, useRef, useCallback } from 'react';
import { getInventories, stockIn, stockOut } from '../../api/inventory';
import { getApiErrorMessage } from '../../api/error';
import ProductCreateForm from './components/ProductCreateForm';
import PageHeader from '../../common/components/PageHeader';
import SearchPanel from '../../common/components/SearchPanel';
import TablePanel from '../../common/components/TablePanel';
import Feedback from '../../common/components/Feedback';
import Modal from '../../common/components/Modal';
import ProductEditForm from './components/ProductEditForm';
import useAuthStore from '../../store/useAuthStore';
import type { InventoryResponse } from '../../types/inventory';

export default function InventoryManagement() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.authorities.some((authority) => authority === 'ROLE_ADMIN' || authority === 'ROLE_DEMO_ADMIN') ?? false;
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inventories, setInventories] = useState<InventoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const listVersion = useRef(0);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredInventories = inventories.filter((inventory) =>
    (inventory.productName.toLowerCase().includes(normalizedSearch) ||
    inventory.sku.toLowerCase().includes(normalizedSearch)) &&
    (stockFilter === 'all' || (stockFilter === 'low' ? inventory.belowSafetyStock : !inventory.belowSafetyStock))
  );

  const fetchInventories = useCallback(async () => {
    const version = ++listVersion.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInventories();
      if (version === listVersion.current) setInventories(data);
    } catch (requestError) {
      if (version === listVersion.current) setError(getApiErrorMessage(requestError, '재고 목록을 불러오지 못했습니다.'));
    } finally {
      if (version === listVersion.current) setIsLoading(false);
    }
  }, []);

  const invalidateInventoryRequests = useCallback(() => { listVersion.current++; }, []);
  useEffect(() => {
    void fetchInventories();
    return invalidateInventoryRequests;
  }, [fetchInventories, invalidateInventoryRequests]);


const handleStockOut = async (productId: number) => {
  if (submissionLock.current) return;
  if (
    quantity === '' ||
    !Number.isInteger(quantity) ||
    quantity <= 0 || quantity > 2147483647
  ) {
    window.alert('수량은 1 이상 2147483647 이하의 정수로 입력해 주세요.');
    return;
  }

  submissionLock.current = true;
  setIsSubmitting(true);

  try {
    const updatedInventory = await stockOut(productId, quantity);

    setInventories((previous) =>
      previous.map((inventory) =>
        inventory.productId === productId
          ? updatedInventory
          : inventory
      )
    );
  } catch (requestError) {
    window.alert(getApiErrorMessage(requestError, '출고 요청에 실패했습니다.'));
  } finally {
    submissionLock.current = false;
    setIsSubmitting(false);
  }
};  

const handleStockIn = async (productId: number) => {
  if (submissionLock.current) return;
  if (
    quantity === '' ||
    !Number.isInteger(quantity) ||
    quantity <= 0 || quantity > 2147483647
  ) {
    window.alert('수량은 1 이상 2147483647 이하의 정수로 입력해 주세요.');
    return;
  }

  submissionLock.current = true;
  setIsSubmitting(true);
  try {
    const updatedInventory = await stockIn(productId, quantity);

    setInventories((previous) =>
      previous.map((inventory) =>
        inventory.productId === productId
          ? updatedInventory
          : inventory
      )
    );
  } catch (requestError) {
    window.alert(getApiErrorMessage(requestError, '입고 요청에 실패했습니다.'));
  } finally {
    submissionLock.current = false;
    setIsSubmitting(false);
  }
}; 

  const lowStockCount = inventories.filter((item) => item.belowSafetyStock).length;
  const statsReady = !isLoading && !error;
  return <section>
    <PageHeader title="상품·재고 관리" description="상품 정보와 재고 현황을 한눈에 확인하고 관리하세요."
      actions={<>
        <button className="btn btn-light" onClick={fetchInventories} disabled={isLoading || isSubmitting}>↻ 새로고침</button>
        {isAdmin && <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>＋ 상품 등록</button>}
      </>} />
    <div className="stats-grid">
      <div className="stat-card"><div><div className="stat-label">전체 상품</div>
        <div className="stat-value">{statsReady ? inventories.length.toLocaleString() : '—'}<small>개</small></div>
        <div className="stat-note">현재 등록된 상품</div></div><span className="stat-icon" aria-hidden="true">▦</span></div>
      <div className="stat-card stat-success"><div><div className="stat-label">정상 재고</div>
        <div className="stat-value">{statsReady ? (inventories.length - lowStockCount).toLocaleString() : '—'}<small>개</small></div>
        <div className="stat-note">서버 재고 기준 정상 상품</div></div><span className="stat-icon" aria-hidden="true">✓</span></div>
      <div className="stat-card stat-warning"><div><div className="stat-label">재고 부족</div>
        <div className="stat-value">{statsReady ? lowStockCount.toLocaleString() : '—'}<small>개</small></div>
        <div className="stat-note">재고 확인이 필요한 상품</div></div><span className="stat-icon" aria-hidden="true">!</span></div>
    </div>
    <SearchPanel actions={<button type="button" className="btn btn-light" onClick={() => { setSearchTerm(''); setStockFilter('all'); }}>초기화</button>}>
      <label className="field"><span>상품 검색</span>
        <input className="form-control" value={searchTerm} placeholder="상품명 또는 상품 코드"
          onChange={(event) => setSearchTerm(event.target.value)} /></label>
      <label className="field"><span>재고 상태</span>
        <select className="form-select" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
          <option value="all">전체 상태</option><option value="normal">정상 재고</option><option value="low">재고 부족</option>
        </select></label>
    </SearchPanel>
    <TablePanel title="상품 목록" count={statsReady ? filteredInventories.length : undefined}
      actions={isAdmin ? <label className="quantity-control">입·출고 수량
        <input className="form-control" type="number" min={1} step={1} value={quantity} disabled={isSubmitting}
          onChange={(event) => setQuantity(event.target.value === '' ? '' : Number(event.target.value))} />
        <span>개</span></label> : <span>조회 전용</span>}
      footer={<span>현재 조회된 전체 목록에서 검색합니다. · {isAdmin ? '입·출고 수량을 지정한 뒤 상품별 버튼을 눌러 주세요.' : '등록·수정 및 입출고는 관리자만 가능합니다.'}</span>}>
      {isLoading ? <Feedback kind="loading">상품·재고 정보를 불러오는 중입니다.</Feedback>
        : error ? <Feedback kind="error">{error}</Feedback>
        : filteredInventories.length === 0 ? <Feedback>{inventories.length === 0 ? '등록된 상품이 없습니다. 새 상품을 등록해 주세요.' : '검색 조건에 맞는 상품이 없습니다.'}</Feedback>
        : <table className="table table-hover data-table">
          <thead><tr><th scope="col">상품 코드</th><th scope="col">상품명</th>
            <th scope="col" className="number-cell">현재 재고</th><th scope="col" className="number-cell">안전 재고</th>
            <th scope="col">상태</th>{isAdmin && <th scope="col" className="text-end">관리</th>}</tr></thead>
          <tbody>{filteredInventories.map((item) => <tr key={item.productId}>
            <td><span className="sku-text">{item.sku}</span></td>
            <td><span className="product-name">{item.productName}</span></td>
            <td className="number-cell"><strong>{item.quantity.toLocaleString()}</strong><span className="text-secondary ms-1">개</span></td>
            <td className="number-cell">{item.safetyStock.toLocaleString()}<span className="text-secondary ms-1">개</span></td>
            <td><span className={`status-badge ${item.belowSafetyStock ? 'warning' : ''}`}>{item.belowSafetyStock ? '재고 부족' : '정상'}</span></td>
            {isAdmin && <td><div className="cell-actions">
              <button className="btn btn-light btn-sm" aria-label={`${item.productName} 수정`} disabled={isSubmitting} onClick={() => setEditingProductId(item.productId)}>수정</button>
              <button className="btn btn-light btn-sm" aria-label={`${item.productName} 입고`} disabled={isSubmitting} onClick={() => handleStockIn(item.productId)}>입고</button>
              <button className="btn btn-light btn-sm" aria-label={`${item.productName} 출고`} disabled={isSubmitting || item.quantity === 0} onClick={() => handleStockOut(item.productId)}>출고</button>
            </div></td>}
          </tr>)}</tbody>
        </table>}
    </TablePanel>
    <div className="info-note"><span aria-hidden="true">ⓘ</span>상품명·안전재고 수정과 실제 재고 수량의 입출고는 구분하여 처리합니다.</div>
    {isAdmin && <Modal isOpen={isCreateOpen} title="새 상품 등록" description="상품 기본정보와 최초 재고 수량을 입력해 주세요."
      busy={isCreating} onClose={() => setIsCreateOpen(false)}>
      <ProductCreateForm onBusyChange={setIsCreating} onCancel={() => setIsCreateOpen(false)}
        onCreated={async () => { await fetchInventories(); setIsCreateOpen(false); }} />
    </Modal>}
    {isAdmin && editingProductId !== null && <ProductEditForm key={editingProductId} productId={editingProductId}
      onUpdated={fetchInventories} onClose={() => setEditingProductId(null)} />}
  </section>;
}
