'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Calendar, User as UserIcon, Trash2 } from 'lucide-react';
import { Button, CardFooter } from '@/src/shared/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { toast } from 'sonner';
import { Profile } from '@/src/entities';
import { formatDateKorean } from '@/src/shared/lib/utils';
import {
  deleteUser,
} from '../api/user-actions';

interface MemberDetailProps {
  member: Profile;
}

export default function MemberDetail({ member }: MemberDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteUser(member.id);
      if (result.success) {
        toast.success('회원이 삭제되었습니다.');
        router.push('/admin/services/members');
      } else {
        toast.error(`삭제 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
        setDeleting(false);
        setShowDeleteDialog(false);
      }
    } catch (error: any) {
      console.error('삭제 오류:', error);
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    return formatDateKorean(dateString, true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            회원 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">이름</label>
              <div className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span>{member.name || '-'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">이메일</label>
              <div className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{member.email || '-'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">전화번호</label>
              <div className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{member.phone || '-'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">회원 ID</label>
              <div className="text-base font-mono text-gray-600">
                {member.id}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">가입일</label>
              <div className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(member.created_at)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">최근 로그인</label>
              <div className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(member.last_login)}</span>
              </div>
            </div>

            {member.updated_at && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">수정일</label>
                <div className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(member.updated_at)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="h-[42px] gap-2"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

