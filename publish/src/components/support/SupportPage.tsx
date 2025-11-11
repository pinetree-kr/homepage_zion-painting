import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search } from 'lucide-react';
import { NoticeSection } from './NoticeSection';
import { QnASection } from './QnASection';
import { QuoteSection } from './QuoteSection';
import { GallerySection } from './GallerySection';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User } from '../../types';

interface SupportPageProps {
  currentUser: User | null;
  initialSection?: string;
  onBack: () => void;
  onLoginClick: () => void;
}

export function SupportPage({ currentUser, initialSection = 'notice', onBack, onLoginClick }: SupportPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialSection);

  useEffect(() => {
    setActiveTab(initialSection);
  }, [initialSection]);

  // 섹션 이름 매핑
  const sectionMap: Record<string, string> = {
    'notice': 'notice',
    'qna': 'qna',
    'myinquiry': 'myinquiry',
  };

  const mappedSection = sectionMap[initialSection] || 'notice';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            메인으로 돌아가기
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-gray-900 mb-2">고객센터</h1>
              <p className="text-muted-foreground">
                공지사항, Q&A, 문의내역을 확인하세요
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="notice">공지사항</TabsTrigger>
            <TabsTrigger value="qna">Q&A</TabsTrigger>
            <TabsTrigger value="myinquiry">내 문의내역</TabsTrigger>
          </TabsList>

          <TabsContent value="notice">
            <NoticeSection searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="qna">
            <QnASection searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="myinquiry">
            {currentUser ? (
              <QuoteSection currentUser={currentUser} searchTerm={searchTerm} />
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">문의내역을 보려면 로그인이 필요합니다</p>
                <button
                  onClick={onLoginClick}
                  className="px-6 py-3 bg-[#1A2C6D] text-white rounded-lg hover:bg-[#A5C93E] transition-colors"
                >
                  로그인하기
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
