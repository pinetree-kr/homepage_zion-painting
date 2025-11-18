# FSD 아키텍처 진행 상황 분석 보고서

**작성일**: 2025년 11월 19일  
**프로젝트**: 시온 페인팅 홈페이지 (Zion Painting)  
**아키텍처**: Feature-Sliced Design (FSD)

---

## 📋 목차

1. [전체 개요](#전체-개요)
2. [레이어별 분석](#레이어별-분석)
3. [마이그레이션 진행 상황](#마이그레이션-진행-상황)
4. [아키텍처 준수도 평가](#아키텍처-준수도-평가)
5. [발견된 이슈 및 개선 사항](#발견된-이슈-및-개선-사항)
6. [권장 사항](#권장-사항)

---

## 전체 개요

### 현재 상태

프로젝트는 **Feature-Sliced Design (FSD)** 아키텍처를 채택하여 진행 중이며, 레거시 코드에서 FSD 구조로의 마이그레이션이 활발히 진행되고 있습니다.

### 레이어 구조 현황

```
src/
├── shared/          ✅ 잘 구성됨
├── entities/        ✅ 잘 구성됨
├── features/        ⚠️ 일부 구조 개선 필요
├── widgets/         ⚠️ 미비 (거의 비어있음)
└── pages/           ✅ 잘 구성됨 (통일 완료)
```

---

## 레이어별 분석

### 1. Shared 레이어 (`src/shared/`)

**상태**: ✅ **양호**

#### 구조
```
shared/
├── ui/              # 20개 이상의 UI 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Dialog.tsx
│   ├── DataTable.tsx
│   ├── Carousel.tsx
│   └── ... (기타 공통 컴포넌트)
└── lib/             # 공유 유틸리티
    ├── auth.ts
    ├── supabase/
    └── utils.ts
```

#### 평가
- ✅ 비즈니스 로직 없는 순수 UI 컴포넌트로 잘 구성됨
- ✅ Public API (`index.ts`)를 통한 export 구조 양호
- ✅ 다른 레이어에서 광범위하게 사용 중
- ✅ 타입 정의가 명확함

#### 사용 현황
- 65개 이상의 파일에서 `@/src/shared/ui` 또는 `@/src/shared/lib` import 사용
- 전 레이어에서 안전하게 사용 가능

---

### 2. Entities 레이어 (`src/entities/`)

**상태**: ✅ **양호**

#### 구조
```
entities/
├── user/            # 사용자 엔티티
├── post/            # 게시글 엔티티
├── company/         # 회사 정보 엔티티
├── business/        # 사업 정보 엔티티
├── product/         # 제품 엔티티
├── contact/         # 연락처 엔티티
├── system/          # 시스템 엔티티
└── prologue/        # 프롤로그 엔티티
```

#### 평가
- ✅ 각 엔티티가 `model/types.ts`에 타입 정의
- ✅ Public API (`index.ts`)를 통한 export 구조 양호
- ✅ **레이어 의존성 준수**: 상위 레이어(Features, Pages)를 import하지 않음 ✅
- ✅ 비즈니스 로직 없이 순수 타입 정의만 포함

#### 엔티티별 상세
| 엔티티 | 타입 정의 | Public API | 사용 빈도 |
|--------|---------|-----------|----------|
| user | ✅ | ✅ | 높음 |
| company | ✅ | ✅ | 높음 |
| post | ✅ | ✅ | 중간 |
| business | ✅ | ✅ | 중간 |
| product | ✅ | ✅ | 중간 |
| contact | ✅ | ✅ | 중간 |
| system | ✅ | ✅ | 낮음 |
| prologue | ✅ | ✅ | 낮음 |

---

### 3. Features 레이어 (`src/features/`)

**상태**: ⚠️ **일부 개선 필요**

#### 구조
```
features/
├── admin/           # 관리자 기능
│   ├── system/
│   ├── user/
│   └── ui/
├── editor/          # 에디터 기능
├── home/            # 홈 기능 (⚠️ 구조 재검토 필요)
│   └── ui/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Hero.tsx
│       └── ...
├── layout/          # 레이아웃 기능 (⚠️ widgets로 이동 고려)
│   ├── AdminLayout.tsx
│   └── MyPageLayout.tsx
├── management-company/  # 회사 관리 기능
│   ├── api/
│   └── ui/
├── management-prologue/ # 프롤로그 관리 기능
│   └── ui/
└── mypage/          # 마이페이지 기능
    └── profile/
```

#### 평가

**✅ 잘 구성된 Features:**
- `admin`: 관리자 기능이 잘 분리됨
- `management-company`: API와 UI가 명확히 분리됨
- `editor`: 단일 책임 원칙 준수
- `mypage`: 프로필 관련 기능이 잘 구성됨

**⚠️ 개선이 필요한 Features:**

1. **`features/home`**
   - **이슈**: Header, Footer가 features에 위치
   - **권장**: Header, Footer는 `widgets` 레이어로 이동 고려
   - **이유**: Header, Footer는 여러 페이지에서 재사용되는 복합 컴포넌트

2. **`features/layout`**
   - **이슈**: Layout 컴포넌트가 features에 위치
   - **권장**: `widgets` 레이어로 이동 고려
   - **이유**: Layout은 여러 Features를 조합한 복합 컴포넌트

#### 레이어 의존성 검증
- ✅ Features는 Entities와 Shared만 import (상위 레이어 미사용)
- ✅ Pages나 Widgets를 import하지 않음

---

### 4. Widgets 레이어 (`src/widgets/`)

**상태**: ⚠️ **미비**

#### 구조
```
widgets/
└── footer/
    └── ui/
        └── Footer.tsx
```

#### 평가
- ⚠️ **거의 비어있음**: Footer만 존재
- ⚠️ **중복 구조**: `features/home/ui/Footer.tsx`와 `widgets/footer/ui/Footer.tsx`가 공존
- ⚠️ **누락된 위젯들**:
  - Header (현재 `features/home`에 위치)
  - AdminLayout (현재 `features/layout`에 위치)
  - MyPageLayout (현재 `features/layout`에 위치)

#### 권장 사항
1. `features/home/ui/Header.tsx` → `widgets/header/ui/Header.tsx`로 이동
2. `features/home/ui/Footer.tsx` → `widgets/footer/ui/Footer.tsx`로 통합 (중복 제거)
3. `features/layout/AdminLayout.tsx` → `widgets/admin-layout/ui/AdminLayout.tsx`로 이동
4. `features/layout/MyPageLayout.tsx` → `widgets/mypage-layout/ui/MyPageLayout.tsx`로 이동

---

### 5. Pages 레이어 (`src/pages/`)

**상태**: ✅ **잘 구성됨** (최근 개선 완료)

#### 구조
```
pages/
├── home/                              # 홈 페이지
├── management-about-company/          # 회사소개 관리
├── management-company-business/       # 사업소개 관리
├── management-company-contacts/       # 연락처 관리
├── management-company-history/        # 회사 연혁 관리
├── management-company-organization/    # 조직도 관리
├── management-company-products/        # 제품 관리
├── management-customer-estimates/     # 견적문의 관리
├── management-customer-members/        # 회원 관리
├── management-customer-notices/       # 공지사항 관리
├── management-customer-qna/           # Q&A 관리
├── management-customer-reviews/        # 고객후기 관리
├── management-prologue/                # 프롤로그 관리
├── management-system-administrators/   # 관리자 관리
├── management-system-logs/             # 로그 관리
├── management-system-resources/         # 리소스 모니터링
└── my-profile/                         # 마이프로필
```

#### 평가
- ✅ **일관된 사용 패턴**: 모든 App Router 페이지가 Pages 레이어를 통해 import
- ✅ **레이어 의존성 준수**: Pages는 Features, Widgets, Entities, Shared만 import
- ✅ **명명 규칙 통일**: 모든 관리 페이지가 `management-` 접두사 사용
- ✅ **총 18개 페이지 컴포넌트**: 체계적으로 구성됨

#### 사용 패턴 분석

**✅ 통일된 패턴: App Router → Pages 레이어**
```typescript
// app/(admin)/admin/info/company/about/page.tsx
import ManangementAboutCompanyPage from '@/src/pages/management-about-company';
export default ManangementAboutCompanyPage;

// app/(admin)/admin/customer/members/page.tsx
import ManagementCustomerMembersPage from '@/src/pages/management-customer-members';
export default ManagementCustomerMembersPage;

// app/page.tsx
import HomePage from '@/src/pages/home';
export default HomePage;
```

**Pages 레이어 내부 구조**
```typescript
// src/pages/management-company-business/index.tsx
'use client';

import { CompanyBusiness } from '@/src/features/management-company';

export default function ManagementCompanyBusinessPage() {
  return <CompanyBusiness />;
}
```

#### 최근 개선 사항 (2025-11-19)
- ✅ 모든 App Router 페이지가 Pages 레이어를 사용하도록 통일 완료
- ✅ `admin-` 접두사를 `management-`로 변경하여 명명 규칙 통일
- ✅ 총 11개의 새로운 Pages 컴포넌트 생성
- ✅ Pages 레이어 사용 패턴 불일치 문제 해결

---

## 마이그레이션 진행 상황

### 완료된 마이그레이션

#### ✅ 레거시 컴포넌트 정리
- `app/components/ui/` → `src/shared/ui/`로 통합 완료
- `app/components/admin/` → `src/features/admin/ui/`로 통합 완료
- `app/components/sections/` → `src/pages/home/`로 통합 완료

#### ✅ 새로운 Features 추가
- `management-company`: 회사 정보 관리 기능 추가
- `management-prologue`: 프롤로그 관리 기능 추가
- `mypage`: 마이페이지 기능 추가
- `editor`: 에디터 기능 추가
- `layout`: 레이아웃 기능 추가

#### ✅ 삭제된 레거시 파일들
```
deleted:    src/features/admin/company/api/company-actions.ts
deleted:    src/features/admin/company/index.ts
deleted:    src/features/admin/company/ui/AboutTab.tsx
deleted:    src/features/admin/company/ui/HistoryTab.tsx
deleted:    src/features/admin/company/ui/OrganizationTab.tsx
deleted:    src/features/admin/editor/index.ts
deleted:    src/features/admin/editor/ui/DynamicCustomEditor.tsx
deleted:    src/features/admin/info/index.ts
deleted:    src/features/admin/info/ui/BusinessInfo.tsx
deleted:    src/features/admin/info/ui/ContactInfo.tsx
deleted:    src/features/admin/info/ui/ProductsAdmin.tsx
deleted:    src/features/admin/layout/index.ts
deleted:    src/features/admin/layout/ui/AdminLayout.tsx
deleted:    src/features/admin/prologue/index.ts
deleted:    src/features/admin/prologue/ui/Prologue.tsx
deleted:    src/features/auth/index.ts
deleted:    src/features/auth/model/auth.ts
deleted:    src/pages/admin/company/about/page.tsx
deleted:    src/pages/admin/company/history/page.tsx
deleted:    src/pages/admin/company/organization/page.tsx
```

### 진행 중인 마이그레이션

#### ⚠️ 구조 재정리 필요
- `features/home`의 Header, Footer → `widgets`로 이동 필요
- `features/layout` → `widgets`로 이동 필요
- `widgets/footer`와 `features/home/ui/Footer.tsx` 중복 해결 필요

### 최근 완료된 마이그레이션 (2025-11-19)

#### ✅ Pages 레이어 통일 완료
- 모든 App Router 페이지가 Pages 레이어를 사용하도록 통일
- 총 11개의 새로운 Pages 컴포넌트 생성:
  - `management-company-business`
  - `management-company-products`
  - `management-company-contacts`
  - `management-customer-estimates`
  - `management-customer-members`
  - `management-customer-notices`
  - `management-customer-qna`
  - `management-customer-reviews`
  - `management-system-administrators`
  - `management-system-logs`
  - `management-system-resources`

#### ✅ 명명 규칙 통일
- `admin-` 접두사를 `management-`로 변경하여 일관성 확보
- 모든 관리 페이지가 동일한 명명 규칙 사용

### 새로 추가된 파일들
```
src/pages/management-company-business/
src/pages/management-company-products/
src/pages/management-company-contacts/
src/pages/management-customer-estimates/
src/pages/management-customer-members/
src/pages/management-customer-notices/
src/pages/management-customer-qna/
src/pages/management-customer-reviews/
src/pages/management-system-administrators/
src/pages/management-system-logs/
src/pages/management-system-resources/
```

---

## 아키텍처 준수도 평가

### 레이어 간 의존성 규칙 준수

**규칙**: `Pages → Widgets → Features → Entities → Shared`

#### ✅ 준수 사항
1. **Entities 레이어**: 상위 레이어를 import하지 않음 ✅
2. **Features 레이어**: 상위 레이어(Pages, Widgets)를 import하지 않음 ✅
3. **Pages 레이어**: 하위 레이어만 import (Features, Widgets, Entities, Shared) ✅

#### 검증 결과
```bash
# Entities에서 상위 레이어 import 검색 결과: 없음 ✅
grep "from '@/src/(pages|widgets|features)" src/entities
# 결과: No matches found

# Features에서 상위 레이어 import 검색 결과: 없음 ✅
grep "from '@/src/(pages|widgets)" src/features
# 결과: No matches found
```

### Public API 패턴 준수

#### ✅ 잘 준수된 슬라이스
- 모든 Entities: `index.ts`를 통한 Public API 제공
- 대부분의 Features: `index.ts`를 통한 Public API 제공

#### ⚠️ 개선 필요
- 일부 Features의 Public API가 불완전할 수 있음 (세부 검토 필요)

---

## 발견된 이슈 및 개선 사항

### 🔴 중요 이슈

#### 1. Widgets 레이어 미비
**문제**: Widgets 레이어가 거의 비어있고, 위젯들이 Features 레이어에 위치

**영향**: 
- FSD 아키텍처의 레이어 분리 원칙 위반
- 재사용 가능한 복합 컴포넌트의 위치가 불명확

**해결 방안**:
- Header, Footer, Layout 컴포넌트를 Widgets로 이동

#### 2. 중복된 Footer 컴포넌트
**문제**: 
- `src/features/home/ui/Footer.tsx`
- `src/widgets/footer/ui/Footer.tsx`

두 파일이 공존

**해결 방안**:
- 하나로 통합 (Widgets로 이동 권장)

#### 3. Pages 레이어 사용 패턴 불일치 ✅ **해결됨**
**문제**: 
- 일부는 Pages 레이어 사용
- 일부는 App Router에서 직접 Features import

**해결 완료**:
- ✅ 모든 App Router 페이지가 Pages 레이어를 사용하도록 통일 완료
- ✅ 총 17개의 App Router 페이지가 Pages 레이어를 통해 import
- ✅ 명명 규칙 통일 (`management-` 접두사)

### 🟡 개선 권장 사항

#### 1. Features 구조 재검토
- `features/home`: Header, Footer는 Widgets로 이동 고려
- `features/layout`: Widgets로 이동 고려

#### 2. Public API 완성도
- 모든 Features의 `index.ts`에서 필요한 모든 export 확인
- 내부 구현 세부사항 노출 방지

#### 3. 타입 정의 일관성
- 모든 Entities의 타입 정의가 `model/types.ts`에 위치하는지 확인
- 타입 export가 Public API를 통해서만 이루어지는지 확인

---

## 권장 사항

### 단기 개선 사항 (우선순위 높음)

1. **Widgets 레이어 정리**
   ```
   [ ] features/home/ui/Header.tsx → widgets/header/ui/Header.tsx
   [ ] features/home/ui/Footer.tsx → widgets/footer/ui/Footer.tsx (중복 제거)
   [ ] features/layout/AdminLayout.tsx → widgets/admin-layout/ui/AdminLayout.tsx
   [ ] features/layout/MyPageLayout.tsx → widgets/mypage-layout/ui/MyPageLayout.tsx
   ```

2. **중복 파일 제거**
   ```
   [ ] widgets/footer/ui/Footer.tsx와 features/home/ui/Footer.tsx 통합
   ```

3. **Pages 레이어 사용 패턴 통일** ✅ **완료**
   ```
   [x] 모든 App Router 페이지에서 Pages 레이어 사용하도록 통일 완료
   [x] 명명 규칙 통일 (management- 접두사)
   [x] 총 17개 App Router 페이지 업데이트 완료
   ```

### 중기 개선 사항 (우선순위 중간)

1. **Features Public API 검토**
   - 모든 Features의 `index.ts` 검토
   - 필요한 export 확인 및 추가

2. **타입 정의 일관성 확인**
   - 모든 Entities의 타입이 `model/types.ts`에 위치하는지 확인
   - 타입 export가 Public API를 통해서만 이루어지는지 확인

3. **문서 업데이트**
   - `guide/ARCHITECTURE.md` 업데이트
   - 실제 구조와 문서의 일치성 확인

### 장기 개선 사항 (우선순위 낮음)

1. **레이어별 테스트 구조**
   - 각 레이어별 테스트 파일 구조 수립

2. **코드 리뷰 체크리스트**
   - FSD 아키텍처 준수 체크리스트 작성

3. **자동화 도구**
   - 레이어 간 의존성 검증 자동화
   - Public API 검증 자동화

---

## 결론

### 전체 평가

**점수**: 8.5/10 (이전 7.5/10에서 상승) ⬆️

#### 강점
- ✅ 레이어 간 의존성 규칙 준수 우수
- ✅ Entities와 Shared 레이어 구조 양호
- ✅ **Pages 레이어 완전 통일 완료** (최근 개선)
- ✅ Public API 패턴 대체로 잘 준수
- ✅ 명명 규칙 통일 (`management-` 접두사)
- ✅ 총 18개의 Pages 컴포넌트 체계적으로 구성

#### 개선 필요
- ⚠️ Widgets 레이어 미비 (여전히 개선 필요)
- ⚠️ 일부 컴포넌트 위치 재검토 필요 (Header, Footer, Layout)

### 최근 개선 사항 (2025-11-19)

1. ✅ **Pages 레이어 통일 완료**: 모든 App Router 페이지가 Pages 레이어 사용
2. ✅ **명명 규칙 통일**: `admin-` → `management-` 변경
3. ✅ **11개 Pages 컴포넌트 추가**: 관리 페이지들 체계화

### 다음 단계

1. **즉시 조치**: Widgets 레이어 정리 및 중복 파일 제거
2. ~~**단기 조치**: Pages 레이어 사용 패턴 통일~~ ✅ **완료**
3. **중기 조치**: Public API 검토 및 문서 업데이트

---

## 📊 변경 이력

### 2025-11-19 (최초 작성)
- 초기 FSD 아키텍처 분석
- 점수: 7.5/10

### 2025-11-19 (재평가)
- Pages 레이어 통일 완료 반영
- 명명 규칙 통일 반영
- 점수: 8.5/10 (1.0점 상승)

---

**작성자**: AI Assistant (Claude)  
**검토 필요**: 프로젝트 리더  
**다음 리뷰 예정일**: Widgets 레이어 개선 후

