export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  emailVerified?: boolean;
}

export interface Member {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  phone?: string;
}

