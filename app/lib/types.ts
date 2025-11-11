export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Post {
  id: string;
  type: 'notice' | 'qna' | 'quote' | 'review';
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status: 'published' | 'draft';
  imageUrl?: string;
  category?: string;
}

export interface CompanyInfo {
  id: string;
  about: string;
  history: HistoryItem[];
  organization: string;
  location: LocationInfo;
}

export interface HistoryItem {
  id: string;
  year: string;
  month?: string;
  content: string;
  order: number;
}

export interface LocationInfo {
  address: string;
  kakaoMapUrl: string;
  naverMapUrl: string;
}

export interface BusinessInfo {
  id: string;
  areas: BusinessArea[];
  achievements: Achievement[];
}

export interface BusinessArea {
  id: string;
  title: string;
  description: string;
  features: string[];
  order: number;
}

export interface Achievement {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
  category?: string;
}

export interface Product {
  id: string;
  title: string;
  content: string;
  category: string;
  specs: string[];
  imageUrl?: string;
  createdAt: string;
  status: 'published' | 'draft';
}

export interface ContactInfo {
  id: string;
  email: string;
  address: string;
  businessHours: string;
  phone: {
    main: string;
    manager: string;
  };
  fax: string;
  location: LocationInfo;
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

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
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

