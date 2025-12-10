'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, File } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { Checkbox } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/src/shared/ui';
import { DynamicCustomEditor } from '@/src/features/editor';
import { toast } from 'sonner';
import { Post, PostFile } from '@/src/entities/post/model/types';
import { savePost, saveProductReview, saveProductInquiry, getProductReview, getProductInquiry } from '../api/post-actions';
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import type { Profile } from '@/src/entities/user/model/types';
import { FileUploader, type UploadedFile } from '@/src/shared/ui';
import { getCurrentDateString } from '@/src/shared/lib/utils';
import { getProductsUsingAdmin } from '@/src/features/board/api/board-actions';
import Image from 'next/image';

interface PostFormProps {
  boardId: string;
  boardCode: string;
  boardName: string;
  allowGuest: boolean; // 서버에서 이미 확인된 값
  allowProductLink: boolean; // 서버에서 이미 확인된 값 (board_id 기반)
  boardPolicies?: Array<{ role: string; file_upload: boolean }>; // 하위 호환성을 위해 유지 (관리자 페이지용)
  allowFile?: boolean; // 서버에서 이미 확인된 파일 업로드 권한 (일반 사용자용)
  postId?: string;
  data?: Post | null;
  redirectPath?: string; // 저장 후 리다이렉트할 경로 (기본값: 관리자 페이지)
  hideStatusField?: boolean; // 상태 필드 숨김 여부 (일반 사용자용)
}

/**
 * HTML content에서 첫 번째 이미지 URL을 추출합니다.
 */
function extractFirstImageUrl(htmlContent: string): string | null {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return null;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const firstImg = doc.querySelector('img');

    if (firstImg && firstImg.src) {
      if (!firstImg.src.startsWith('data:')) {
        return firstImg.src;
      }
    }
  } catch (error) {
    console.error('이미지 URL 추출 오류:', error);
  }

  try {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = htmlContent.match(imgRegex);
    if (match && match[1] && !match[1].startsWith('data:')) {
      return match[1];
    }
  } catch (error) {
    console.error('정규식 이미지 URL 추출 오류:', error);
  }

  return null;
}

export default function PostForm({
  boardId,
  boardCode,
  boardName,
  allowGuest,
  allowProductLink,
  boardPolicies = [],
  allowFile: allowFileProp,
  postId,
  data = null,
  redirectPath,
  hideStatusField = false,
}: PostFormProps) {
  // 파일 업로드 권한 확인: allowFile prop이 있으면 사용, 없으면 boardPolicies에서 계산 (하위 호환성)
  const allowFile = allowFileProp !== undefined
    ? allowFileProp
    : boardPolicies.some(policy => policy.file_upload);
  const router = useRouter();
  const [post, setPost] = useState<Omit<Post, 'id' | 'view_count' | 'like_count' | 'comment_count' | 'created_at' | 'updated_at' | 'deleted_at' | 'board_id'> & { id?: string | null }>(() => {
    if (data) {
      return {
        id: data.id,
        category_id: data.category_id,
        title: data.title,
        content: data.content,
        content_metadata: data.content_metadata || { thumbnail_url: null, summary: '', is_secret: false },
        author_id: data.author_id,
        author_metadata: data.author_metadata || { name: '', email: null, phone: null },
        status: data.status,
        is_pinned: data.is_pinned,
        files: data.files || [],
        extra_json: data.extra_json || null,
      };
    }
    return {
      category_id: null,
      title: '',
      content: '',
      content_metadata: { thumbnail_url: null, summary: '', is_secret: false },
      author_id: null,
      author_metadata: { name: '', email: null, phone: null },
      status: hideStatusField ? 'published' : 'draft',
      is_pinned: false,
      files: [],
      extra_json: null,
    };
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [linkedProducts, setLinkedProducts] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // allowGuest가 false일 때 로그인 확인 및 사용자 정보 자동 채우기
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        // 관리자 여부 확인 (로그인된 경우에만)
        if (user) {
          const { data: adminData } = await supabaseClient
            .from('administrators')
            .select('id')
            .eq('id', user.id)
            .is('deleted_at', null)
            .maybeSingle();

          setIsAdmin(adminData !== null);
        } else {
          setIsAdmin(false);
        }

        if (allowGuest) {
          // allowGuest가 true이면 로그인 확인 불필요
          setLoading(false);
          return;
        }

        // allowGuest가 false이면 로그인 확인 필요
        if (userError || !user) {
          toast.error('로그인이 필요합니다.');
          router.push('/auth/sign-in');
          return;
        }

        // 수정 모드가 아니고 (data가 없을 때) 사용자 정보로 자동 채우기
        if (!data) {
          // 사용자 프로필 정보 가져오기
          const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id, name, email, phone')
            .eq('id', user.id)
            .single<Profile>();

          if (profileError || !profile) {
            toast.error('사용자 정보를 가져올 수 없습니다.');
            router.push('/auth/sign-in');
            return;
          }

          // 사용자 정보로 자동 채우기
          setPost((prev) => ({
            ...prev,
            author_id: profile.id,
            author_name: profile.name || '',
            author_email: profile.email || '',
            author_phone: (profile.metadata as { phone?: string } | null)?.phone || '',
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        toast.error('사용자 정보를 불러오는 중 오류가 발생했습니다.');
        if (!allowGuest) {
          router.push('/auth/sign-in');
        } else {
          setLoading(false);
        }
      }
    };

    loadUserInfo();
  }, [allowGuest, router, data]);

  // 게시물 수정 모드일 때 기존 파일 목록 로드 (data에서 직접 가져옴)
  useEffect(() => {
    if (data?.files && allowFile) {
      // data.files를 UploadedFile 형식으로 변환
      const existingFilesAsUploaded: UploadedFile[] = (data.files || []).map((file) => ({
        id: file.file_url, // file_url을 id로 사용 (고유 식별자)
        name: file.file_name,
        size: file.file_size,
        type: file.mime_type,
        url: file.file_url,
        file: null as any, // 기존 파일이므로 File 객체는 없음
      }));
      setUploadedFiles(existingFilesAsUploaded);
    }
  }, [data, allowFile]);

  // 제품 목록 로드 (board_id 기반으로 제품 연결 가능한 게시판일 때만)
  useEffect(() => {
    const loadProducts = async () => {
      if (allowProductLink) {
        setLoadingProducts(true);
        try {
          const products = await getProductsUsingAdmin();
          setLinkedProducts(products);
        } catch (error) {
          console.error('제품 목록 로드 오류:', error);
          toast.error('제품 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();
  }, [allowProductLink]);

  // 수정 모드일 때 기존 제품 정보 로드 (post_id 기반)
  useEffect(() => {
    const loadExistingProduct = async () => {
      if (postId && allowProductLink) {
        try {
          // post_id로 product_reviews 확인
          const review = await getProductReview(postId);
          if (review?.product_id) {
            setSelectedProductId(review.product_id);
            return;
          }

          // product_reviews가 없으면 product_inquiries 확인
          const inquiry = await getProductInquiry(postId);
          if (inquiry?.product_id) {
            setSelectedProductId(inquiry.product_id);
          }
        } catch (error) {
          console.error('기존 제품 정보 로드 오류:', error);
        }
      }
    };

    loadExistingProduct();
  }, [postId, allowProductLink]);

  /**
   * 파일을 Supabase Storage에 업로드
   */
  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const fileName = `post-files/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('post-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('파일 업로드 오류:', uploadError);
        throw new Error(`파일 업로드에 실패했습니다: ${uploadError.message}`);
      }

      // 공개 URL 가져오기
      const { data } = supabaseClient.storage
        .from('post-files')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      console.error('파일 업로드 중 오류:', error);
      throw error;
    }
  };

  /**
   * 파일 목록 변경 핸들러
   */
  const handleFilesChange = async (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  /**
   * 기존 파일 삭제 확인 모달 열기
   */
  const handleDeleteExistingFileClick = (fileUrl: string, fileName: string) => {
    setFileToDelete({ id: fileUrl, name: fileName });
  };

  /**
   * 기존 파일 삭제 실행
   */
  const handleDeleteExistingFile = async () => {
    if (!fileToDelete) return;

    setDeletingFile(true);
    try {
      // uploadedFiles에서 해당 파일 제거
      setUploadedFiles((prev) => prev.filter((f) => f.url !== fileToDelete.id));
      toast.success('파일이 삭제되었습니다.');
      setFileToDelete(null);
    } catch (error: any) {
      console.error('파일 삭제 오류:', error);
      toast.error('파일 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingFile(false);
    }
  };

  const handleSave = async () => {
    if (!post.title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!post.content?.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      setUploading(true);

      // content에서 첫 번째 이미지 URL 추출
      const extractedImageUrl = extractFirstImageUrl(post.content);

      // content_metadata 업데이트 (썸네일이 없으면 자동으로 추출한 이미지 사용)
      const contentMetadata = {
        thumbnail_url: extractedImageUrl || post.content_metadata?.thumbnail_url || null,
        summary: post.content_metadata?.summary || '',
        is_secret: post.content_metadata?.is_secret || false,
      };

      // files 배열 생성 (uploadedFiles에서)
      const filesToSave: Array<{
        id?: string;
        file_url: string;
        file_name: string;
        file_size: number;
        mime_type: string;
        created_at?: string | null;
        updated_at?: string | null;
      }> = uploadedFiles.map((uploadedFile) => {
        // 기존 파일인 경우 (url이 있고 file이 없는 경우)
        if (uploadedFile.url && !uploadedFile.file) {
          // 기존 파일 정보 찾기
          const existingFile = post.files?.find((f) => f.file_url === uploadedFile.url);
          if (existingFile) {
            return {
              file_url: existingFile.file_url,
              file_name: existingFile.file_name,
              file_size: existingFile.file_size,
              mime_type: existingFile.mime_type,
              created_at: existingFile.created_at,
              updated_at: existingFile.updated_at,
            };
          }
        }
        // 새 파일인 경우
        return {
          file_url: uploadedFile.url || '',
          file_name: uploadedFile.name,
          file_size: uploadedFile.size,
          mime_type: uploadedFile.type,
        };
      });

      const postToSave = {
        ...post,
        status: hideStatusField ? 'published' : post.status, // hideStatusField가 true이면 항상 'published'
        content_metadata: contentMetadata,
        files: filesToSave,
        board_id: boardId,
      };

      // 새 파일들을 Storage에 업로드
      if (allowFile && uploadedFiles.length > 0) {
        for (const uploadedFile of uploadedFiles) {
          try {
            // URL이 없고 file이 있는 경우 (새 파일)만 업로드
            if (!uploadedFile.url && uploadedFile.file) {
              const fileUrl = await uploadFileToStorage(uploadedFile.file);
              if (fileUrl) {
                uploadedFile.url = fileUrl;
              } else {
                console.error(`파일 업로드 실패: ${uploadedFile.name}`);
                toast.error(`${uploadedFile.name} 업로드에 실패했습니다.`);
              }
            }
          } catch (error: any) {
            console.error(`파일 업로드 오류 (${uploadedFile.name}):`, error);
            toast.error(`${uploadedFile.name} 업로드에 실패했습니다.`);
          }
        }

        // 업로드된 파일 URL로 files 배열 업데이트
        const filesToSave: PostFile[] = uploadedFiles
          .filter((f) => f.url) // URL이 있는 파일만
          .map((uploadedFile) => {
            // 기존 파일인 경우 (url이 있고 file이 없는 경우)
            if (uploadedFile.url && !uploadedFile.file) {
              const existingFile = post.files?.find((f) => f.file_url === uploadedFile.url);
              if (existingFile) {
                return {
                  file_url: existingFile.file_url,
                  file_name: existingFile.file_name,
                  file_size: existingFile.file_size,
                  mime_type: existingFile.mime_type,
                  created_at: existingFile.created_at || null,
                  updated_at: existingFile.updated_at || null,
                };
              }
            }
            // 새 파일인 경우
            return {
              file_url: uploadedFile.url || '',
              file_name: uploadedFile.name,
              file_size: uploadedFile.size,
              mime_type: uploadedFile.type,
            };
          });

        postToSave.files = filesToSave;
      }

      // 게시물 저장 (files 포함)
      const result = await savePost(postToSave);
      if (!result.success || !result.id) {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
        return;
      }

      // 제품 연결이 허용된 경우 추가 정보 저장 (post_id 기반)
      // posts를 먼저 저장한 후, post_id로 기존 product_reviews나 product_inquiries 확인하여 저장
      if (allowProductLink && selectedProductId) {
        // post_id로 기존 product_reviews 확인
        const existingReview = await getProductReview(result.id);
        if (existingReview) {
          // 기존에 product_reviews가 있으면 업데이트
          const reviewResult = await saveProductReview(result.id, selectedProductId, {
            rating: existingReview.rating,
            pros: existingReview.pros,
            cons: existingReview.cons,
            purchase_date: existingReview.purchase_date,
          });
          if (!reviewResult.success) {
            console.error('리뷰 정보 저장 오류:', reviewResult.error);
            toast.warning('게시물은 저장되었지만 리뷰 정보 저장에 실패했습니다.');
          }
        } else {
          // product_reviews가 없으면 product_inquiries 확인
          const existingInquiry = await getProductInquiry(result.id);
          if (existingInquiry) {
            // 기존에 product_inquiries가 있으면 업데이트
            const inquiryResult = await saveProductInquiry(result.id, selectedProductId, {
              type: existingInquiry.type,
            });
            if (!inquiryResult.success) {
              console.error('문의 정보 저장 오류:', inquiryResult.error);
              toast.warning('게시물은 저장되었지만 문의 정보 저장에 실패했습니다.');
            }
          } else {
            // 둘 다 없으면 product_reviews로 새로 생성
            const reviewResult = await saveProductReview(result.id, selectedProductId, {
              rating: 0,
              pros: '',
              cons: '',
              purchase_date: getCurrentDateString(),
            });
            if (!reviewResult.success) {
              console.error('리뷰 정보 저장 오류:', reviewResult.error);
              toast.warning('게시물은 저장되었지만 리뷰 정보 저장에 실패했습니다.');
            }
          }
        }
      }

      toast.success('게시글이 저장되었습니다.');
      // redirectPath가 제공되면 해당 경로로, 아니면 관리자 페이지로 리다이렉트
      const finalRedirectPath = redirectPath
        ? `${redirectPath}/${result.id}`
        : `/admin/boards/${boardId}/${result.id}`;
      router.push(finalRedirectPath);
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#1A2C6D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl font-semibold">{boardName} {postId ? '수정' : '작성'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`grid grid-cols-1 ${hideStatusField ? '' : 'md:grid-cols-4 md:gap-4'}`}>
            <div className={`space-y-2 ${hideStatusField ? '' : 'col-span-3'}`}>
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                placeholder="제목을 입력하세요"
              />
            </div>

            {!hideStatusField && (
              <div className="space-y-2 col-span-1">
                <Label htmlFor="status">상태</Label>
                <Select
                  value={post.status}
                  onValueChange={(value: 'draft' | 'published') => setPost({ ...post, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">임시저장</SelectItem>
                    <SelectItem value="published">게시됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* 제품 선택 (board_id 기반으로 제품 연결 가능한 게시판일 때만) */}
          {allowProductLink && (
            <div className="space-y-2">
              <Label htmlFor="product">연결된 제품</Label>
              <Select
                value={selectedProductId || ''}
                onValueChange={(value) => setSelectedProductId(value || null)}
                disabled={loadingProducts}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder={loadingProducts ? '제품 목록 로딩 중...' : '제품 선택 (선택사항)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">선택 안함</SelectItem>
                  {linkedProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {allowGuest && (
            <>
              <div className="space-y-2">
                <Label htmlFor="author_name">이름</Label>
                <Input
                  id="author_name"
                  value={post.author_metadata?.name || ''}
                  onChange={(e) => setPost({ ...post, author_metadata: { ...post.author_metadata, name: e.target.value } })}
                  placeholder="이름"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_email">이메일</Label>
                <Input
                  id="author_email"
                  type="email"
                  value={post.author_metadata?.email || ''}
                  onChange={(e) => setPost({ ...post, author_metadata: { ...post.author_metadata, email: e.target.value } })}
                  placeholder="이메일"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_phone">전화번호</Label>
                <Input
                  id="author_phone"
                  value={post.author_metadata?.phone || ''}
                  onChange={(e) => setPost({ ...post, author_metadata: { ...post.author_metadata, phone: e.target.value } })}
                  placeholder="전화번호 (선택사항)"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <DynamicCustomEditor
              text={post.content}
              onChange={(content) => setPost({ ...post, content })}
            />
          </div>

          {allowFile && (
            <div className="space-y-2">
              <Label>첨부 파일</Label>
              <FileUploader
                files={uploadedFiles}
                onFilesChange={handleFilesChange}
                maxFiles={10}
                maxSizeMB={1}
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                disabled={saving || uploading}
              />

              {/* 업로드된 파일 목록 (기존 + 새 파일) */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">첨부된 파일</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((uploadedFile, index) => {
                      const isImage = uploadedFile.type.startsWith('image/');
                      return (
                        <div
                          key={uploadedFile.url || index}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          {isImage && uploadedFile.url ? (
                            <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100 relative">
                              <Image
                                src={uploadedFile.url}
                                alt={uploadedFile.name}
                                fill
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                              <File className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(uploadedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExistingFileClick(uploadedFile.url || '', uploadedFile.name)}
                            disabled={saving || uploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_pinned"
                  checked={post.is_pinned}
                  onCheckedChange={(checked) => setPost({ ...post, is_pinned: checked === true })}
                />
                <Label htmlFor="is_pinned" className="cursor-pointer">
                  고정 게시글
                </Label>
              </div>
            )}

          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            size="lg"
            className="h-[42px] gap-2"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploading}
            className="h-[42px] gap-2"
            size="lg"
          >
            <Save className="h-4 w-4" />
            {saving || uploading ? '저장 중...' : '저장'}
          </Button>
        </CardFooter>
      </Card>

      {/* 파일 삭제 확인 모달 */}
      <Dialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>파일 삭제</DialogTitle>
            <DialogDescription>
              정말로 "{fileToDelete?.name}" 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFileToDelete(null)}
              disabled={deletingFile}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteExistingFile}
              disabled={deletingFile}
            >
              {deletingFile ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

