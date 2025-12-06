'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Check } from 'lucide-react';
import { Board, type BoardPolicy, VisibleType, AppRole } from '@/src/entities/board/model/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/shared/ui';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/shared/ui';
import { toast } from 'sonner';
import { createBoard, updateBoard, deleteBoard, getBoardPolicies } from '../api/board-actions';
import { cn } from '@/src/shared/ui';

interface BoardFormProps {
    board?: Board;
    boardPolicies?: BoardPolicy[];
}

export default function BoardForm({ board, boardPolicies = [] }: BoardFormProps) {
    const router = useRouter();
    const isEdit = !!board;

    const [form, setForm] = useState({
        code: board?.code || '',
        name: board?.name || '',
        description: board?.description || '',
        visibility: (board?.visibility || 'public') as VisibleType,
    });

    // 권한 정책 상태
    const [policies, setPolicies] = useState<{
        admin: Omit<BoardPolicy, 'board_id' | 'role' | 'created_at' | 'updated_at'>;
        member: Omit<BoardPolicy, 'board_id' | 'role' | 'created_at' | 'updated_at'>;
    }>({
        admin: {
            post_list: false,
            post_create: false,
            post_read: false,
            post_edit: false,
            post_delete: false,
            cmt_create: false,
            cmt_read: false,
            cmt_edit: false,
            cmt_delete: false,
            file_upload: false,
            file_download: false,
        },
        member: {
            post_list: false,
            post_create: false,
            post_read: false,
            post_edit: false,
            post_delete: false,
            cmt_create: false,
            cmt_read: false,
            cmt_edit: false,
            cmt_delete: false,
            file_upload: false,
            file_download: false,
        },
    });

    useEffect(() => {
        if (boardPolicies.length > 0) {
            setPolicies({
                admin: boardPolicies.find(p => p.role === 'admin') || policies.admin,
                member: boardPolicies.find(p => p.role === 'member') || policies.member,
            });
        }
    }, [boardPolicies]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);


    // 기존 게시판의 권한 정책 로드
    // useEffect(() => {
    //     if (isEdit && board?.id) {
    //         // loadPolicies();

    //     }
    // }, [isEdit, board?.id, boardPolicies]);

    // const loadPolicies = async () => {
    //     if (!board?.id) return;

    //     setLoadingPolicies(true);
    //     try {
    //         const loadedPolicies = await getBoardPolicies(board.id);
    //         const adminPolicy = loadedPolicies.find(p => p.role === 'admin');
    //         const memberPolicy = loadedPolicies.find(p => p.role === 'member');

    //         if (adminPolicy) {
    //             setPolicies(prev => ({
    //                 ...prev,
    //                 admin: {
    //                     post_list: adminPolicy.post_list,
    //                     post_create: adminPolicy.post_create,
    //                     post_read: adminPolicy.post_read,
    //                     post_edit: adminPolicy.post_edit,
    //                     post_delete: adminPolicy.post_delete,
    //                     cmt_create: adminPolicy.cmt_create,
    //                     cmt_read: adminPolicy.cmt_read,
    //                     cmt_edit: adminPolicy.cmt_edit,
    //                     cmt_delete: adminPolicy.cmt_delete,
    //                     file_upload: adminPolicy.file_upload,
    //                     file_download: adminPolicy.file_download,
    //                 },
    //             }));
    //         }

    //         if (memberPolicy) {
    //             setPolicies(prev => ({
    //                 ...prev,
    //                 member: {
    //                     post_list: memberPolicy.post_list,
    //                     post_create: memberPolicy.post_create,
    //                     post_read: memberPolicy.post_read,
    //                     post_edit: memberPolicy.post_edit,
    //                     post_delete: memberPolicy.post_delete,
    //                     cmt_create: memberPolicy.cmt_create,
    //                     cmt_read: memberPolicy.cmt_read,
    //                     cmt_edit: memberPolicy.cmt_edit,
    //                     cmt_delete: memberPolicy.cmt_delete,
    //                     file_upload: memberPolicy.file_upload,
    //                     file_download: memberPolicy.file_download,
    //                 },
    //             }));
    //         }
    //     } catch (error) {
    //         console.error('권한 정책 로드 실패:', error);
    //     } finally {
    //         setLoadingPolicies(false);
    //     }
    // };

    const updatePolicy = (role: AppRole, field: keyof BoardPolicy, value: boolean) => {
        setPolicies(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [field]: value,
            },
        }));
    };

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
            const policiesToSave: Omit<BoardPolicy, 'board_id' | 'created_at' | 'updated_at'>[] = [
                { role: 'admin', ...policies.admin },
                { role: 'member', ...policies.member },
            ];

            if (isEdit && board) {
                const result = await updateBoard(board.id, form, policiesToSave);
                if (result.success) {
                    toast.success('게시판이 수정되었습니다.');
                    router.refresh();
                } else {
                    toast.error(result.error || '게시판 수정에 실패했습니다.');
                }
            } else {
                // display_order는 기본값으로 설정
                const result = await createBoard({
                    ...form,
                    display_order: 0,
                }, policiesToSave);
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
                router.push('/admin/services/boards/list');
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
                    onClick={() => router.push('/admin/services/boards/list')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    목록으로
                </Button>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-gray-900 text-lg font-semibold">게시판 기본 정보</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
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
                                    placeholder="예: 공지사항"
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

                            <div className="space-y-2 mb-4">
                                <Label>공개 범위</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={form.visibility === 'public' ? 'default' : 'outline'}
                                        onClick={() => setForm({ ...form, visibility: 'public' })}
                                        className={cn(
                                            "h-10 flex-1",
                                            form.visibility === 'public' && "bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
                                        )}
                                    >
                                        공개
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={form.visibility === 'member' ? 'default' : 'outline'}
                                        onClick={() => setForm({ ...form, visibility: 'member' })}
                                        className={cn(
                                            "h-10 flex-1",
                                            form.visibility === 'member' && "bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
                                        )}
                                    >
                                        회원용
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={form.visibility === 'owner' ? 'default' : 'outline'}
                                        onClick={() => setForm({ ...form, visibility: 'owner' })}
                                        className={cn(
                                            "h-10 flex-1",
                                            form.visibility === 'owner' && "bg-[#155DFC] text-white hover:bg-[#155DFC]/90"
                                        )}
                                    >
                                        1:1 게시판
                                    </Button>
                                </div>
                                {form.visibility === 'public' && (
                                    <p className="text-sm text-gray-600">
                                        * 이 게시판은 비로그인 사용자도 접근이 가능합니다.
                                    </p>
                                )}
                                {form.visibility === 'member' && (
                                    <p className="text-sm text-gray-600">
                                        * 이 게시판은 로그인한 사용자만 접근이 가능합니다.
                                    </p>
                                )}
                                {form.visibility === 'owner' && (
                                    <p className="text-sm text-gray-600">
                                        * 이 게시판은 작성자와 관리자만 접근이 가능합니다.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-gray-200">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-4">역할별 권한 설정</h3>

                                {/* 게시글 권한 */}
                                <div className="mb-6">
                                    <div className="border-b border-gray-200 pb-2 mb-4">
                                        <h4 className="text-sm font-medium text-gray-700">게시글 권한</h4>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 w-[60%]">권한</th>
                                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                                        <div className="flex flex-col items-center">
                                                            <span>관리자</span>
                                                            {/* <span className="text-xs text-gray-500 font-normal">(Admin)</span> */}
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                                        <div className="flex flex-col items-center">
                                                            <span>회원</span>
                                                            {/* <span className="text-xs text-gray-500 font-normal">(Member)</span> */}
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <PermissionRow
                                                    label="게시글 목록"
                                                    adminChecked={policies.admin.post_list}
                                                    memberChecked={policies.member.post_list}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'post_list', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'post_list', checked)}
                                                />
                                                <PermissionRow
                                                    label="글 작성"
                                                    adminChecked={policies.admin.post_create}
                                                    memberChecked={policies.member.post_create}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'post_create', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'post_create', checked)}
                                                />
                                                <PermissionRow
                                                    label="글 읽기"
                                                    adminChecked={policies.admin.post_read}
                                                    memberChecked={policies.member.post_read}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'post_read', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'post_read', checked)}
                                                />
                                                <PermissionRow
                                                    label="글 수정"
                                                    note="회원은 자기 글만"
                                                    adminChecked={policies.admin.post_edit}
                                                    memberChecked={policies.member.post_edit}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'post_edit', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'post_edit', checked)}
                                                />
                                                <PermissionRow
                                                    label="글 삭제"
                                                    note="회원은 자기 글만"
                                                    adminChecked={policies.admin.post_delete}
                                                    memberChecked={policies.member.post_delete}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'post_delete', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'post_delete', checked)}
                                                />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 댓글 권한 */}
                                <div className="mb-6">
                                    <div className="border-b border-gray-200 pb-2 mb-4">
                                        <h4 className="text-sm font-medium text-gray-700">댓글 권한</h4>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 w-[60%]">권한</th>
                                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                                        <div className="flex flex-col items-center">
                                                            <span>관리자</span>
                                                            {/* <span className="text-xs text-gray-500 font-normal">(Admin)</span> */}
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                                        <div className="flex flex-col items-center">
                                                            <span>회원</span>
                                                            {/* <span className="text-xs text-gray-500 font-normal">(Member)</span> */}
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <PermissionRow
                                                    label="댓글 작성"
                                                    adminChecked={policies.admin.cmt_create}
                                                    memberChecked={policies.member.cmt_create}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'cmt_create', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'cmt_create', checked)}
                                                />
                                                <PermissionRow
                                                    label="댓글 읽기"
                                                    adminChecked={policies.admin.cmt_read}
                                                    memberChecked={policies.member.cmt_read}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'cmt_read', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'cmt_read', checked)}
                                                />
                                                <PermissionRow
                                                    label="댓글 수정"
                                                    note="회원은 자기 댓글만"
                                                    adminChecked={policies.admin.cmt_edit}
                                                    memberChecked={policies.member.cmt_edit}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'cmt_edit', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'cmt_edit', checked)}
                                                />
                                                <PermissionRow
                                                    label="댓글 삭제"
                                                    note="회원은 자기 댓글만"
                                                    adminChecked={policies.admin.cmt_delete}
                                                    memberChecked={policies.member.cmt_delete}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'cmt_delete', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'cmt_delete', checked)}
                                                />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 파일 권한 */}
                                <div>
                                    <div className="border-b border-gray-200 pb-2 mb-4">
                                        <h4 className="text-sm font-medium text-gray-700">파일 권한</h4>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 w-[60%]">권한</th>
                                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                                        <div className="flex flex-col items-center">
                                                            <span>관리자</span>
                                                            {/* <span className="text-xs text-gray-500 font-normal">(Admin)</span> */}
                                                        </div>
                                                    </th>
                                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                                        <div className="flex flex-col items-center">
                                                            <span>회원</span>
                                                            {/* <span className="text-xs text-gray-500 font-normal">(Member)</span> */}
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <PermissionRow
                                                    label="파일 업로드"
                                                    adminChecked={policies.admin.file_upload}
                                                    memberChecked={policies.member.file_upload}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'file_upload', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'file_upload', checked)}
                                                />
                                                <PermissionRow
                                                    label="파일 다운로드"
                                                    adminChecked={policies.admin.file_download}
                                                    memberChecked={policies.member.file_download}
                                                    onAdminChange={(checked) => updatePolicy('admin', 'file_download', checked)}
                                                    onMemberChange={(checked) => updatePolicy('member', 'file_download', checked)}
                                                />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/admin/services/boards/list')}
                            className="h-[42px]"
                        >
                            취소
                        </Button>
                        <div className="flex items-center gap-3">
                            {isEdit && board && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="h-[42px] gap-2"
                                    disabled={deleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {deleting ? '삭제 중...' : '삭제'}
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="h-[42px] gap-2"
                                size="lg"
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting ? '저장 중...' : '저장'}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* 기존 게시판 설정 (숨김 처리) */}
                <Card className="p-6 hidden">
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
                            <Label htmlFor="description">게시판 설명</Label>
                            <Input
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="게시판에 대한 설명을 입력하세요"
                            />
                        </div>

                    </form>
                </Card>
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

// 권한 행 컴포넌트
interface PermissionRowProps {
    label: string;
    note?: string;
    adminChecked: boolean;
    memberChecked: boolean;
    onAdminChange: (checked: boolean) => void;
    onMemberChange: (checked: boolean) => void;
}

function PermissionRow({ label, note, adminChecked, memberChecked, onAdminChange, onMemberChange }: PermissionRowProps) {
    return (
        <tr className="border-b border-gray-100">
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{label}</span>
                    {note && <span className="text-xs text-gray-500">({note})</span>}
                </div>
            </td>
            <td className="px-4 py-4 text-center">
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => onAdminChange(!adminChecked)}
                        className={cn(
                            "w-5 h-5 rounded transition-colors flex items-center justify-center",
                            adminChecked
                                ? "bg-[#155DFC] hover:bg-[#155DFC]/90"
                                : "bg-gray-200 hover:bg-gray-300"
                        )}
                    >
                        {adminChecked && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                </div>
            </td>
            <td className="px-4 py-4 text-center">
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => onMemberChange(!memberChecked)}
                        className={cn(
                            "w-5 h-5 rounded transition-colors flex items-center justify-center",
                            memberChecked
                                ? "bg-[#155DFC] hover:bg-[#155DFC]/90"
                                : "bg-gray-200 hover:bg-gray-300"
                        )}
                    >
                        {memberChecked && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                </div>
            </td>
        </tr>
    );
}

