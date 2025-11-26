'use client';

import { IntroductionSection } from './IntroductionSection';
import { StrengthsSection } from './StrengthsSection';
import { VisionSection } from './VisionSection';
import { ValuesSection } from './ValuesSection';
import { GreetingsSection } from './GreetingsSection';
import { MissionSection } from './MissionSection';

export default function AboutCompany() {
  return (
    <div className="space-y-6">
      <IntroductionSection />
      <StrengthsSection />
      <VisionSection />
      <ValuesSection />
      <GreetingsSection />
      <MissionSection />
    </div>
  );
}
