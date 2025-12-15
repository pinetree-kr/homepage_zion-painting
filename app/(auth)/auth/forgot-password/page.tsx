import { Suspense } from 'react';
import ForgotPasswordForm from '@/src/features/auth/ui/ForgotPasswordForm';

function ForgotPasswordLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 relative">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
