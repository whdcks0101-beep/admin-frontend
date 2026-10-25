import { useEffect, useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { getProductForEdit, updateProduct } from '../../../api/product';
import { getApiErrorMessage } from '../../../api/error';
import Modal from '../../../common/components/Modal';

interface ProductEditFormProps {
  productId: number;
  onUpdated: () => Promise<void>;
  onClose: () => void;
}

export default function ProductEditForm({ productId, onUpdated, onClose }: ProductEditFormProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [safetyStock, setSafetyStock] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      try {
        const product = await getProductForEdit(productId);
        if (!active) return;
        setSku(product.sku);
        setName(product.name);
        setSafetyStock(product.safetyStock);
      } catch (requestError) {
        if (!active) return;
        setLoadFailed(true);
        setError(getApiErrorMessage(requestError, '상품 정보를 불러오지 못했습니다.'));
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadProduct();
    return () => { active = false; };
  }, [productId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || loadFailed || submissionLock.current) return;
    if (!name.trim() || name.trim().length > 100) {
      setError('상품명은 공백만 입력할 수 없으며 100자 이하여야 합니다.');
      return;
    }
    if (safetyStock === '' || !Number.isInteger(safetyStock) || safetyStock < 0 || safetyStock > 2147483647) {
      setError('안전 재고는 0 이상 2147483647 이하의 정수로 입력해 주세요.');
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProduct(productId, { name: name.trim(), safetyStock });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '상품 수정에 실패했습니다.'));
      submissionLock.current = false;
      setIsSubmitting(false);
      return;
    }
    // 수정 성공 후 목록을 다시 읽어 안전재고 상태도 서버 기준으로 갱신합니다.
    try {
      await onUpdated();
    } catch {
      window.alert('상품은 수정됐지만 목록 갱신에 실패했습니다. 새로고침해 주세요.');
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
      onClose();
    }
  };

  return <Modal isOpen title="상품 정보 수정" description="상품명과 안전재고 기준을 변경합니다." busy={isSubmitting} onClose={onClose}>
    {isLoading && <p className="text-secondary">상품 정보를 불러오는 중입니다.</p>}
    {error && <p className="alert alert-danger" role="alert">{error}</p>}
    {!isLoading && !loadFailed && <form onSubmit={handleSubmit}>
      <fieldset className="form-stack" disabled={isSubmitting}>
        <label className="field"><span>상품 코드</span><input className="form-control" value={sku} disabled /></label>
        <label className="field"><span>상품명 <span className="text-danger">*</span></span>
          <input className="form-control" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="field"><span>안전 재고</span>
          <input className="form-control" type="number" required min={0} max={2147483647} step={1} value={safetyStock}
            onChange={(event) => setSafetyStock(event.target.value === '' ? '' : Number(event.target.value))} /></label>
        <small className="field-hint">현재 재고 수량은 목록의 입고·출고 기능으로 변경해 주세요.</small>
      </fieldset>
      <div className="form-actions">
        <button className="btn btn-light" type="button" disabled={isSubmitting} onClick={onClose}>취소</button>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? '저장 중...' : '변경 저장'}</button>
      </div>
    </form>}
  </Modal>;
}
