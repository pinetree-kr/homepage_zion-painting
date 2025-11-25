import { checkAdminExists } from '@/src/features/setup/api/setup-actions';
import SetupForm from '@/src/features/setup/ui/SetupForm';

export default async function SetupPage() {
  const adminExists = await checkAdminExists();

  // 관리자 계정이 이미 존재하면 안내 메시지 표시
  if (adminExists) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-gray-900 text-2xl font-bold mb-2">
              관리자 계정이 이미 존재합니다
            </h2>
            <p className="text-gray-600">
              시스템 설정이 완료되었습니다. 관리자 로그인 페이지로 이동하세요.
            </p>
          </div>
          <a
            href="/auth/sign-in"
            className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors"
          >
            로그인 페이지로 이동
          </a>
        </div>
      </div>
    );
  }

  // 관리자 계정이 없으면 생성 폼 표시
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <SetupForm />
    </div>
  );
}

