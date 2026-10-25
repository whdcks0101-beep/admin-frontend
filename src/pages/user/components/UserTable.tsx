// 1. User 타입 정의 (부모 쪽에 있던 걸 가져오거나 새로 선언)
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// 2. 자바의 파라미터 DTO 역할! 테이블이 제대로 돌아가기 위해 필요한 모든 데이터와 함수들
interface UserTableProps {
  disabled?: boolean;
  users: User[]; // 필터링이 완료된 리스트를 받을 예정!
  editingId: number | null;
  editName: string;
  editEmail: string;
  editRole: string;
  setEditName: (name: string) => void;
  setEditEmail: (email: string) => void;
  setEditRole: (role: string) => void;
  setEditingId: (id: number | null) => void;
  handleEditClick: (user: User) => void;
  handleSaveEdit: (id: number) => void;
  handleDeleteUser: (id: number) => void;
}


// 3. 부모로부터 어마어마한 양의 파라미터(Props)를 받아서 테이블을 그립니다.
export default function UserTable({
  users, editingId, editName, editEmail, editRole,
  setEditName, setEditEmail, setEditRole, setEditingId,
  handleEditClick, handleSaveEdit, handleDeleteUser, disabled = false
}: UserTableProps) {
  
  return (
    <table className="table table-hover data-table">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">이름</th>
          <th scope="col">이메일</th>
          <th scope="col">권한</th>
          <th scope="col" className="text-end">관리</th>
        </tr>
      </thead>
      <tbody>
        {/* 부모가 넘겨준 users 배열을 map으로 돌립니다 */}
        {users.map((user) => (
          <tr key={user.id}>
            <td className="sku-text">#{user.id}</td>
            
            {editingId === user.id ? (
              <>
                <td>
                  <input disabled={disabled} type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="form-control" aria-label="회원 이름" />
                </td>
                <td>
                  <input disabled={disabled} type="text" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="form-control" aria-label="회원 이메일" />
                </td>
                <td>
                  <select disabled={disabled} value={editRole} onChange={(e) => setEditRole(e.target.value)} className="form-select" aria-label="회원 구분">
                    <option value="일반회원">일반회원</option>
                    <option value="우수회원">우수회원</option>
                    <option value="관리자">관리자</option>
                  </select>
                </td>
                <td><div className="cell-actions">
                  <button disabled={disabled} onClick={() => handleSaveEdit(user.id)} className="btn btn-primary btn-sm">저장</button>
                  <button disabled={disabled} onClick={() => setEditingId(null)} className="btn btn-light btn-sm">취소</button>
                </div></td>
              </>
            ) : (
              <>
                <td className="product-name">{user.name}</td>
                <td>{user.email}</td>
                <td><span className={`status-badge ${user.role === '관리자' ? 'admin' : 'neutral'}`}>{user.role}</span></td>
                <td><div className="cell-actions">
                  <button disabled={disabled} onClick={() => handleEditClick(user)} className="btn btn-light btn-sm">수정</button>
                  <button disabled={disabled} onClick={() => handleDeleteUser(user.id)} className="btn btn-outline-danger btn-sm">삭제</button>
                </div></td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
