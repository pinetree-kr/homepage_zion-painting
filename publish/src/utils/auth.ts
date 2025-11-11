import { User } from '../types';

const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@zion.com',
    password: 'admin123',
    name: '관리자',
    role: 'admin' as const,
  },
  {
    id: '2',
    email: 'user@zion.com',
    password: 'user123',
    name: '김철수',
    role: 'user' as const,
  },
];

// Store for registered users
let registeredUsers = [...MOCK_USERS];

export function login(email: string, password: string): User | null {
  const user = registeredUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }

  return null;
}

export function register(name: string, email: string, password: string): User | null {
  // Check if user already exists
  const existingUser = registeredUsers.find(u => u.email === email);
  if (existingUser) {
    return null;
  }

  // Create new user
  const newUser = {
    id: (registeredUsers.length + 1).toString(),
    email,
    password,
    name,
    role: 'user' as const,
  };

  registeredUsers.push(newUser);

  // Login the user
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
}

export function logout() {
  localStorage.removeItem('currentUser');
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function updateUser(userId: string, updates: Partial<User> & { currentPassword?: string; newPassword?: string }): User | null {
  const userIndex = registeredUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return null;
  }

  const user = registeredUsers[userIndex];

  // 비밀번호를 변경하는 경우
  if (updates.newPassword) {
    // 현재 비밀번호 확인
    if (!updates.currentPassword || user.password !== updates.currentPassword) {
      throw new Error('현재 비밀번호가 일치하지 않습니다');
    }
    user.password = updates.newPassword;
  }

  // 다른 정보 업데이트
  if (updates.name) user.name = updates.name;
  if (updates.email) {
    // 이메일 중복 확인 (본인 제외)
    const emailExists = registeredUsers.some(
      (u, idx) => idx !== userIndex && u.email === updates.email
    );
    if (emailExists) {
      throw new Error('이미 사용 중인 이메일입니다');
    }
    user.email = updates.email;
  }

  // 업데이트된 사용자 정보 저장
  registeredUsers[userIndex] = user;

  // localStorage 업데이트
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

  return userWithoutPassword;
}
