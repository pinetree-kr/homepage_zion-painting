'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CircleUser } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Card, CardContent } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { toast } from 'sonner';
import { getCommentsByPostId, createComment } from '../api/comment-actions';
import { DynamicCustomEditor } from '@/src/features/editor';
import type { Comment } from '@/src/entities/comment/model/types';
import "./style.css";

interface CommentsProps {
    postId: string;
}

interface CommentWithProfile extends Comment {
    profile_name?: string | null;
}

export default function Comments({ postId }: CommentsProps) {
    const [comments, setComments] = useState<CommentWithProfile[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [commentAuthorName, setCommentAuthorName] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    const formatCommentDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/\./g, '-').replace(/,/g, '');
    };

    const loadComments = useCallback(async (postId: string) => {
        setLoadingComments(true);
        try {
            const data = await getCommentsByPostId(postId);
            setComments(data);
        } catch (error) {
            console.error('댓글 로드 오류:', error);
            toast.error('댓글을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoadingComments(false);
        }
    }, []);

    useEffect(() => {
        loadComments(postId);
    }, [postId, loadComments]);


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
                setShowWarning(false);
                loadComments(postId);
            } else {
                toast.error(result.error || '댓글 등록에 실패했습니다.');
            }
        } catch (error: any) {
            console.error('댓글 등록 오류:', error);
            toast.error('댓글 등록 중 오류가 발생했습니다.');
        } finally {
            setSubmittingComment(false);
        }

    }, [loadComments]);

    const handleSubmitComment = useCallback(() => {
        submitComment(postId, commentContent, commentAuthorName);
    }, [postId, commentContent, commentAuthorName, submitComment]);

    return (
        <div className="space-y-6">
            {/* 댓글 헤더 */}
            <div className="relative">
                <div className="relative inline-block">
                    <div className="bg-[#1A2C6D] text-white rounded-lg px-6 py-2 pb-3 flex flex-col items-center min-w-[80px]">
                        <span className="text-2xl font-bold">{comments.length}</span>
                        <span className="text-xs">댓글</span>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2">
                        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1A2C6D]"></div>
                    </div>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-4 mb-[72px]">
                {loadingComments ? (
                    <div className="text-center py-4 text-gray-500">댓글을 불러오는 중...</div>
                ) : (
                    comments.map((comment) => (
                        <Card key={comment.id} className="shadow-md">
                            <CardContent style={{ padding: '0px' }}>
                                <div className="flex items-center justify-between mb-2 pt-4 px-4 py-2 md:px-6">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const displayName = comment.author_id && comment.profile_name
                                                ? comment.profile_name
                                                : comment.author_name || '익명';

                                            // extra_json에서 author_image 확인 (나중에 author_image 필드가 추가될 수 있음)
                                            const authorImage = (comment as any).extra_json?.author_image || null;

                                            return (
                                                <>
                                                    <div className="relative h-6 w-6 rounded-full overflow-hidden bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] text-white flex items-center justify-center">
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
                                                    <span className="text-sm font-semibold text-gray-800">{displayName}</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {comment.updated_at && comment.updated_at !== comment.created_at
                                            ? `Updated at ${formatCommentDate(comment.updated_at)}`
                                            : formatCommentDate(comment.created_at)}
                                    </span>
                                </div>
                                <div
                                    className="text-sm text-gray-700 prose prose-sm max-w-none px-4 py-2 pb-3 md:pb-4 md:px-6"
                                    dangerouslySetInnerHTML={{ __html: comment.context }}
                                />
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* 댓글 작성 폼 */}
            <Card className="shadow-md">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">댓글 남기기</h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="warning"
                                checked={showWarning}
                                onCheckedChange={(checked) => setShowWarning(checked === true)}
                            />
                            <label htmlFor="warning" className="text-sm text-gray-700 cursor-pointer">
                                경고문구
                            </label>
                        </div>

                        {/* <div className="border border-gray-200 rounded-lg overflow-hidden"> */}
                        <div id="comment-editor" className="mb-4">
                            <DynamicCustomEditor
                                text={commentContent}
                                onChange={(content) => setCommentContent(content)}
                            />
                        </div>
                        {/* </div> */}

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
        </div>
    );
}

