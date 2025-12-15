'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { CircleUser, Trash2, Edit } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card, CardContent } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { toast } from 'sonner';
import { deleteComment, updateComment } from '../api/comment-actions';
import { DynamicCustomEditor } from '@/src/features/editor';
import type { Comment } from '@/src/entities/comment/model/types';
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import { generateUserColor, rgbToCss, formatDateDetailed } from '@/src/shared/lib/utils';

interface CommentItemProps {
    comment: Comment;
    permissions: {
        cmt_edit: boolean;
        cmt_delete: boolean;
    };
    isAdmin?: boolean;
    onCommentUpdated?: (updatedComment?: Comment, action?: 'update' | 'delete' | 'create') => void;
}

export default function CommentItem({ comment, permissions, isAdmin = false, onCommentUpdated }: CommentItemProps) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editCommentContent, setEditCommentContent] = useState(comment.context);
    const [updating, setUpdating] = useState(false);

    // 현재 사용자 정보 가져오기
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                setCurrentUserId(user?.id || null);
            } catch (error) {
                console.error('사용자 정보 가져오기 오류:', error);
            }
        };
        getCurrentUser();
    }, []);

    // 날짜 포맷팅
    const formatCommentDate = useCallback((dateString: string | null | undefined) => {
        return formatDateDetailed(dateString);
    }, []);

    // 권한 확인
    const canDelete = permissions.cmt_delete && (isAdmin || (currentUserId && comment.author_id === currentUserId));
    const canEdit = permissions.cmt_edit && (currentUserId && comment.author_id === currentUserId);

    // 삭제 핸들러
    const handleDeleteClick = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        setDeleting(true);
        try {
            const result = await deleteComment(comment.id);
            if (result.success) {
                toast.success('댓글이 삭제되었습니다.');
                setShowDeleteDialog(false);
                onCommentUpdated?.(undefined, 'delete');
            } else {
                toast.error(result.error || '댓글 삭제에 실패했습니다.');
            }
        } catch (error: any) {
            console.error('댓글 삭제 오류:', error);
            toast.error('댓글 삭제 중 오류가 발생했습니다.');
        } finally {
            setDeleting(false);
        }
    }, [comment.id, onCommentUpdated]);

    // 수정 핸들러
    const handleEditClick = useCallback(() => {
        setEditCommentContent(comment.context);
        setShowEditDialog(true);
    }, [comment.context]);

    const handleEditConfirm = useCallback(async () => {
        setUpdating(true);
        try {
            const result = await updateComment(comment.id, editCommentContent);
            if (result.success && result.data) {
                toast.success('댓글이 수정되었습니다.');
                setShowEditDialog(false);
                // 수정된 댓글 데이터를 전달 (부분 업데이트)
                const updatedComment: Comment = {
                    ...result.data,
                };
                onCommentUpdated?.(updatedComment, 'update');
            } else {
                toast.error(result.error || '댓글 수정에 실패했습니다.');
            }
        } catch (error: any) {
            console.error('댓글 수정 오류:', error);
            toast.error('댓글 수정 중 오류가 발생했습니다.');
        } finally {
            setUpdating(false);
        }
    }, [comment.id, editCommentContent, onCommentUpdated]);

    const isDeletedUser = useMemo(() => {
        return !comment.author_id && comment.author_name;
    }, [comment.author_id, comment.author_name]);

    const isAuthor = useMemo(() => {
        return currentUserId && comment.author_id === currentUserId;
    }, [currentUserId, comment.author_id]);

    const displayName = useMemo(() => {
        return comment.author_name || '익명';
    }, [comment.author_id, comment.author_name]);

    // // author_id가 null이면 삭제된 사용자로 표시
    // const displayNameWithDeleted = !comment.author_id && displayName !== '익명'
    //     ? `${displayName} (탈퇴한 회원)`
    //     : displayName;

    const authorImage = (comment as any).extra_json?.author_image || null;

    // 사용자 ID를 기준으로 색상 생성
    const userColor = generateUserColor(comment.author_id);
    const backgroundColor = rgbToCss(userColor);

    return (
        <>
            <Card className="shadow-md">
                <CardContent style={{ padding: '0px' }}>
                    <div className="flex items-center justify-between mb-2 pt-4 px-4 py-2 md:px-6">
                        <div className="flex items-center gap-2">
                            <div
                                className="relative h-6 w-6 rounded-full overflow-hidden text-white flex items-center justify-center border border-gray-50/80"
                                style={{ backgroundColor }}
                            >
                                {authorImage ? (
                                    <Image
                                        src={authorImage}
                                        alt={displayName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : displayName ? (
                                    <span className="text-[10px] font-medium">{displayName.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <CircleUser className="h-3 w-3" />
                                )}

                            </div>
                            {
                                isDeletedUser ? (
                                    <span className="text-sm text-gray-400/50">
                                        {displayName} (탈퇴한 회원)
                                    </span>
                                ) : (
                                    <span className="text-sm font-semibold text-gray-800">
                                        {displayName}
                                        {isAuthor && (
                                            <span className="text-gray-500 ml-1">(본인)</span>
                                        )}
                                    </span>
                                )
                            }
                        </div>
                        <span className="text-xs text-gray-500">
                            {comment.updated_at && comment.updated_at !== comment.created_at
                                ? <>
                                    <span className="text-gray-500/50 mr-1">(수정됨)</span> <span className="text-gray-500">{formatCommentDate(comment.updated_at)}</span>
                                </>
                                : <>
                                    <span className="text-gray-500">{formatCommentDate(comment.created_at)}</span>
                                </>}
                        </span>
                    </div>
                    <div
                        className="text-sm text-gray-700 prose prose-sm max-w-none px-4 py-2 pb-3 md:pb-4 md:px-6"
                        dangerouslySetInnerHTML={{ __html: comment.context }}
                    />
                    {/* 댓글 액션 버튼 */}
                    {(canDelete || canEdit) && (
                        <div className="flex items-center justify-end gap-2 px-4 pb-4 md:px-6">
                            {canEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleEditClick}
                                    className="gap-2"
                                >
                                    <Edit className="h-3 w-3" />
                                    수정
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDeleteClick}
                                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    삭제
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 삭제 확인 모달 */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>댓글 삭제</DialogTitle>
                        <DialogDescription>
                            정말로 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                        >
                            {deleting ? '삭제 중...' : '삭제'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 수정 모달 */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>댓글 수정</DialogTitle>
                        <DialogDescription>
                            댓글 내용을 수정해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div id={`edit-comment-editor-${comment.id}`} className="mb-4">
                            <DynamicCustomEditor
                                text={editCommentContent}
                                onChange={(content) => setEditCommentContent(content)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowEditDialog(false);
                                setEditCommentContent(comment.context);
                            }}
                            disabled={updating}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleEditConfirm}
                            disabled={updating || !editCommentContent.trim()}
                            className="bg-[#1A2C6D] text-white hover:bg-[#1A2C6D]/90"
                        >
                            {updating ? '수정 중...' : '수정'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
