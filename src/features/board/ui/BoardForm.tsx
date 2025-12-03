'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Board } from '@/src/entities/board/model/types';
import { Card } from '@/src/shared/ui';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/shared/ui';
import { toast } from 'sonner';
import { createBoard, updateBoard, deleteBoard } from '../api/board-actions';

interface BoardFormProps {
    board?: Board;
}

export default function BoardForm({ board }: BoardFormProps) {
    const router = useRouter();
    const isEdit = !!board;

    const [form, setForm] = useState({
        code: board?.code || '',
        name: board?.name || '',
        description: board?.description || '',
        is_public: board?.is_public || false,
        allow_anonymous: board?.allow_anonymous || false,
        allow_comment: board?.allow_comment || false,
        allow_file: board?.allow_file || false,
        allow_guest: board?.allow_guest || false,
        allow_secret: board?.allow_secret || false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!form.code || !form.name) {
            toast.error('게시판 코드와 이름을 입력해주세요.');
            return;
        }

        // 게시판 코드는 영문, 숫자, 언더스코어만 허용
        if (!/^[a-z0-9_]+$/.test(form.code)) {
            toast.error('게시판 코드는 영문 소문자, 숫자, 언더스코어만 사용할 수 있습니다.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (isEdit && board) {
                const result = await updateBoard(board.id, form);
                if (result.success) {
                    toast.success('게시판이 수정되었습니다.');
                    router.push('/admin/system/boards/list');
                    router.refresh();
                } else {
                    toast.error(result.error || '게시판 수정에 실패했습니다.');
                }
            } else {
                // display_order와 allow_product_link는 기본값으로 설정 (UI에서 제거되었지만 타입 호환성을 위해)
                const result = await createBoard({
                    ...form,
                    display_order: 0,
                    allow_product_link: false,
                });
                if (result.success) {
                    toast.success('게시판이 생성되었습니다.');
                    router.push('/admin/system/boards/list');
                    router.refresh();
                } else {
                    toast.error(result.error || '게시판 생성에 실패했습니다.');
                }
            }
        } catch (error: any) {
            toast.error(error.message || '오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!board) {
            toast.error('삭제할 게시판이 없습니다.');
            return;
        }

        try {
            setDeleting(true);
            const result = await deleteBoard(board.id);
            if (result.success) {
                toast.success('게시판이 삭제되었습니다.');
                router.push('/admin/system/boards/list');
                router.refresh();
            } else {
                toast.error(result.error || '게시판 삭제에 실패했습니다.');
            }
        } catch (error: any) {
            toast.error(error.message || '오류가 발생했습니다.');
        } finally {
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/system/boards/list')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    목록으로
                </Button>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                    게시판 {isEdit ? '수정' : '생성'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="code">게시판 코드 *</Label>
                        <Input
                            id="code"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })}
                            placeholder="예: notices, qna, reviews"
                            disabled={isEdit}
                        />
                        <p className="text-xs text-gray-500">
                            영문 소문자, 숫자, 언더스코어만 사용 가능합니다. {isEdit && '(수정 불가)'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">게시판 이름 *</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="예: 공지사항, Q&A, 고객후기"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">게시판 설명</Label>
                        <Input
                            id="description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="게시판에 대한 설명을 입력하세요"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700">게시판 설정</h3>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is-public"
                                checked={form.is_public}
                                onCheckedChange={(checked) => setForm({ ...form, is_public: checked === true })}
                            />
                            <Label htmlFor="is-public" className="cursor-pointer">
                                공개 게시판
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="allow-anonymous"
                                checked={form.allow_anonymous}
                                onCheckedChange={(checked) => setForm({ ...form, allow_anonymous: checked === true })}
                            />
                            <Label htmlFor="allow-anonymous" className="cursor-pointer">
                                익명 게시 허용
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="allow-comment"
                                checked={form.allow_comment}
                                onCheckedChange={(checked) => setForm({ ...form, allow_comment: checked === true })}
                            />
                            <Label htmlFor="allow-comment" className="cursor-pointer">
                                댓글 허용
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="allow-file"
                                checked={form.allow_file}
                                onCheckedChange={(checked) => setForm({ ...form, allow_file: checked === true })}
                            />
                            <Label htmlFor="allow-file" className="cursor-pointer">
                                파일 첨부 허용
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="allow-guest"
                                checked={form.allow_guest}
                                onCheckedChange={(checked) => setForm({ ...form, allow_guest: checked === true })}
                            />
                            <Label htmlFor="allow-guest" className="cursor-pointer">
                                비회원 게시 허용
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="allow-secret"
                                checked={form.allow_secret}
                                onCheckedChange={(checked) => setForm({ ...form, allow_secret: checked === true })}
                            />
                            <Label htmlFor="allow-secret" className="cursor-pointer">
                                비밀글 허용
                            </Label>
                        </div>
                    </div>
                </form>
            </Card>

            <div className="flex justify-end gap-2">
                {isEdit && board && (
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        className="gap-2"
                        disabled={deleting}
                        size="lg"
                    >
                        <Trash2 className="h-4 w-4" />
                        {deleting ? '삭제 중...' : '삭제'}
                    </Button>
                )}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2"
                    size="lg"
                >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? '저장 중...' : '저장'}
                </Button>
            </div>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>게시판 삭제</DialogTitle>
                        <DialogDescription>
                            정말로 "{board?.name}" 게시판을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

