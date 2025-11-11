# 아키텍처 가이드

이 프로젝트는 **Clean Feature-Sliced Design (FSD)** 아키텍처를 따릅니다.

## 📁 디렉토리 구조

```
src/
├── shared/          # 공유 레이어 - 프로젝트 전반에서 사용되는 공통 코드
│   ├── ui/         # UI 컴포넌트 (Button, Card, Input, Dialog 등)
│   └── lib/        # 공유 유틸리티 함수
├── entities/        # 엔티티 레이어 - 비즈니스 엔티티의 타입 정의
│   ├── user/       # 사용자 엔티티
│   ├── post/       # 게시글 엔티티
│   ├── company/    # 회사 정보 엔티티
│   ├── business/   # 사업 정보 엔티티
│   ├── product/    # 제품 엔티티
│   ├── contact/    # 연락처 엔티티
│   └── system/     # 시스템 엔티티 (로그, 리소스 등)
├── features/        # 기능 레이어 - 사용자 액션과 비즈니스 로직
│   ├── auth/       # 인증 기능 (로그인, 회원가입, 이메일 인증)
│   └── admin/      # 관리자 기능 (관리자 페이지 컴포넌트들)
├── widgets/         # 위젯 레이어 - 독립적인 복합 컴포넌트
│   ├── header/     # 헤더 위젯
│   ├── footer/     # 푸터 위젯
│   └── admin-layout/ # 관리자 레이아웃 위젯
└── pages/           # 페이지 레이어 - 페이지별 섹션 컴포넌트
    └── home/       # 홈 페이지 섹션들 (Hero, About, Business 등)
```

## 🏗️ 레이어 설명

### 1. Shared (공유 레이어)

프로젝트 전반에서 재사용되는 공통 코드를 포함합니다.

**특징:**
- 다른 모든 레이어에서 import 가능
- 비즈니스 로직과 무관한 순수한 UI 컴포넌트나 유틸리티
- 프로젝트 전체에서 공통으로 사용되는 타입이나 상수

**예시:**
```typescript
// shared/ui/Button.tsx
import { Button } from '@/src/shared/ui';

// shared/ui/utils.ts
import { cn } from '@/src/shared/ui';
```

**포함 내용:**
- UI 컴포넌트: Button, Card, Input, Dialog, Select, Tabs 등
- 레이아웃 컴포넌트: Container, Section
- 유틸리티: cn (className 유틸리티)

### 2. Entities (엔티티 레이어)

비즈니스 도메인의 핵심 엔티티를 정의합니다.

**특징:**
- 비즈니스 로직과 무관한 순수한 데이터 모델
- 타입 정의와 인터페이스만 포함
- 다른 레이어에서 import하여 사용

**구조:**
```
entities/
└── user/
    ├── model/
    │   └── types.ts    # User, Member 타입 정의
    └── index.ts        # Public API
```

**예시:**
```typescript
// entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

// 사용
import { User, Member } from '@/src/entities/user';
// 또는
import { User, Member } from '@/src/entities';
```

**엔티티 목록:**
- `user` - 사용자 및 회원 정보
- `post` - 게시글 (공지사항, Q&A, 견적문의, 후기)
- `company` - 회사 정보 및 연혁
- `business` - 사업 영역 및 성과
- `product` - 제품 정보
- `contact` - 연락처 정보
- `system` - 시스템 관련 (활동 로그, 버그 리포트, 리소스 사용량)

### 3. Features (기능 레이어)

사용자 액션과 비즈니스 로직을 포함하는 기능 모듈입니다.

**특징:**
- 특정 사용자 액션을 구현하는 코드
- 비즈니스 로직과 상태 관리 포함
- Entities와 Shared를 사용

**구조:**
```
features/
└── auth/
    ├── model/
    │   └── auth.ts    # 인증 로직 (login, register, logout 등)
    └── index.ts       # Public API
```

**예시:**
```typescript
// features/auth/model/auth.ts
export function login(email: string, password: string): User | null {
  // 로그인 로직
}

// 사용
import { login, register, logout, getCurrentUser, isAdmin } from '@/src/features/auth';
```

**기능 목록:**
- `auth` - 인증 기능 (로그인, 회원가입, 이메일 인증)
- `admin` - 관리자 기능 (관리자 페이지 컴포넌트들)

### 4. Widgets (위젯 레이어)

독립적으로 동작하는 복합 컴포넌트입니다.

**특징:**
- 여러 Features나 Entities를 조합한 복합 컴포넌트
- 재사용 가능한 독립적인 UI 블록
- 페이지 레이아웃의 일부를 담당

**구조:**
```
widgets/
└── header/
    ├── ui/
    │   └── Header.tsx
    └── index.ts
```

**예시:**
```typescript
// widgets/header/ui/Header.tsx
export default function Header() {
  // 헤더 컴포넌트
}

// 사용
import { Header } from '@/src/widgets/header';
```

**위젯 목록:**
- `header` - 사이트 헤더 (네비게이션 포함)
- `footer` - 사이트 푸터
- `admin-layout` - 관리자 페이지 레이아웃

### 5. Pages (페이지 레이어)

페이지별 섹션 컴포넌트를 포함합니다.

**특징:**
- 특정 페이지에서만 사용되는 컴포넌트
- Widgets, Features, Entities를 조합하여 페이지 구성
- Next.js App Router의 page.tsx에서 사용

**구조:**
```
pages/
└── home/
    ├── Hero.tsx
    ├── About.tsx
    ├── Business.tsx
    ├── Products.tsx
    ├── Contact.tsx
    ├── Footer.tsx
    └── index.ts
```

**예시:**
```typescript
// pages/home/Hero.tsx
import { Container } from '@/src/shared/ui';

export default function Hero() {
  return (
    <section>
      <Container>
        {/* Hero 섹션 내용 */}
      </Container>
    </section>
  );
}

// 사용
import { Hero, About, Business } from '@/src/pages/home';
```

## 🔄 Import 규칙

### 레이어 간 의존성 규칙

FSD 아키텍처는 레이어 간 의존성 규칙을 따릅니다:

```
Pages → Widgets → Features → Entities → Shared
```

**규칙:**
- ✅ 하위 레이어는 상위 레이어를 import할 수 없음
- ✅ 상위 레이어는 하위 레이어를 import할 수 있음
- ✅ 같은 레이어 내에서는 import 가능 (단, 순환 참조 주의)

**예시:**
```typescript
// ✅ 올바른 import
// features/auth에서 entities/user 사용
import { User } from '@/src/entities/user';

// widgets/header에서 shared/ui 사용
import { Button } from '@/src/shared/ui';

// pages/home에서 widgets/header 사용
import { Header } from '@/src/widgets/header';

// ❌ 잘못된 import
// entities/user에서 features/auth 사용 (금지)
import { login } from '@/src/features/auth'; // ❌
```

## 📦 App Router와의 통합

Next.js App Router (`app/` 디렉토리)에서는 `src/` 디렉토리의 컴포넌트들을 re-export하여 사용합니다.

### Re-export 구조

```typescript
// app/components/index.ts
export * from '@/src/shared/ui';
export * from '@/src/widgets/header';
export * from '@/src/widgets/footer';
export * from '@/src/widgets/admin-layout';
export * from '@/src/pages/home';

// app/lib/index.ts
export * from '@/src/features/auth';
export * from '@/src/entities';
```

### 사용 예시

```typescript
// app/page.tsx
import { Header } from '@/src/widgets/header';
import { Hero, About, Business } from '@/src/pages/home';

// app/(admin)/admin/layout.tsx
import { getCurrentUser, isAdmin, logout } from '@/src/features/auth';
import { AdminLayout } from '@/src/widgets/admin-layout';
```

## 🛠️ TypeScript 경로 설정

`tsconfig.json`에 다음 경로 alias가 설정되어 있습니다:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/src/*": ["./src/*"]
    }
  }
}
```

이를 통해 다음과 같이 import할 수 있습니다:

```typescript
// 절대 경로 import
import { Button } from '@/src/shared/ui';
import { User } from '@/src/entities/user';
import { login } from '@/src/features/auth';
```

## 📝 파일 명명 규칙

### 디렉토리 구조

각 레이어의 슬라이스(기능 단위)는 다음과 같은 구조를 따릅니다:

```
feature-name/
├── ui/              # UI 컴포넌트 (선택적)
├── model/           # 비즈니스 로직 및 타입 (선택적)
├── api/             # API 호출 (선택적)
└── index.ts         # Public API (필수)
```

### 파일 명명

- 컴포넌트: `PascalCase.tsx` (예: `Header.tsx`, `AdminLayout.tsx`)
- 유틸리티: `camelCase.ts` (예: `auth.ts`, `utils.ts`)
- 타입: `types.ts` 또는 `model/types.ts`
- Public API: `index.ts`

## 🎯 Best Practices

### 1. 레이어 분리 원칙

- **Shared**: 비즈니스 로직 없는 순수한 UI/유틸리티
- **Entities**: 데이터 모델만 정의, 로직 없음
- **Features**: 사용자 액션과 비즈니스 로직
- **Widgets**: 여러 Features/Entities를 조합한 복합 컴포넌트
- **Pages**: 페이지별 섹션 컴포넌트

### 2. Import 최적화

```typescript
// ✅ 좋은 예: 필요한 것만 import
import { Button, Card } from '@/src/shared/ui';
import { User } from '@/src/entities/user';

// ❌ 나쁜 예: 전체 import (트리 쉐이킹 불가)
import * from '@/src/shared/ui';
```

### 3. Public API 사용

각 슬라이스는 `index.ts`를 통해 Public API를 제공합니다:

```typescript
// entities/user/index.ts
export type { User, Member } from './model/types';

// 사용 시
import { User, Member } from '@/src/entities/user';
// 내부 구조를 직접 import하지 않음
```

### 4. 타입 정의

타입은 해당 엔티티의 `model/types.ts`에 정의하고, `index.ts`에서 export합니다:

```typescript
// entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  // ...
}

// entities/user/index.ts
export type { User } from './model/types';
```

## 🔍 디버깅 팁

### Import 오류 해결

1. **경로 확인**: `@/src/*` 경로가 올바른지 확인
2. **Public API 확인**: `index.ts`에서 export하고 있는지 확인
3. **레이어 의존성 확인**: 하위 레이어에서 상위 레이어를 import하지 않았는지 확인

### 구조 확인

```bash
# src 디렉토리 구조 확인
tree src -L 3

# 특정 레이어의 파일 확인
find src/entities -name "*.ts" -o -name "*.tsx"
```

## 📚 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🤝 기여 가이드

새로운 기능을 추가할 때:

1. **엔티티 추가**: `src/entities/`에 새 엔티티 디렉토리 생성
2. **기능 추가**: `src/features/`에 새 기능 디렉토리 생성
3. **위젯 추가**: `src/widgets/`에 새 위젯 디렉토리 생성
4. **Public API**: 각 슬라이스의 `index.ts`에서 export 확인

---

**마지막 업데이트**: 2024년

