export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title: string;
  description?: string;
  showClose?: boolean;
}

export type ToastContent = string | ToastOptions;

// 화면에 실제로 그려질 토스트 한 개의 데이터 형태
export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  showClose: boolean;
  duration: number;
}

// 뷰포트로 전달되는 내부 이벤트
// - show: 새 토스트 추가
// - hide: 특정 토스트 제거
type ToastEvent = { type: "show"; toast: ToastItem } | { type: "hide"; id: string };
type ToastListener = (event: ToastEvent) => void;

// 현재 등록된 구독자 목록(ToastViewport가 여기 등록됨)
const listeners = new Set<ToastListener>();

// 토스트 식별자 생성
// 가능한 환경에서는 randomUUID를 우선 사용하고, 없으면 폴백 문자열을 사용함
const createToastId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `toast-${crypto.randomUUID()}`;
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

// 이벤트를 모든 구독자에게 브로드캐스트
const emit = (event: ToastEvent) => {
  listeners.forEach((listener) => {
    listener(event);
  });
};

// 토스트 표시 이벤트 발행
const normalizeToastContent = (content: ToastContent) => {
  if (typeof content === "string") {
    return { title: content, showClose: true };
  }

  return { ...content, showClose: content.showClose ?? true };
};

const showToast = (type: ToastType, content: ToastContent, duration = 3000) => {
  emit({
    type: "show",
    toast: {
      id: createToastId(),
      type,
      ...normalizeToastContent(content),
      duration,
    },
  });
};

// 토스트 제거 이벤트 발행
const hideToast = (id: string) => {
  emit({ type: "hide", id });
};

// 구독 등록 후, 해제 함수(unsubscribe)를 반환
const subscribe = (listener: ToastListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

// 앱 전역에서 사용하는 토스트 공개 API
export const toast = {
  subscribe,
  showToast,
  hideToast,
  success: (content: ToastContent, duration?: number) => showToast("success", content, duration),
  error: (content: ToastContent, duration?: number) => showToast("error", content, duration),
  info: (content: ToastContent, duration?: number) => showToast("info", content, duration),
  warning: (content: ToastContent, duration?: number) => showToast("warning", content, duration),
};
