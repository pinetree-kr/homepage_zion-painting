'use client';

import { GreetingsSection } from '@/src/features/management-company/ui/GreetingsSection';
import { MissionSection } from '@/src/features/management-company/ui/MissionSection';

export default function ManagementCompanyGreetingsPage() {
  return (
    <div className="space-y-6">
      <GreetingsSection />
      <MissionSection />
    </div>
  );
}

