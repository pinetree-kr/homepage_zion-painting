/**
 * 활동 로그 트리거 확인 스크립트
 * 
 * 사용법:
 * node scripts/check-triggers.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseKey) {
  console.error('❌ Supabase 키가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 또는 SUPABASE_SERVICE_ROLE_KEY 환경 변수를 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggers() {
  console.log('🔍 활동 로그 트리거 확인 중...\n');

  try {
    // 1. activity_logs 테이블 존재 확인
    console.log('1️⃣ activity_logs 테이블 확인...');
    const { data: tables, error: tableError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name = 'activity_logs'
        `
      });

    if (tableError) {
      // RPC가 없을 수 있으므로 직접 쿼리
      const { data: logs, error: logsError } = await supabase
        .from('activity_logs')
        .select('id')
        .limit(1);

      if (logsError) {
        console.error('❌ activity_logs 테이블이 존재하지 않습니다:', logsError.message);
        return;
      }
      console.log('✅ activity_logs 테이블이 존재합니다.');
    } else {
      console.log('✅ activity_logs 테이블이 존재합니다.');
    }

    // 2. 최근 로그 확인
    console.log('\n2️⃣ 최근 활동 로그 확인...');
    const { data: recentLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select('id, user_name, log_type, action, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('❌ 로그 조회 실패:', logsError.message);
    } else {
      if (recentLogs && recentLogs.length > 0) {
        console.log(`✅ 최근 ${recentLogs.length}개의 로그가 있습니다:`);
        recentLogs.forEach((log, index) => {
          console.log(`   ${index + 1}. [${log.log_type}] ${log.action} - ${log.user_name} (${new Date(log.created_at).toLocaleString('ko-KR')})`);
        });
      } else {
        console.log('⚠️  로그가 없습니다. 트리거가 작동하지 않을 수 있습니다.');
      }
    }

    // 3. 로그 타입별 개수 확인
    console.log('\n3️⃣ 로그 타입별 개수 확인...');
    const { data: typeCounts, error: countError } = await supabase
      .from('activity_logs')
      .select('log_type');

    if (countError) {
      console.error('❌ 로그 타입별 개수 조회 실패:', countError.message);
    } else {
      const counts = {};
      typeCounts?.forEach(log => {
        counts[log.log_type] = (counts[log.log_type] || 0) + 1;
      });

      if (Object.keys(counts).length > 0) {
        console.log('✅ 로그 타입별 개수:');
        Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .forEach(([type, count]) => {
            console.log(`   ${type}: ${count}개`);
          });
      } else {
        console.log('⚠️  로그가 없습니다.');
      }
    }

    // 4. 트리거 함수 존재 확인 (간접적으로)
    console.log('\n4️⃣ 트리거 함수 확인...');
    console.log('   (PostgreSQL 시스템 테이블 직접 조회는 Supabase API로 불가능합니다)');
    console.log('   Supabase Dashboard의 SQL Editor에서 다음 쿼리를 실행하세요:');
    console.log('   SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE \'log_%\';');

    console.log('\n✅ 확인 완료!');
    console.log('\n💡 추가 확인 사항:');
    console.log('   - Supabase Dashboard > SQL Editor에서 docs/CHECK_ACTIVITY_LOGS_TRIGGERS.sql 실행');
    console.log('   - 트리거가 작동하는지 테스트하려면 게시판을 생성/수정해보세요');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error);
  }
}

checkTriggers();

