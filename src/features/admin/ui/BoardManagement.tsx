'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { toast } from 'sonner';
import { Post } from '@/src/entities';
import { DataTable, DataTableColumn, DataTableAction } from '@/src/shared/ui';

interface BoardManagementProps {
  type: 'notice' | 'qna' | 'quote' | 'review';
  title: string;
  description: string;
}

export default function BoardManagement({ type, title, description }: BoardManagementProps) {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      type: type,
      title: '샘플 게시물',
      content: '샘플 내용입니다.',
      author: '관리자',
      createdAt: '2024-01-15',
      status: 'published',
    },
  ]);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const addPost = () => {
    const newPost: Post = {
      id: Date.now().toString(),
      type: type,
      title: '',
      content: '',
      author: '관리자',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft',
    };
    setSelectedPost(newPost);
    setIsEditDialogOpen(true);
  };

  const editPost = (post: Post) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

  const viewPost = (post: Post) => {
    setSelectedPost(post);
    setIsViewDialogOpen(true);
  };

  const savePost = () => {
    if (selectedPost) {
      const exists = posts.find(p => p.id === selectedPost.id);
      if (exists) {
        setPosts(posts.map(p =>
          p.id === selectedPost.id ? selectedPost : p
        ));
      } else {
        setPosts([...posts, selectedPost]);
      }
      setIsEditDialogOpen(false);
      setSelectedPost(null);
      toast.success('게시물이 저장되었습니다.');
    }
  };

  const removePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
    toast.success('게시물이 삭제되었습니다.');
  };

  const postColumns: DataTableColumn<Post>[] = [
    {
      id: 'title',
      header: '제목',
      accessor: (row) => row.title,
      sortable: true,
      width: '40%'
    },
    {
      id: 'author',
      header: '작성자',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-3 w-3" />
          {row.author}
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'status',
      header: '상태',
      accessor: (row) => (
        <Badge variant={row.status === 'published' ? 'default' : 'secondary'} className="text-xs">
          {row.status === 'published' ? (
            <><CheckCircle className="h-3 w-3 mr-1" />공개</>
          ) : (
            <><XCircle className="h-3 w-3 mr-1" />비공개</>
          )}
        </Badge>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'category',
      header: '카테고리',
      accessor: (row) => (
        row.category ? (
          <Badge variant="outline" className="text-xs">
            {row.category}
          </Badge>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'createdAt',
      header: '작성일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {row.createdAt}
        </div>
      ),
      sortable: true,
      width: '15%'
    }
  ];

  const postActions: DataTableAction<Post>[] = [
    {
      label: '보기',
      icon: <Eye className="h-4 w-4" />,
      onClick: viewPost
    },
    {
      label: '수정',
      icon: <Edit className="h-4 w-4" />,
      onClick: editPost
    },
    {
      label: '삭제',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => removePost(row.id),
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
        <Button onClick={addPost} className="gap-2">
          <Plus className="h-4 w-4" />
          게시물 추가
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목 검색..."
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="published">공개</SelectItem>
              <SelectItem value="draft">비공개</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={filteredPosts}
          columns={postColumns}
          actions={postActions}
          getRowId={(row) => row.id}
          emptyMessage="게시물이 없습니다"
        />
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>게시물 {selectedPost?.id ? '수정' : '추가'}</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <Label>제목</Label>
                <Input
                  value={selectedPost.title}
                  onChange={(e) => setSelectedPost({ ...selectedPost, title: e.target.value })}
                  placeholder="제목 입력"
                />
              </div>

              <div>
                <Label>작성자</Label>
                <Input
                  value={selectedPost.author}
                  onChange={(e) => setSelectedPost({ ...selectedPost, author: e.target.value })}
                  placeholder="작성자"
                />
              </div>

              <div>
                <Label>상태</Label>
                <Select
                  value={selectedPost.status}
                  onValueChange={(value: 'published' | 'draft') => setSelectedPost({ ...selectedPost, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">공개</SelectItem>
                    <SelectItem value="draft">비공개</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === 'quote' && (
                <div>
                  <Label>카테고리</Label>
                  <Input
                    value={selectedPost.category || ''}
                    onChange={(e) => setSelectedPost({ ...selectedPost, category: e.target.value })}
                    placeholder="예: 도장설비"
                  />
                </div>
              )}

              <div>
                <Label>내용</Label>
                <DynamicCustomEditor
                  text={selectedPost.content}
                  onChange={(content) => setSelectedPost({ ...selectedPost, content })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={savePost}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>게시물 보기</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-900 text-2xl mb-2">{selectedPost.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{selectedPost.author}</span>
                  <span>{selectedPost.createdAt}</span>
                  <Badge variant={selectedPost.status === 'published' ? 'default' : 'secondary'}>
                    {selectedPost.status === 'published' ? '공개' : '비공개'}
                  </Badge>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="whitespace-pre-wrap">{selectedPost.content}</div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

