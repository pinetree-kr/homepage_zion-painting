export function getScrollbarWidth(): number {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);

  const scrollbarWidth = (outer.offsetWidth - outer.clientWidth);

  outer.parentNode?.removeChild?.(outer);
  return scrollbarWidth;
}

/**
 * 전화번호에서 하이픈과 공백을 제거하고 숫자만 추출
 * 국가번호가 없으면 +82를 추가 (한국 전화번호 가정)
 */
export function formatPhoneForStorage(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // 하이픈, 공백, 괄호 제거
  const cleaned = phone.replace(/[-\s()]/g, '');

  // 숫자만 추출
  const digits = cleaned.replace(/\D/g, '');

  if (!digits) return null;

  // 이미 국가번호가 포함되어 있는지 확인 (+82, 82, 0082 등)
  if (digits.startsWith('82') && digits.length >= 10) {
    // 82로 시작하는 경우 +82로 통일
    return `+${digits}`;
  } else if (digits.startsWith('0082')) {
    // 0082로 시작하는 경우 +82로 변환
    return `+82${digits.slice(4)}`;
  } else if (digits.startsWith('0')) {
    // 0으로 시작하는 경우 (한국 내선번호) 0을 제거하고 +82 추가
    return `+82${digits.slice(1)}`;
  } else if (digits.length >= 9 && digits.length <= 11) {
    // 국가번호가 없는 한국 전화번호인 경우 +82 추가
    return `+82${digits}`;
  }

  // 이미 +로 시작하는 경우 그대로 반환
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  return digits;
}

/**
 * 저장된 전화번호를 한국식 형식으로 표시 (하이픈 자동 채움)
 * 010-1234-5678 형식으로 변환 (국가번호 없이 한국 내선번호 형식)
 */
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return '';

  // 하이픈, 공백 제거
  let cleaned = phone.replace(/[-\s]/g, '');

  // +82 또는 82로 시작하는 경우 처리
  if (cleaned.startsWith('+82')) {
    cleaned = cleaned.slice(3); // +82 제거
  } else if (cleaned.startsWith('82')) {
    cleaned = cleaned.slice(2); // 82 제거
  } else if (cleaned.startsWith('0082')) {
    cleaned = cleaned.slice(4); // 0082 제거
  }

  // 숫자만 추출
  const digits = cleaned.replace(/\D/g, '');

  if (!digits) return phone; // 숫자가 없으면 원본 반환

  // 0으로 시작하지 않으면 0을 앞에 추가 (한국 내선번호 형식)
  let normalizedDigits = digits;
  if (!digits.startsWith('0') && digits.length >= 9 && digits.length <= 11) {
    normalizedDigits = '0' + digits;
  }

  // 한국 전화번호 형식으로 포맷팅
  if (normalizedDigits.length === 10) {
    // 일반 전화번호: 02-1234-5678, 031-123-4567
    if (normalizedDigits.startsWith('02')) {
      // 서울 지역번호
      return `${normalizedDigits.slice(0, 2)}-${normalizedDigits.slice(2, 6)}-${normalizedDigits.slice(6)}`;
    } else if (normalizedDigits.startsWith('0')) {
      // 기타 지역번호 (031, 032, 041 등)
      const areaCode = normalizedDigits.slice(0, 3);
      const middle = normalizedDigits.slice(3, 6);
      const last = normalizedDigits.slice(6);
      return `${areaCode}-${middle}-${last}`;
    }
  } else if (normalizedDigits.length === 11) {
    // 휴대전화: 010-1234-5678
    if (normalizedDigits.startsWith('010') || normalizedDigits.startsWith('011') || normalizedDigits.startsWith('016') ||
      normalizedDigits.startsWith('017') || normalizedDigits.startsWith('018') || normalizedDigits.startsWith('019')) {
      // 휴대전화
      return `${normalizedDigits.slice(0, 3)}-${normalizedDigits.slice(3, 7)}-${normalizedDigits.slice(7)}`;
    } else if (normalizedDigits.startsWith('0')) {
      // 기타 11자리 번호
      const areaCode = normalizedDigits.slice(0, 3);
      const middle = normalizedDigits.slice(3, 7);
      const last = normalizedDigits.slice(7);
      return `${areaCode}-${middle}-${last}`;
    }
  } else if (normalizedDigits.length === 9) {
    // 1588, 1544 등 특수번호
    if (normalizedDigits.startsWith('015') || normalizedDigits.startsWith('016')) {
      return `${normalizedDigits.slice(0, 4)}-${normalizedDigits.slice(4)}`;
    } else if (normalizedDigits.startsWith('1588') || normalizedDigits.startsWith('1544')) {
      return `${normalizedDigits.slice(0, 4)}-${normalizedDigits.slice(4)}`;
    }
  }

  // 형식에 맞지 않는 경우 원본 반환
  return phone;
}

/**
 * 입력 중인 전화번호를 실시간으로 포맷팅 (한국식)
 * 사용자가 입력하는 동안 하이픈을 자동으로 추가
 * 백스페이스 입력을 자연스럽게 처리
 */
export function formatPhoneOnInput(value: string, previousValue?: string): string {
  // 숫자와 하이픈만 허용
  const cleaned = value.replace(/[^\d-]/g, '');

  // 하이픈 제거 후 숫자만 추출
  const digits = cleaned.replace(/-/g, '');

  // 빈 값이면 빈 문자열 반환
  if (!digits) return '';

  // 이전 값과 비교하여 백스페이스인지 확인
  const prevDigits = previousValue ? previousValue.replace(/[^\d]/g, '') : '';
  const isBackspace = digits.length < prevDigits.length;

  // 백스페이스이고 하이픈 직전이면 하이픈도 함께 제거
  if (isBackspace && cleaned.endsWith('-')) {
    return cleaned.slice(0, -1);
  }

  // 0으로 시작하는 경우 (한국 내선번호)
  if (digits.startsWith('0')) {
    if (digits.length <= 2) {
      return digits;
    } else if (digits.startsWith('02')) {
      if (digits.length <= 6) {
        // 서울: 02-1234
        return `02-${digits.slice(2)}`;
      } else if (digits.length <= 10) {
        // 서울: 02-1234-5678
        return `02-${digits.slice(2, 6)}-${digits.slice(6)}`;
      }
    } else if (digits.startsWith('010') || digits.startsWith('011') ||
      digits.startsWith('016') || digits.startsWith('017') ||
      digits.startsWith('018') || digits.startsWith('019')) {
      if (digits.length <= 7) {
        // 휴대전화: 010-1234
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else if (digits.length <= 11) {
        // 휴대전화: 010-1234-5678
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      }
    } else if (digits.length <= 3) {
      // 지역번호만 입력
      return digits;
    } else if (digits.length <= 6) {
      // 지역번호-국번
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      // 지역번호-국번-번호
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length <= 11) {
      // 지역번호-국번-번호 (11자리)
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
  } else if (digits.startsWith('82')) {
    // 국가번호 포함 (+82 또는 82)
    const withoutCountry = digits.slice(2);
    if (withoutCountry.startsWith('2')) {
      if (withoutCountry.length <= 5) {
        // 서울: 82-2-1234
        return `+82-2-${withoutCountry.slice(1)}`;
      } else if (withoutCountry.length <= 9) {
        // 서울: 82-2-1234-5678
        return `+82-2-${withoutCountry.slice(1, 5)}-${withoutCountry.slice(5)}`;
      }
    } else if (withoutCountry.startsWith('10') || withoutCountry.startsWith('11') ||
      withoutCountry.startsWith('16') || withoutCountry.startsWith('17') ||
      withoutCountry.startsWith('18') || withoutCountry.startsWith('19')) {
      if (withoutCountry.length <= 6) {
        // 휴대전화: 82-10-1234
        return `+82-${withoutCountry.slice(0, 2)}-${withoutCountry.slice(2)}`;
      } else if (withoutCountry.length <= 10) {
        // 휴대전화: 82-10-1234-5678
        return `+82-${withoutCountry.slice(0, 2)}-${withoutCountry.slice(2, 6)}-${withoutCountry.slice(6)}`;
      }
    } else if (withoutCountry.length <= 3) {
      // 지역번호만
      return `+82-${withoutCountry}`;
    } else if (withoutCountry.length <= 6) {
      // 지역번호-국번
      return `+82-${withoutCountry.slice(0, 3)}-${withoutCountry.slice(3)}`;
    } else if (withoutCountry.length <= 10) {
      // 지역번호-국번-번호
      return `+82-${withoutCountry.slice(0, 3)}-${withoutCountry.slice(3, 6)}-${withoutCountry.slice(6)}`;
    }
  }

  // 기본: 하이픈 없이 반환
  return digits;
}   