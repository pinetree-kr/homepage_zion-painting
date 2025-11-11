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

