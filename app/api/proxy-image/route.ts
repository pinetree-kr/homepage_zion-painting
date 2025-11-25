import { NextRequest, NextResponse } from 'next/server';

/**
 * 외부 이미지를 서버 사이드에서 가져와서 프록시하는 API 라우트
 * CORS 문제를 해결하기 위해 사용됩니다.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: '이미지 URL이 필요합니다.' },
        { status: 400 }
      );
    }

    // URL 유효성 검사
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: '유효하지 않은 URL입니다.' },
        { status: 400 }
      );
    }

    // 허용된 프로토콜만 허용 (보안)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json(
        { error: '허용되지 않은 프로토콜입니다.' },
        { status: 400 }
      );
    }

    // 이미지 가져오기
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: '이미지를 가져올 수 없습니다.' },
        { status: response.status }
      );
    }

    // Content-Type 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일이 아닙니다.' },
        { status: 400 }
      );
    }

    // 이미지 데이터 가져오기
    const imageBuffer = await response.arrayBuffer();

    // 응답 반환
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('이미지 프록시 오류:', error);
    return NextResponse.json(
      { error: '이미지를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

