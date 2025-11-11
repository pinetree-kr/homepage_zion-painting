# CLAUDE.md - 프로젝트 관리 가이드

이 문서는 AI 어시스턴트(Claude)가 프로젝트를 이해하고 유지보수하는 데 필요한 정보를 담고 있습니다.

## 📋 프로젝트 개요

**프로젝트명**: 시온 페인팅 홈페이지 (Zion Painting Homepage)  
**프레임워크**: Next.js 15.4.6 (App Router)  
**언어**: TypeScript  
**스타일링**: Tailwind CSS 4  
**아키텍처**: Clean Feature-Sliced Design (FSD)

## 🏗️ 아키텍처 구조

이 프로젝트는 **Clean Feature-Sliced Design (FSD)** 아키텍처를 따릅니다.

자세한 내용은 [guide/ARCHITECTURE.md](./guide/ARCHITECTURE.md)를 참고하세요.

### 레이어 구조

```
src/
├── shared/      # 공유 레이어 - UI 컴포넌트, 유틸리티
├── entities/    # 엔티티 레이어 - 비즈니스 엔티티 타입
├── features/    # 기능 레이어 - 인증, 관리자 기능
├── widgets/     # 위젯 레이어 - 복합 컴포넌트
└── pages/       # 페이지 레이어 - 페이지 섹션 컴포넌트
```

### 레이어 간 의존성 규칙

```
Pages → Widgets → Features → Entities → Shared
```

- 하위 레이어는 상위 레이어를 import할 수 없음
- 상위 레이어는 하위 레이어를 import할 수 있음

## 📁 주요 디렉토리

### src/ 디렉토리

- **shared/**: 프로젝트 전반에서 사용되는 공통 코드
  - `ui/`: UI 컴포넌트 (Button, Card, Input, Dialog, Carousel 등)
  - `lib/`: 공유 유틸리티 함수

- **entities/**: 비즈니스 엔티티 타입 정의
  - `user/`: 사용자 및 회원 정보
  - `post/`: 게시글 (공지사항, Q&A, 견적문의, 후기)
  - `company/`: 회사 정보 및 연혁
  - `business/`: 사업 영역 및 성과
  - `product/`: 제품 정보
  - `contact/`: 연락처 정보
  - `system/`: 시스템 관련 (로그, 리소스 등)

- **features/**: 사용자 액션과 비즈니스 로직
  - `auth/`: 인증 기능 (로그인, 회원가입, 이메일 인증)
  - `admin/`: 관리자 기능 컴포넌트들

- **widgets/**: 독립적인 복합 컴포넌트
  - `header/`: 사이트 헤더
  - `footer/`: 사이트 푸터
  - `admin-layout/`: 관리자 페이지 레이아웃

- **pages/**: 페이지별 섹션 컴포넌트
  - `home/`: 홈 페이지 섹션들 (Hero, About, Business 등)

### app/ 디렉토리 (Next.js App Router)

- `(auth)/`: 인증 관련 라우트 그룹
- `(admin)/`: 관리자 페이지 라우트 그룹
- `components/`: `src/` 디렉토리의 컴포넌트를 re-export하는 진입점
  - `index.ts`: `@/src/shared/ui`와 `@/src/widgets/admin-layout`를 re-export
- `lib/`: 레거시 라이브러리 (src로 마이그레이션 완료)

**중요**: 
- `app/components/` 디렉토리는 단순히 `src/` 디렉토리의 컴포넌트를 re-export하는 역할만 수행합니다.
- 모든 실제 컴포넌트는 `src/` 디렉토리에 위치하며, FSD 아키텍처를 따릅니다.
- 레거시 파일들(`app/components/ui`, `app/components/admin`, `app/components/sections`, `app/components/layout`)은 모두 삭제되었습니다.

## 🔧 기술 스택

### 핵심 기술

- **Next.js 15.4.6**: React 프레임워크 (App Router)
- **React 19.1.0**: UI 라이브러리
- **TypeScript 5**: 타입 안정성
- **Tailwind CSS 4**: 유틸리티 기반 CSS

### 주요 라이브러리

- **@radix-ui**: 접근성 우선 UI 컴포넌트
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-select`
  - `@radix-ui/react-tabs`
- **embla-carousel-react**: Carousel 컴포넌트용 라이브러리
- **lucide-react**: 아이콘 라이브러리
- **sonner**: 토스트 알림
- **recharts**: 차트 라이브러리

### 배포 환경

- **Cloudflare**: `@opennextjs/cloudflare` 사용
- **Wrangler**: Cloudflare Workers 배포 도구

## 📝 Import 경로 규칙

### TypeScript 경로 Alias

```json
{
  "@/*": ["./*"]
}
```

### 사용 예시

```typescript
// Shared 레이어
import { Button, Card } from '@/src/shared/ui';

// Entities 레이어
import { User, Member } from '@/src/entities/user';
// 또는 통합 import
import { User, Post, Product } from '@/src/entities';

// Features 레이어
import { login, register, logout } from '@/src/features/auth';

// Widgets 레이어
import { Header } from '@/src/widgets/header';
import { AdminLayout } from '@/src/widgets/admin-layout';

// Pages 레이어
import { Hero, About, Business } from '@/src/pages/home';
```

## 🎯 코딩 컨벤션

### 파일 명명 규칙

- **컴포넌트**: `PascalCase.tsx` (예: `Header.tsx`, `AdminLayout.tsx`)
- **유틸리티**: `camelCase.ts` (예: `auth.ts`, `utils.ts`)
- **타입**: `types.ts` 또는 `model/types.ts`
- **Public API**: `index.ts` (각 슬라이스의 진입점)

### 컴포넌트 구조

각 슬라이스(기능 단위)는 다음과 같은 구조를 따릅니다:

```
feature-name/
├── ui/              # UI 컴포넌트 (선택적)
├── model/           # 비즈니스 로직 및 타입 (선택적)
├── api/             # API 호출 (선택적)
└── index.ts         # Public API (필수)
```

### Public API 패턴

각 슬라이스는 `index.ts`를 통해 Public API를 제공합니다:

```typescript
// entities/user/index.ts
export type { User, Member } from './model/types';

// 사용 시
import { User, Member } from '@/src/entities/user';
// 내부 구조를 직접 import하지 않음
```

## 🔍 주요 기능

### 인증 시스템

- **위치**: `src/features/auth/`
- **기능**:
  - 로그인 (`login`)
  - 회원가입 (`register`)
  - 로그아웃 (`logout`)
  - 현재 사용자 조회 (`getCurrentUser`)
  - 관리자 확인 (`isAdmin`)
  - 이메일 인증 (`verifyEmail`)

**참고**: 현재는 localStorage 기반의 모의 인증 시스템입니다. 실제 프로덕션에서는 서버 기반 인증으로 교체해야 합니다.

### 관리자 시스템

- **위치**: `src/features/admin/`
- **주요 컴포넌트**:
  - `AdminLayout`: 관리자 페이지 레이아웃
  - `AdminManagement`: 관리자 관리
  - `MemberManagement`: 회원 관리
  - `BoardManagement`: 게시판 관리 (공지사항, Q&A, 견적문의, 후기)
  - `BusinessInfo`: 사업 정보 관리
  - `CompanyInfo`: 회사 정보 관리
  - `ProductsAdmin`: 제품 관리
  - `ContactInfo`: 연락처 정보 관리
  - `LogManagement`: 로그 관리
  - `ResourceMonitor`: 리소스 모니터링

### 홈페이지 섹션

- **위치**: `src/pages/home/`
- **섹션**:
  - `Hero`: 메인 히어로 섹션 (Carousel UI 포함)
  - `About`: 회사 소개
  - `Business`: 사업 소개
  - `Products`: 제품 소개
  - `Contact`: 연락처
  - `Footer`: 푸터

## 🚀 개발 가이드

### 새 기능 추가 시

1. **엔티티 추가**
   ```bash
   src/entities/new-entity/
   ├── model/
   │   └── types.ts
   └── index.ts
   ```

2. **기능 추가**
   ```bash
   src/features/new-feature/
   ├── model/
   │   └── feature.ts
   ├── ui/          # 필요시
   └── index.ts
   ```

3. **위젯 추가**
   ```bash
   src/widgets/new-widget/
   ├── ui/
   │   └── NewWidget.tsx
   └── index.ts
   ```

### Import 규칙 확인

새로운 파일을 추가할 때는 다음을 확인하세요:

1. ✅ 레이어 간 의존성 규칙 준수
2. ✅ Public API를 통한 export (`index.ts`)
3. ✅ 절대 경로 사용 (`@/src/*`)
4. ✅ 필요한 것만 import (트리 쉐이킹)

## 🐛 문제 해결

### 일반적인 문제

1. **Import 오류**
   - `tsconfig.json`의 경로 alias 확인
   - Public API (`index.ts`)에서 export 확인
   - 레이어 간 의존성 규칙 확인

2. **타입 오류**
   - Entities의 타입 정의 확인
   - TypeScript 버전 호환성 확인

3. **빌드 오류**
   - Next.js 버전 확인
   - 의존성 버전 충돌 확인

### 디버깅 명령어

```bash
# 타입 체크
npx tsc --noEmit

# 린트 체크
npm run lint

# 빌드 테스트
npm run build
```

## 📚 참고 문서

- [아키텍처 가이드](./guide/ARCHITECTURE.md) - 상세한 아키텍처 설명
- [Next.js 문서](https://nextjs.org/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)

## 🔄 마이그레이션 상태

### 완료된 작업

- ✅ Clean FSD 아키텍처 적용
- ✅ `src/` 디렉토리 구조 생성
- ✅ Entities 레이어 구성
- ✅ Features 레이어 구성
- ✅ Widgets 레이어 구성
- ✅ Pages 레이어 구성
- ✅ App Router에서 re-export 설정
- ✅ TypeScript 경로 alias 설정
- ✅ 모든 import 경로 업데이트
- ✅ 레거시 컴포넌트 정리 완료
  - `app/components/ui/` 삭제 → `src/shared/ui/`로 통합
  - `app/components/admin/` 삭제 → `src/features/admin/ui/`로 통합
  - `app/components/sections/` 삭제 → `src/pages/home/`로 통합
  - `app/components/layout/` 삭제 → `src/shared/ui/`로 통합
- ✅ Carousel UI 컴포넌트 추가 (`src/shared/ui/Carousel.tsx`)
- ✅ Hero 섹션에 Carousel 적용

### 향후 개선 사항

- [ ] 인증 시스템을 서버 기반으로 마이그레이션
- [ ] API 레이어 추가 (서버 통신)
- [ ] 테스트 코드 추가
- [ ] Storybook 통합 (선택적)

## 💡 AI 어시스턴트를 위한 참고사항

### 코드 수정 시 주의사항

1. **레이어 의존성**: 항상 레이어 간 의존성 규칙을 확인하세요
2. **Public API**: 내부 구조를 직접 import하지 말고 `index.ts`를 통해 export된 것만 사용하세요
3. **타입 안정성**: Entities의 타입 정의를 변경할 때는 영향받는 모든 파일을 확인하세요
4. **일관성**: 기존 코드 스타일과 패턴을 따르세요

### 자주 사용되는 패턴

```typescript
// Entity 타입 정의
export interface EntityName {
  id: string;
  // ...
}

// Feature 함수
export function featureFunction(): ReturnType {
  // ...
}

// Widget 컴포넌트
export default function WidgetName() {
  // ...
}

// Public API
export type { EntityName } from './model/types';
export { featureFunction } from './model/feature';
export { default as WidgetName } from './ui/WidgetName';
```

---

**마지막 업데이트**: 2024년  
**문서 버전**: 1.0.0

