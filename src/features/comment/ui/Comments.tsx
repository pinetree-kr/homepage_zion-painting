'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getCommentsByPostId } from '../api/comment-actions';
import type { Comment } from '@/src/entities/comment/model/types';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import "./style.css";

export interface CommentWithProfile extends Comment {
    profile_name?: string | null;
}

interface CommentsProps {
    postId: string;
    permissions: CommentsPermissions;
    isAdmin?: boolean;
    comments?: CommentWithProfile[]; // 서버에서 가져온 초기 댓글 데이터
}

interface CommentsPermissions {
    cmt_create: boolean;
    cmt_read: boolean;
    cmt_edit: boolean;
    cmt_delete: boolean;
}

export default function Comments({ postId, permissions, isAdmin = false, comments = [] }: CommentsProps) {
    const [items, setItems] = useState<CommentWithProfile[]>(comments);
    const [isInitialized, setIsInitialized] = useState(false);

    // 초기 댓글 데이터 설정 (서버에서 가져온 경우)
    useEffect(() => {
        if (!isInitialized) {
            setItems(comments);
            setIsInitialized(true);
        }
    }, [comments, isInitialized]);

    const loadComments = useCallback(async (postId: string) => {
        // setLoadingComments(true);
        try {
            const data = await getCommentsByPostId(postId);
            setItems(data);
        } catch (error) {
            console.error('댓글 로드 오류:', error);
            toast.error('댓글을 불러오는 중 오류가 발생했습니다.');
        } finally {
            // setLoadingComments(false);
        }
    }, []);

    // 댓글 업데이트 핸들러
    // 수정: 부분 업데이트로 플리커링 방지
    // 삭제/생성: 전체 리로드 필요 (profile_name 등 추가 정보 필요)
    const handleCommentUpdated = useCallback((updatedComment?: CommentWithProfile, action?: 'update' | 'delete' | 'create') => {
        if (action === 'update' && updatedComment) {
            // 수정된 댓글만 업데이트 (플리커링 방지)
            setItems(prevComments =>
                prevComments.map(comment =>
                    comment.id === updatedComment.id ? updatedComment : comment
                )
            );
        } else {
            // 삭제 또는 생성의 경우 전체 리로드
            // 생성 시 profile_name 등 추가 정보가 필요하고,
            // 삭제 시 리스트에서 제거해야 하므로 전체 리로드 필요
            loadComments(postId);
        }
    }, [postId, loadComments]);

    return (
        <div className="space-y-6">
            {/* 댓글 헤더 */}
            <div className="relative">
                <div className="relative inline-block">
                    <div className="bg-[#1A2C6D] text-white rounded-lg px-6 py-2 pb-3 flex flex-col items-center min-w-[80px]">
                        <span className="text-2xl font-bold">{items.length}</span>
                        <span className="text-xs">댓글</span>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2">
                        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1A2C6D]"></div>
                    </div>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-4 mb-[72px]">
                {
                    items.length > 0 ? items.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            permissions={{
                                cmt_edit: permissions.cmt_edit,
                                cmt_delete: permissions.cmt_delete,
                            }}
                            isAdmin={isAdmin}
                            onCommentUpdated={handleCommentUpdated}
                        />
                    )) : (
                        <div className="text-center py-4 bg-gray-200/80 rounded-lg text-gray-500">등록된 댓글이 없습니다.</div>
                    )
                }
            </div>

            {/* 댓글 작성 폼 */}
            {permissions.cmt_create && (
                <CommentForm
                    postId={postId}
                    onCommentCreated={handleCommentUpdated}
                />
            )}
        </div>
    );
}

