export type LogType = 
  | 'USER_SIGNUP'           // 사용자 가입
  | 'ADMIN_SIGNUP'          // 관리자 가입
  | 'LOGIN_FAILED'          // 로그인 실패
  | 'ADMIN_LOGIN'           // 관리자 로그인
  | 'SECTION_SETTING_CHANGE' // 섹션 설정 변경
  | 'BOARD_CREATE'          // 게시판 생성
  | 'BOARD_UPDATE'          // 게시판 수정
  | 'BOARD_DELETE'          // 게시판 삭제
  | 'POST_CREATE'           // 게시글 작성 (Q&A, 견적문의)
  | 'POST_UPDATE'           // 게시글 수정
  | 'POST_DELETE'           // 게시글 삭제
  | 'POST_ANSWER'           // 관리자 답변
  | 'COMMENT_CREATE'        // 댓글 작성
  | 'COMMENT_UPDATE'        // 댓글 수정
  | 'COMMENT_DELETE'        // 댓글 삭제
  | 'ERROR';                // 오류 로그

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  logType: LogType;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  metadata?: {
    sectionName?: string;      // 섹션 이름 (설정 변경 시)
    boardName?: string;        // 게시판 이름
    postId?: string;           // 게시글 ID
    errorMessage?: string;     // 오류 메시지
    beforeValue?: string;      // 변경 전 값
    afterValue?: string;       // 변경 후 값
  };
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  createdAt: string;
  resolvedAt?: string;
}
export interface ResourceUsage {
  timestamp: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  bandwidth: {
    incoming: number;
    outgoing: number;
  };
}

