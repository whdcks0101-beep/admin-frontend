import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { getApiErrorMessage } from '../../../api/error';
import { createProduct } from '../../../api/product';

interface ProductCreateFormProps {
  onCreated: () => Promise<void>;
  onCancel: () => void;
  onBusyChange: (busy: boolean) => void;
}
export default function ProductCreateForm({ onCreated, onCancel, onBusyChange }: ProductCreateFormProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [safetyStock, setSafetyStock] = useState<number | ''>(0);
  const [initialQuantity, setInitialQuantity] = useState<number | ''>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;
    if (!sku.trim() || !name.trim()) { setError('상품 코드와 상품명을 입력해 주세요.'); return; }
    if (safetyStock === '' || initialQuantity === '' || !Number.isInteger(safetyStock) || !Number.isInteger(initialQuantity)
      || safetyStock < 0 || initialQuantity < 0 || safetyStock > 2147483647 || initialQuantity > 2147483647) {
      setError('안전 재고와 초기 재고는 0 이상 2147483647 이하의 정수로 입력해 주세요.'); return;
    }
    submissionLock.current = true;
    setIsSubmitting(true); onBusyChange(true); setError(null);
    try {
      await createProduct({ sku: sku.trim(), name: name.trim(), safetyStock, initialQuantity });
      await onCreated();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '상품 등록에 실패했습니다.'));
    } finally { submissionLock.current = false; setIsSubmitting(false); onBusyChange(false); }
  };
  return <form onSubmit={submit}>
    {error && <p className="alert alert-danger" role="alert">{error}</p>}
    <fieldset disabled={isSubmitting} className="form-stack">
      <label className="field"><span>상품 코드 <span className="text-danger">*</span></span>
        <input className="form-control" required maxLength={40} value={sku} placeholder="예: KEYBOARD-002" onChange={(event) => setSku(event.target.value)} />
        <small className="field-hint">상품을 구분하는 고유 코드입니다.</small></label>
      <label className="field"><span>상품명 <span className="text-danger">*</span></span>
        <input className="form-control" required maxLength={100} value={name} placeholder="예: 무선 키보드" onChange={(event) => setName(event.target.value)} /></label>
      <div className="form-grid">
        <label className="field"><span>안전 재고</span><input className="form-control" type="number" required min={0} max={2147483647} step={1} value={safetyStock}
          onChange={(event) => setSafetyStock(event.target.value === '' ? '' : Number(event.target.value))} /></label>
        <label className="field"><span>초기 재고</span><input className="form-control" type="number" required min={0} max={2147483647} step={1} value={initialQuantity}
          onChange={(event) => setInitialQuantity(event.target.value === '' ? '' : Number(event.target.value))} /></label>
      </div>
    </fieldset>
    <div className="form-actions">
      <button className="btn btn-light" type="button" onClick={onCancel} disabled={isSubmitting}>취소</button>
      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '상품 등록'}</button>
    </div>
  </form>;
}
