'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/src/shared/ui';
import { Card, CardContent } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { toast } from 'sonner';
import { createComment } from '../api/comment-actions';
import { DynamicCustomEditor } from '@/src/features/editor';

interface CommentWithProfile {
    id: string;
    post_id: string;
    parent_id: string | null;
    author_id: string | null;
    author_name: string | null;
    author_ip: string | null;
    context: string;
    status: 'draft' | 'published';
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
    profile_name?: string | null;
}

interface CommentFormProps {
    postId: string;
    onCommentCreated?: (newComment?: CommentWithProfile, action?: 'create') => void;
}

export default function CommentForm({ postId, onCommentCreated }: CommentFormProps) {
    const [commentContent, setCommentContent] = useState('');
    const [commentAuthorName, setCommentAuthorName] = useState('');
    // const [showWarning, setShowWarning] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    const submitComment = useCallback(async (postId: string, commentContent: string, commentAuthorName: string | undefined) => {
        // HTML 태그를 제거하고 텍스트만 추출하여 확인
        const textContent = commentContent.replace(/<[^>]*>/g, '').trim();
        if (!textContent) {
            toast.error('댓글 내용을 입력해주세요.');
            return;
        }

        setSubmittingComment(true);
        try {
            const result = await createComment(postId, commentContent, commentAuthorName || undefined);
            if (result.success) {
                toast.success('댓글이 등록되었습니다.');
                setCommentContent('');
                setCommentAuthorName('');
                // setShowWarning(false);
                // 생성된 댓글 데이터를 전달 (부분 업데이트 가능하지만, profile_name이 없으므로 전체 리로드)
                if (result.data) {
                    const newComment: CommentWithProfile = {
                        ...result.data,
                        profile_name: null, // profile_name은 서버에서 가져와야 하므로 전체 리로드 필요
                    };
                    onCommentCreated?.(newComment, 'create');
                } else {
                    onCommentCreated?.(undefined, 'create');
                }
            } else {
                toast.error(result.error || '댓글 등록에 실패했습니다.');
            }
        } catch (error: any) {
            console.error('댓글 등록 오류:', error);
            toast.error('댓글 등록 중 오류가 발생했습니다.');
        } finally {
            setSubmittingComment(false);
        }
    }, [onCommentCreated]);

    const handleSubmitComment = useCallback(() => {
        submitComment(postId, commentContent, commentAuthorName);
    }, [postId, commentContent, commentAuthorName, submitComment]);

    return (
        <Card className="shadow-md">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">댓글 남기기</h3>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        {/* <Checkbox
                            id="warning"
                            checked={showWarning}
                            onCheckedChange={(checked) => setShowWarning(checked === true)}
                        />
                        <label htmlFor="warning" className="text-sm text-gray-700 cursor-pointer">
                            경고문구
                        </label> */}
                    </div>

                    <div id="comment-editor" className="mb-4">
                        <DynamicCustomEditor
                            text={commentContent}
                            onChange={(content) => setCommentContent(content)}
                        />
                    </div>

                    {/* 하단 버튼 */}
                    <div className="flex items-center justify-end">
                        <Button
                            onClick={handleSubmitComment}
                            disabled={submittingComment || !commentContent.trim()}
                            className="bg-[#1A2C6D] text-white hover:bg-[#1A2C6D]/90"
                        >
                            {submittingComment ? '등록 중...' : '댓글 등록'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
