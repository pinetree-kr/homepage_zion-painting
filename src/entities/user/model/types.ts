export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user'; // Administrator 테이블에서 가져옴
  // Profile 테이블에서 가져오는 필드들 (옵셔널로 유지하여 호환성 유지)
  emailVerified?: boolean;
  createdAt?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  phone?: string;
}

// Member는 User의 별칭으로 유지 (하위 호환성)
export type Member = User;

