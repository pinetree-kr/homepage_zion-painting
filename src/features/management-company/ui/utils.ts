// 클라이언트 사이드에서만 실행되는 UUID 생성 함수
export function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for older browsers - 클라이언트에서만 실행됨
  if (typeof window !== 'undefined') {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  // SSR 시에는 빈 문자열 반환 (useEffect에서 처리)
  return '';
}

