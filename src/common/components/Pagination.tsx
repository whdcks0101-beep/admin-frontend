interface PaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}
export default function Pagination({ page, totalPages, disabled = false, onPageChange }: PaginationProps) {
  if (totalPages === 0) return null;
  return <nav className="pagination-bar" aria-label="목록 페이지">
    <span aria-live="polite">전체 {totalPages}페이지 중 {page + 1}페이지</span>
    <div className="pagination-controls">
      <button className="btn btn-light btn-sm" disabled={disabled || page <= 0} onClick={() => onPageChange(page - 1)}>이전</button>
      <span className="page-indicator" aria-current="page">{page + 1}</span>
      <button className="btn btn-light btn-sm" disabled={disabled || page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>다음</button>
    </div>
  </nav>;
}
