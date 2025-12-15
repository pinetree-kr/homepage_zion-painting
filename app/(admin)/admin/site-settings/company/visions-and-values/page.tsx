'use client';

import { VisionSection } from '@/src/features/management-company/ui/VisionSection';
import { ValuesSection } from '@/src/features/management-company/ui/ValuesSection';

export default function ManagementCompanyVisionsAndValuesPage() {
  return (
    <div className="space-y-6">
      <VisionSection />
      <ValuesSection />
    </div>
  );
}

