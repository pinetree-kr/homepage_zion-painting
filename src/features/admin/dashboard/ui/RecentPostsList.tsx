'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/src/shared/ui';
import { RecentPost } from '@/src/entities/dashboard';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDateSimple } from '@/src/shared/lib/utils';

interface RecentPostsListProps {
  title: string;
  posts: RecentPost[];
  viewAllLink: string;
  emptyMessage?: string;
}

export default function RecentPostsList({
  title,
  posts,
  viewAllLink,
  emptyMessage = '최근 게시글이 없습니다.',
}: RecentPostsListProps) {
  const formatDate = (dateString: string) => {
    return formatDateSimple(dateString);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Link href={viewAllLink}>
          <Button variant="outline" size="sm" className="gap-2">
            전체보기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/customer/${post.type === 'qna' ? 'qna' : 'estimates'}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {post.title}
                      </h4>
                      <Badge
                        variant={post.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs shrink-0"
                      >
                        {post.status === 'published' ? '공개' : '비공개'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                      {post.content.length > 100 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {post.authorName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{post.authorName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      {post.category && (
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

