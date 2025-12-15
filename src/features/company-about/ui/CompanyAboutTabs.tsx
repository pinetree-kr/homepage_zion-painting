'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/src/shared/ui';
import type { CompanyAbout } from '@/src/entities/company/model/types';
import type { CompanyHistory } from '@/src/entities/company/model/types';
import type { OrganizationMember } from '@/src/entities/company/model/types';
import type { ContactInfo } from '@/src/entities/contact/model/types';
import CompanyOverviewTab from './tabs/CompanyOverviewTab';
import CompanyHistoryTab from './tabs/CompanyHistoryTab';
import CompanyOrganizationTab from './tabs/CompanyOrganizationTab';
import CompanyLocationTab from './tabs/CompanyLocationTab';

interface CompanyAboutTabsProps {
  aboutInfo: CompanyAbout | null;
  histories: CompanyHistory[];
  organizationMembers: OrganizationMember[];
  contactInfo: ContactInfo | null;
}

type TabType = 'overview' | 'history' | 'organization' | 'location';

const tabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: '회사개요' },
  { id: 'history', label: '연혁' },
  { id: 'organization', label: '조직도' },
  { id: 'location', label: '오시는 길' },
];

export default function CompanyAboutTabs({
  aboutInfo,
  histories,
  organizationMembers,
  contactInfo,
}: CompanyAboutTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // URL 해시와 탭 동기화
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const validTab = tabs.find((tab) => tab.id === hash);
    if (validTab) {
      setActiveTab(validTab.id);
    }
  }, []);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
  };

  return (
    <section className="bg-white py-16">
      <Container>
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-12">
          <nav className="flex flex-wrap gap-2 md:gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  px-6 py-4 text-lg font-medium transition-all relative
                  ${
                    activeTab === tab.id
                      ? 'text-[#1A2C6D] border-b-2 border-[#1A2C6D] font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <CompanyOverviewTab aboutInfo={aboutInfo} />
          )}
          {activeTab === 'history' && (
            <CompanyHistoryTab histories={histories} />
          )}
          {activeTab === 'organization' && (
            <CompanyOrganizationTab members={organizationMembers} />
          )}
          {activeTab === 'location' && (
            <CompanyLocationTab contactInfo={contactInfo} />
          )}
        </div>
      </Container>
    </section>
  );
}
