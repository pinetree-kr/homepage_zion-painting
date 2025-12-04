import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * 활동 로그 통계 캐시 무효화 API
 * 로그 생성 후 통계가 업데이트되도록 호출
 */
export async function POST(request: NextRequest) {
  try {
    // 페이지 레벨 캐시 무효화
    revalidatePath('/admin/system/logs');

    return NextResponse.json({ 
      success: true,
      message: '로그 통계 캐시가 무효화되었습니다.' 
    });
  } catch (error) {
    console.error('캐시 무효화 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      },
      { status: 500 }
    );
  }
}

