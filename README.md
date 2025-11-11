This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🏗️ 아키텍처

이 프로젝트는 **Clean Feature-Sliced Design (FSD)** 아키텍처를 따릅니다.

자세한 아키텍처 가이드는 [guide/ARCHITECTURE.md](./guide/ARCHITECTURE.md)를 참고하세요.

### 주요 구조

```
src/
├── shared/      # 공유 레이어 (UI 컴포넌트, 유틸리티)
├── entities/    # 엔티티 레이어 (비즈니스 엔티티 타입)
├── features/    # 기능 레이어 (인증, 관리자 기능)
├── widgets/     # 위젯 레이어 (복합 컴포넌트)
└── pages/       # 페이지 레이어 (페이지 섹션 컴포넌트)
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
