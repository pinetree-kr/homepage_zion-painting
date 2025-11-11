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

