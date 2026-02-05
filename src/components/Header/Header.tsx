"use client";

import { LoginModal } from "@/components/LoginModal/LoginModal";
import { useLoginModal } from "@/hooks/useLoginModal";

/**
 * Header - 공통 헤더/네비게이션
 *
 * TODO(이경환): 디자인 확정 후 구현
 * - 로고
 * - 네비게이션 메뉴
 * - 로그인/로그아웃 버튼
 */
export function Header() {
  const { isOpen, openModal, closeModal, handleLogin, from, error } = useLoginModal();

  return (
    <>
      <header className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>Header placeholder</div>

          {/* 로그인 버튼 */}
          <button
            onClick={openModal}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            로그인
          </button>
        </div>

        {/* 에러 표시 */}
        {error && <div className="mt-2 rounded bg-red-100 p-2 text-red-700"></div>}
      </header>

      {/* 로그인 모달 */}
      <LoginModal isOpen={isOpen} onClose={closeModal} onLogin={handleLogin} from={from} />
    </>
  );
}
