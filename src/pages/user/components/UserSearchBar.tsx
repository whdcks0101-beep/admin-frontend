import SearchPanel from '../../../common/components/SearchPanel';
interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  disabled?: boolean;
}
export default function UserSearchBar({ searchTerm, setSearchTerm, handleSearch, disabled }: SearchBarProps) {
  return <SearchPanel disabled={disabled} onSearch={handleSearch} actions={<button className="btn btn-primary" type="submit">검색</button>}>
    <label className="field"><span>회원 이름</span>
      <input className="form-control" placeholder="이름으로 검색" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
  </SearchPanel>;
}
