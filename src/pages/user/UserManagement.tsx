import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../api/client';
import { getApiErrorMessage } from '../../api/error';
import Modal from '../../common/components/Modal';
import UserSearchBar from './components/UserSearchBar';
import UserTable from './components/UserTable';
import type { User } from './components/UserTable';
import PageHeader from '../../common/components/PageHeader';
import TablePanel from '../../common/components/TablePanel';
import Feedback from '../../common/components/Feedback';
import useModal from '../../hooks/useModal';

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    // 렌더링 전에 연속 클릭해도 중복 변경 요청을 전송하지 않습니다.
    const mutationLock = useRef(false);
    const listVersion = useRef(0);
    const { isOpen: isModalOpen, openModal, closeModal } = useModal();
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('일반회원');
    const [newPassword, setNewPassword] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('일반회원');

    const loadUsers = useCallback(async (name = '') => {
        const version = ++listVersion.current;
        setIsLoading(true);
        setLoadError(null);
        try {
            const response = await apiClient.get<User[]>('/users', { params: { name } });
            if (version === listVersion.current) setUsers(response.data);
        } catch (error) {
            if (version === listVersion.current) setLoadError(getApiErrorMessage(error, '회원 목록을 불러오지 못했습니다.'));
        } finally {
            if (version === listVersion.current) setIsLoading(false);
        }
    }, []);

    const invalidateUserRequests = useCallback(() => { listVersion.current++; }, []);
    useEffect(() => {
        void loadUsers();
        return invalidateUserRequests;
    }, [loadUsers, invalidateUserRequests]);

    const handleSearch = () => { if (!mutationLock.current) void loadUsers(searchTerm.trim()); };
    const filteredUsers = users; // 서버 검색 결과를 입력 중인 검색어로 다시 필터링하지 않습니다.

    const handleAddUser = async () => {
        if (mutationLock.current) return;
        if (!newName.trim() || !newEmail.trim()) { window.alert('이름과 이메일을 입력해 주세요.'); return; }
        if (!newPassword.trim() || newPassword.length < 12 || newPassword.length > 64
            || new TextEncoder().encode(newPassword).length > 72) {
            window.alert('비밀번호는 12~64자, UTF-8 기준 72바이트 이하여야 합니다.'); return;
        }
        mutationLock.current = true;
        setIsCreating(true);
        try {
            await apiClient.post<User>('/users', { name: newName.trim(), email: newEmail.trim(), role: newRole, password: newPassword });
            setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('일반회원');
            closeModal();
            await loadUsers(searchTerm.trim());
        } catch (error) {
            window.alert(getApiErrorMessage(error, '회원 등록에 실패했습니다.'));
        } finally { mutationLock.current = false; setIsCreating(false); }
    };

    const handleDeleteUser = async (id: number) => {
        if (mutationLock.current || !window.confirm('정말 삭제하시겠습니까?')) return;
        mutationLock.current = true;
        setIsMutating(true);
        try {
            await apiClient.delete(`/users/${id}`);
            await loadUsers(searchTerm.trim());
        } catch (error) {
            window.alert(getApiErrorMessage(error, '회원 삭제에 실패했습니다.'));
        } finally { mutationLock.current = false; setIsMutating(false); }
    };

    const handleSaveEdit = async (id: number) => {
        if (mutationLock.current) return;
        if (!editName.trim() || editName.trim().length > 50 || !editEmail.trim() || editEmail.trim().length > 100) {
            window.alert('이름(최대 50자)과 이메일(최대 100자)을 확인해 주세요.'); return;
        }
        mutationLock.current = true;
        setIsMutating(true);
        try {
            await apiClient.put<User>(`/users/${id}`, { name: editName.trim(), email: editEmail.trim(), role: editRole });
            setEditingId(null);
            await loadUsers(searchTerm.trim());
        } catch (error) {
            window.alert(getApiErrorMessage(error, '회원 수정에 실패했습니다.'));
        } finally { mutationLock.current = false; setIsMutating(false); }
    };

    const handleEditClick = (user: User) => {
        if (mutationLock.current) return;
        setEditingId(user.id); setEditName(user.name); setEditEmail(user.email); setEditRole(user.role);
    };

    const handleCloseCreateModal = () => {
        if (mutationLock.current) return;
        setNewPassword('');
        closeModal();
    };

    return <section>
      <PageHeader title="회원 관리" description="회원 정보를 조회하고 서비스 이용 권한을 관리하세요."
        actions={<button className="btn btn-primary" onClick={openModal} disabled={isCreating || isMutating}>＋ 회원 등록</button>} />
      <UserSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} disabled={isLoading || isCreating || isMutating} />
      <TablePanel title="회원 목록" count={!isLoading && !loadError ? filteredUsers.length : undefined}
        footer={<span>회원 권한 변경은 신중하게 진행해 주세요. 자기 계정 삭제 및 관리자 권한 해제는 제한됩니다.</span>}>
        {isLoading ? <Feedback kind="loading">회원 목록을 불러오는 중입니다.</Feedback>
          : loadError ? <Feedback kind="error">{loadError}</Feedback>
          : filteredUsers.length === 0 ? <Feedback>검색 조건에 맞는 회원이 없습니다.</Feedback>
          : <UserTable users={filteredUsers} editingId={editingId} editName={editName} editEmail={editEmail} editRole={editRole}
              setEditName={setEditName} setEditEmail={setEditEmail} setEditRole={setEditRole} setEditingId={setEditingId}
              handleEditClick={handleEditClick} handleSaveEdit={handleSaveEdit} handleDeleteUser={handleDeleteUser} disabled={isMutating || isCreating} />}
      </TablePanel>
      <Modal isOpen={isModalOpen} onClose={handleCloseCreateModal} busy={isCreating}
        title="새 회원 등록" description="서비스를 이용할 회원의 기본정보를 입력해 주세요.">
        <form onSubmit={(event) => { event.preventDefault(); void handleAddUser(); }}>
          <fieldset className="form-stack" disabled={isCreating}>
            <label className="field"><span>이름</span><input className="form-control" required maxLength={50} placeholder="회원 이름" value={newName} onChange={event => setNewName(event.target.value)} /></label>
            <label className="field"><span>이메일</span><input className="form-control" type="email" required maxLength={100} placeholder="name@example.com" value={newEmail} onChange={event => setNewEmail(event.target.value)} /></label>
            <label className="field"><span>비밀번호</span><input className="form-control" type="password" required minLength={12} maxLength={64} autoComplete="new-password" placeholder="12~64자로 입력"
              value={newPassword} onChange={event => setNewPassword(event.target.value)} />
              <small className="field-hint">UTF-8 기준 최대 72바이트까지 입력할 수 있습니다.</small></label>
            <label className="field"><span>회원 구분</span><select className="form-select" value={newRole} onChange={event => setNewRole(event.target.value)}>
              <option value="일반회원">일반회원</option><option value="우수회원">우수회원</option><option value="관리자">관리자</option><option value="체험관리자">체험관리자</option>
            </select></label>
          </fieldset>
          <div className="form-actions">
            <button className="btn btn-light" type="button" disabled={isCreating} onClick={handleCloseCreateModal}>취소</button>
            <button className="btn btn-primary" type="submit" disabled={isCreating}>{isCreating ? '등록 중...' : '회원 등록'}</button>
          </div>
        </form>
      </Modal>
    </section>;
}
