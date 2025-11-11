import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Calendar, User as UserIcon, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { User } from '../../types';
import { mockPosts } from '../../utils/mockData';

interface QuoteSectionProps {
  currentUser: User;
  searchTerm?: string;
}

export function QuoteSection({ currentUser, searchTerm = '' }: QuoteSectionProps) {
  // 현재 사용자의 문의내역 필터링
  const userQuotes = mockPosts
    .filter(post => 
      (post.type === 'quote' || post.type === 'qna') && 
      post.author === currentUser.name
    )
    .filter(post => 
      searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-4">
      {userQuotes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? '검색 결과가 없습니다' : '문의 내역이 없습니다'}
            </p>
          </CardContent>
        </Card>
      ) : (
        userQuotes.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={post.type === 'quote' ? 'default' : 'secondary'}>
                        {post.type === 'quote' ? '견적문의' : 'Q&A'}
                      </Badge>
                      {post.category && (
                        <Badge variant="outline">{post.category}</Badge>
                      )}
                    </div>
                    <CardTitle className="mb-2">{post.title}</CardTitle>
                    <CardDescription>{post.content}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{currentUser.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
