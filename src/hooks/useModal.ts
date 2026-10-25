import { useState } from 'react';

// 1. 커스텀 훅은 반드시 'use'로 시작해야 합니다.
export default function useModal() {
  // 2. 여러 컴포넌트에서 중복되던 모달 상태 관리를 여기서 대신 해줍니다.
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // 3. 밖에서 이 훅을 호출하면, 상태값(isOpen)과 조작 함수(open, close)를 묶어서 리턴해줍니다.
  return { isOpen, openModal, closeModal };
}