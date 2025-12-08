'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/src/shared/ui';
import { Post } from '@/src/entities/post/model/types';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDateSimple } from '@/src/shared/lib/utils';

interface RecentPostsListProps {
  title: string;
  posts: Omit<Post, 'like_count' | 'comment_count' | 'thumbnail_url' | 'extra_json' | 'deleted_at' | 'is_pinned' | 'is_secret' | 'view_count' | 'updated_at'>[];
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
                href={`/admin/customer/${post.board_id === 'qna' ? 'qna' : 'estimates'}`}
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
                      {post.author_name && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {post.author_name}
                            {!post.author_id && (<span className="text-gray-500/50 ml-1">(탈퇴한 회원)</span>)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.created_at || '')}</span>
                      </div>
                      {post.category_id && (
                        <Badge variant="outline" className="text-xs">
                          {post.category_id}
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

