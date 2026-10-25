import SearchPanel from '../../../common/components/SearchPanel';
export interface OrderSearchFormValues {
  orderId: string;
  fromDate: string;
  toDate: string;
}

interface OrderSearchFormProps {
  value: OrderSearchFormValues;
  onChange: (value: OrderSearchFormValues) => void;
  onSearch: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export default function OrderSearchForm({
  value,
  onChange,
  onSearch,
  onReset,
  disabled = false,
}: OrderSearchFormProps) {
  return (
    <SearchPanel onSearch={onSearch} disabled={disabled} actions={<>
      <button className="btn btn-light" type="button" onClick={onReset}>초기화</button>
      <button className="btn btn-primary" type="submit">검색</button>
    </>}>

        <label className="field">
          주문 번호
          <input className="form-control"
            type="number"
            min="1"
            step="1"
            value={value.orderId}
            onChange={(event) =>
              onChange({
                ...value,
                orderId: event.target.value,
              })
            }
          />
        </label>

        <label className="field">
          시작일
          <input className="form-control"
            type="date"
            value={value.fromDate}
            onChange={(event) =>
              onChange({
                ...value,
                fromDate: event.target.value,
              })
            }
          />
        </label>

        <label className="field">
          종료일
          <input className="form-control"
            type="date"
            min={value.fromDate || undefined}
            value={value.toDate}
            onChange={(event) =>
              onChange({
                ...value,
                toDate: event.target.value,
              })
            }
          />
        </label>

    </SearchPanel>
  );
}
