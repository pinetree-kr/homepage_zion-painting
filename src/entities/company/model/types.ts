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

