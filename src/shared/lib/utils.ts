import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// dayjs 플러그인 및 로케일 설정
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');

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
 * 날짜 문자열을 포맷팅 (dayjs 사용)
 * @param dateString 날짜 문자열
 * @param format 포맷 문자열 (기본값: 'YYYY-MM-DD HH:mm')
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(dateString: string | null | undefined, format: string = 'YYYY-MM-DD HH:mm'): string {
  if (!dateString) return '-';
  try {
    return dayjs(dateString).format(format);
  } catch {
    return dateString;
  }
}

/**
 * 날짜 문자열을 한국어 형식으로 포맷팅
 * @param dateString 날짜 문자열
 * @param includeTime 시간 포함 여부 (기본값: true)
 * @returns 포맷된 날짜 문자열 (예: "2024-01-01 12:00")
 */
export function formatDateKorean(dateString: string | null | undefined, includeTime: boolean = true): string {
  if (!dateString) return '-';
  try {
    const format = includeTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    return dayjs(dateString).format(format);
  } catch {
    return dateString;
  }
}

/**
 * 날짜 문자열을 상세 형식으로 포맷팅 (초 포함)
 * @param dateString 날짜 문자열
 * @returns 포맷된 날짜 문자열 (예: "2024-01-01 12:00:00")
 */
export function formatDateDetailed(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
  } catch {
    return dateString;
  }
}

/**
 * 날짜 문자열을 간단한 형식으로 포맷팅 (날짜만)
 * @param dateString 날짜 문자열
 * @returns 포맷된 날짜 문자열 (예: "2024.01.01")
 */
export function formatDateSimple(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return dayjs(dateString).format('YYYY.MM.DD');
  } catch {
    return dateString;
  }
}

/**
 * 현재 날짜/시간을 ISO 문자열로 반환
 * @returns ISO 문자열
 */
export function getCurrentISOString(): string {
  return dayjs().toISOString();
}

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns 날짜 문자열
 */
export function getCurrentDateString(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * 날짜에서 N일 전/후 계산
 * @param dateString 기준 날짜 문자열
 * @param days 더할/뺄 일수 (음수면 과거)
 * @returns 계산된 날짜의 ISO 문자열
 */
export function addDays(dateString: string | null | undefined, days: number): string {
  if (!dateString) return getCurrentISOString();
  try {
    return dayjs(dateString).add(days, 'day').toISOString();
  } catch {
    return getCurrentISOString();
  }
}

/**
 * 오늘 시작 시간 (00:00:00)을 ISO 문자열로 반환
 * @returns ISO 문자열
 */
export function getTodayStartISOString(): string {
  return dayjs().startOf('day').toISOString();
}

/**
 * N일 전 날짜의 시작 시간을 ISO 문자열로 반환
 * @param days 며칠 전인지 (기본값: 7)
 * @returns ISO 문자열
 */
export function getDaysAgoStartISOString(days: number = 7): string {
  return dayjs().subtract(days, 'day').startOf('day').toISOString();
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

/**
 * 문자열을 해시하여 숫자로 변환
 * UUID와 같은 형식의 문자열에 최적화된 해시 함수
 * sdbm 해시 알고리즘 사용 (더 나은 분산)
 */
function hashString(str: string): number {
  // UUID의 경우 하이픈을 제거하여 더 나은 해시 분산
  const normalized = str.replace(/-/g, '');
  
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    // sdbm 해시 알고리즘: 더 나은 분산을 제공
    hash = char + (hash << 6) + (hash << 16) - hash;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash);
}

/**
 * 사용자ID 기준으로 해시하여 RGB 색상을 생성
 * @param userId 사용자ID
 * @returns RGB 색상 객체 { r: number, g: number, b: number }
 */
export function generateUserColor(userId: string | null | undefined): { r: number; g: number; b: number } {
  // 기본 색상 (현재 사용 중인 그라데이션의 중간 색상)
  const defaultColor = { r: 26, g: 44, b: 109 }; // #1A2C6D

  if (!userId || userId.trim() === '') {
    return defaultColor;
  }

  const hash = hashString(userId.trim().toLowerCase());
  
  // 해시 값을 여러 방식으로 분산하여 색상 차이를 극대화
  // 비트 시프트와 모듈로 연산을 조합하여 hue, saturation, lightness를 독립적으로 계산
  const hash1 = hash;
  const hash2 = (hash << 13) ^ hash; // 비트 시프트로 다른 값 생성
  const hash3 = (hash >> 7) ^ hash;  // 다른 방향 시프트
  
  // HSL 색상 공간을 사용하여 더 일관된 색상 생성
  // Hue: 0-350도 (10도 간격 스텝, 36단계)
  // Saturation: 45-95% (5% 간격 스텝: 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95)
  // Lightness: 30-70% (5% 간격 스텝: 30, 35, 40, 45, 50, 55, 60, 65, 70)
  
  // Hue: 0-350도 범위를 10도 간격의 36단계로 구분
  const hueSteps = Array.from({ length: 72 }, (_, i) => i * 5); // [0, 5, 10, ..., 350]
  const hueIndex = Math.abs(hash1) % hueSteps.length;
  const hue = hueSteps[hueIndex];
  
  // Saturation: 45-95% 범위를 5% 간격의 11단계로 구분
  const saturationSteps = [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
  const saturationIndex = Math.abs(hash2) % saturationSteps.length;
  const saturation = saturationSteps[saturationIndex];
  
  // Lightness: 30-70% 범위를 5% 간격의 9단계로 구분
  const lightnessSteps = [30, 35, 40, 45, 50, 55, 60, 65, 70];
  const lightnessIndex = Math.abs(hash3) % lightnessSteps.length;
  const lightness = lightnessSteps[lightnessIndex];

  // HSL을 RGB로 변환
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 1 / 6) {
    r = c; g = x; b = 0;
  } else if (h < 2 / 6) {
    r = x; g = c; b = 0;
  } else if (h < 3 / 6) {
    r = 0; g = c; b = x;
  } else if (h < 4 / 6) {
    r = 0; g = x; b = c;
  } else if (h < 5 / 6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * RGB 색상을 CSS 색상 문자열로 변환
 * @param rgb RGB 색상 객체
 * @returns CSS 색상 문자열 (예: "rgb(26, 44, 109)")
 */
export function rgbToCss(rgb: { r: number; g: number; b: number }): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * RGB 색상을 더 밝은 버전으로 변환 (그라데이션 끝 색상용)
 * @param rgb 원본 RGB 색상
 * @param factor 밝기 증가 비율 (0-1, 기본값: 0.3)
 * @returns 더 밝은 RGB 색상
 */
export function lightenRgb(rgb: { r: number; g: number; b: number }, factor: number = 0.3): { r: number; g: number; b: number } {
  return {
    r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
    g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
    b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor)),
  };
}   