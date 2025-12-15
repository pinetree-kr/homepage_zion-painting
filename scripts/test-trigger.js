/**
 * 트리거 테스트 스크립트
 * 게시판을 생성/수정하여 트리거가 작동하는지 확인
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseKey) {
  console.error('❌ Supabase 키가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrigger() {
  console.log('🧪 트리거 테스트 시작...\n');

  try {
    // 1. 테스트용 게시판 생성
    console.log('1️⃣ 테스트 게시판 생성 중...');
    const { data: board, error: createError } = await supabase
      .from('boards')
      .insert({
        code: 'test-trigger-' + Date.now(),
        name: '트리거 테스트 게시판',
        description: '트리거 작동 확인용',
        is_public: true,
        allow_anonymous: false,
        allow_comment: false,
        allow_file: false,
        allow_guest: false,
        allow_secret: false,
        display_order: 999
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ 게시판 생성 실패:', createError.message);
      return;
    }

    console.log('✅ 게시판 생성 완료:', board.id);
    
    // 잠시 대기 (트리거 실행 시간 확보)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. 로그 확인
    console.log('\n2️⃣ 활동 로그 확인 중...');
    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('log_type', 'BOARD_CREATE')
      .order('created_at', { ascending: false })
      .limit(5);

    if (logsError) {
      console.error('❌ 로그 조회 실패:', logsError.message);
    } else {
      if (logs && logs.length > 0) {
        console.log('✅ 트리거가 작동합니다! 생성된 로그:');
        logs.forEach((log, index) => {
          console.log(`   ${index + 1}. [${log.log_type}] ${log.action}`);
          console.log(`      사용자: ${log.user_name}, 시간: ${new Date(log.created_at).toLocaleString('ko-KR')}`);
        });
      } else {
        console.log('⚠️  로그가 생성되지 않았습니다. 트리거가 작동하지 않을 수 있습니다.');
        console.log('   다음을 확인하세요:');
        console.log('   1. 마이그레이션이 적용되었는지 확인');
        console.log('   2. Supabase Dashboard에서 트리거가 생성되었는지 확인');
      }
    }

    // 3. 테스트 데이터 정리
    console.log('\n3️⃣ 테스트 데이터 정리 중...');
    const { error: deleteError } = await supabase
      .from('boards')
      .delete()
      .eq('id', board.id);

    if (deleteError) {
      console.error('⚠️  테스트 데이터 삭제 실패:', deleteError.message);
    } else {
      console.log('✅ 테스트 데이터 정리 완료');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error);
  }
}

testTrigger();

