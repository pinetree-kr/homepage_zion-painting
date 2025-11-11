import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Pin, Calendar, User } from 'lucide-react';
import { mockPosts } from '../../utils/mockData';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface NoticeSectionProps {
  searchTerm: string;
}

export function NoticeSection({ searchTerm }: NoticeSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const notices = mockPosts
    .filter(post => post.type === 'notice' && post.status === 'published')
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const pinnedNotices = notices.filter(notice => notice.id === '1'); // Mock pinned
  const regularNotices = notices.filter(notice => notice.id !== '1');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderNoticeItem = (notice: any, isPinned: boolean = false) => (
    <Card key={notice.id} className="border-border overflow-hidden">
      <CardContent className="p-0">
        <button
          onClick={() => toggleExpand(notice.id)}
          className="w-full px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
        >
          {isPinned && (
            <Pin className="h-5 w-5 text-teal-500 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-gray-900 text-base">{notice.title}</h3>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                  expandedId === notice.id ? 'rotate-180' : ''
                }`}
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{notice.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{notice.createdAt}</span>
              </div>
              {isPinned && (
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-0">
                  Pinned
                </Badge>
              )}
            </div>
          </div>
        </button>
        <AnimatePresence>
          {expandedId === notice.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {pinnedNotices.length > 0 && (
        <div className="space-y-2">
          {pinnedNotices.map(notice => renderNoticeItem(notice, true))}
        </div>
      )}
      {regularNotices.length > 0 ? (
        <div className="space-y-2">
          {regularNotices.map(notice => renderNoticeItem(notice, false))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No notices found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
