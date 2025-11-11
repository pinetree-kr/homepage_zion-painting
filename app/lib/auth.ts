export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  emailVerified?: boolean;
}

const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@zion.com',
    password: 'admin123',
    name: '관리자',
    role: 'admin' as const,
    emailVerified: true,
  },
  {
    id: '2',
    email: 'user@zion.com',
    password: 'user123',
    name: '김철수',
    role: 'user' as const,
    emailVerified: true,
  },
];

// Store for registered users (in a real app, this would be in a database)
let registeredUsers = [...MOCK_USERS];

export function login(email: string, password: string): User | null {
  if (typeof window === 'undefined') return null;

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
  if (typeof window === 'undefined') return null;

  // Check if user already exists
  const existingUser = registeredUsers.find(u => u.email === email);
  if (existingUser) {
    return null;
  }

  // Create new user (email not verified initially)
  const newUser = {
    id: (registeredUsers.length + 1).toString(),
    email,
    password,
    name,
    role: 'user' as const,
    emailVerified: false,
  };

  registeredUsers.push(newUser);

  // Don't auto-login, wait for email verification
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    emailVerified: false,
  };
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
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

export function verifyEmail(email: string, token: string): boolean {
  if (typeof window === 'undefined') return false;

  // In a real app, verify the token from the server
  // For now, just check if user exists
  const userIndex = registeredUsers.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return false;
  }

  registeredUsers[userIndex].emailVerified = true;
  
  // Auto-login after verification
  const user = registeredUsers[userIndex];
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
  
  return true;
}

