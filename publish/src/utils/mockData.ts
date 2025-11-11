import { Post, Member, CompanyInfo, BusinessInfo, Product, ContactInfo } from '../types';

export const mockPosts: Post[] = [
  {
    id: '1',
    type: 'notice',
    title: '2025년 신규 도장설비 라인 오픈',
    content: '최신형 자동화 도장설비 라인이 새롭게 오픈했습니다. 더욱 향상된 품질과 생산성을 경험하실 수 있습니다.',
    author: '관리자',
    createdAt: '2025-01-15',
    status: 'published',
  },
  {
    id: '2',
    type: 'notice',
    title: '설 연휴 휴무 안내',
    content: '2025년 설 연휴 기간 동안 휴무합니다. (1/28 ~ 2/1)',
    author: '관리자',
    createdAt: '2025-01-10',
    status: 'published',
  },
  {
    id: '3',
    type: 'qna',
    title: '도장 견적 문의드립니다',
    content: '자동차 부품 도장 견적을 받고 싶습니다.',
    author: '김철수',
    createdAt: '2025-01-14',
    status: 'published',
  },
  {
    id: '4',
    type: 'quote',
    title: '대량 주문 견적 요청',
    content: '도장설비 10대 견적을 요청드립니다.',
    author: '이영희',
    createdAt: '2025-01-13',
    status: 'published',
    category: '도장설비',
  },
  {
    id: '5',
    type: 'review',
    title: '품질과 서비스 모두 만족합니다',
    content: '시온의 도장설비를 도입한 후 생산성이 30% 향상되었습니다. 애프터서비스도 매우 좋습니다.',
    author: '박현대',
    createdAt: '2025-01-12',
    status: 'published',
  },
];

export const mockCompanyInfo: CompanyInfo = {
  id: '1',
  about: `# 시온 도장설비

시온은 1995년 설립 이래 30년간 도장설비 분야의 선두주자로 자리매김해왔습니다.

## 우리의 비전
최첨단 기술과 혁신으로 고객의 성공을 이끌어가는 글로벌 도장설비 전문기업

## 핵심 가치
- **품질 우선**: 최고 품질의 설비와 서비스 제공
- **기술 혁신**: 지속적인 R&D 투자로 기술력 강화
- **고객 만족**: 고객의 성공이 우리의 성공`,
  history: [
    { id: '1', year: '2024', month: '12', content: 'ISO 9001 인증 획득', order: 1 },
    { id: '2', year: '2023', month: '06', content: '해외 수출 100억 달성', order: 2 },
    { id: '3', year: '2020', month: '03', content: '자동화 연구소 설립', order: 3 },
    { id: '4', year: '2015', month: '09', content: '제2공장 설립', order: 4 },
    { id: '5', year: '2010', month: '01', content: '코스닥 상장', order: 5 },
    { id: '6', year: '2000', month: '05', content: '특허 10건 등록', order: 6 },
    { id: '7', year: '1995', month: '03', content: '시온 설립', order: 7 },
  ],
  organization: `# 조직도

CEO
���── 연구개발본부
│   ├── 기술연구팀
│   └── 품질관리팀
├── 생산본부
│   ├── 제조1팀
│   └── 제조2팀
└── 경영지원본부
    ├── 영업팀
    └── 관리팀`,
  location: {
    address: '경기도 화성시 팔탄면 공장길 123, 도장설비 산업단지 내',
    kakaoMapUrl: 'https://map.kakao.com/',
    naverMapUrl: 'https://map.naver.com/',
  },
};

export const mockBusinessInfo: BusinessInfo = {
  id: '1',
  areas: [
    {
      id: '1',
      title: '자동 도장 설비',
      description: '고효율 자동화 도장 시스템',
      features: ['완전 자동화', 'AI 품질 검사', '에너지 절감', '유지보수 간편'],
      order: 1,
    },
    {
      id: '2',
      title: '건조 설비',
      description: '최첨단 건조 시스템',
      features: ['급속 건조', '온도 제어', '균일한 건조', '친환경'],
      order: 2,
    },
    {
      id: '3',
      title: '이송 설비',
      description: '스마트 자동 이송 시스템',
      features: ['자동 이송', '정밀 제어', '안전 시스템', '유연한 라인 구성'],
      order: 3,
    },
    {
      id: '4',
      title: '환경 설비',
      description: '친환경 공해 방지 시스템',
      features: ['VOC 제거', '분진 제거', '에너지 회수', '환경 규제 대응'],
      order: 4,
    },
  ],
  achievements: [
    {
      id: '1',
      title: '현대자동차 도장라인 구축',
      content: '현대자동차 아산공장 완전 자동화 도장라인 구축 완료',
      date: '2024-12-15',
      category: '자동차',
    },
    {
      id: '2',
      title: '삼성전자 가전제품 도장설비',
      content: '삼성전자 수원공장 가전제품 도장설비 납품',
      date: '2024-11-20',
      category: '가전',
    },
    {
      id: '3',
      title: 'LG전자 친환경 도장라인',
      content: 'LG전자 창원공장 친환경 도장라인 설치',
      date: '2024-10-10',
      category: '가전',
    },
    {
      id: '4',
      title: '기아자동차 스마트 도장설비',
      content: '기아자동차 화성공장 AI 기반 스마트 도장설비 구축',
      date: '2024-09-05',
      category: '자동차',
    },
  ],
};

export const mockProducts: Product[] = [
  {
    id: '1',
    title: '자동 분체도장 라인',
    content: '완전 자동화된 분체도장 시스템으로 균일한 도장 품질을 보장합니다.',
    category: '도장설비',
    specs: ['처리능력: 1000개/h', '도장 두께: 50-200μm', '자동 색상 변경', 'AI 품질검사'],
    createdAt: '2025-01-10',
    status: 'published',
  },
  {
    id: '2',
    title: '액체도장 로봇 시스템',
    content: '6축 로봇을 활용한 정밀 액체도장 시스템',
    category: '도장설비',
    specs: ['로봇 6대', '자동 건조', '실시간 모니터링', '원격 제어'],
    createdAt: '2025-01-08',
    status: 'published',
  },
  {
    id: '3',
    title: '적외선 건조로',
    content: '에너지 효율이 뛰어난 적외선 건조 시스템',
    category: '건조설비',
    specs: ['최대온도: 250℃', '건조시간: 5-15분', '에너지효율 A+', '온도균일도 ±2℃'],
    createdAt: '2025-01-05',
    status: 'published',
  },
  {
      id: '4',
    title: '컨베이어 건조 시스템',
    content: '대량 생산에 최적화된 컨베이어 건조 설비',
    category: '건조설비',
    specs: ['길이: 20m', '속도조절', '다단 온도제어', '자동 배출'],
    createdAt: '2025-01-03',
    status: 'published',
  },
  {
    id: '5',
    title: '오버헤드 컨베이어',
    content: '공간 활용이 우수한 천장형 이송 시스템',
    category: '이송설비',
    specs: ['적재하중: 500kg', '속도: 0-10m/min', '자동 경로 변경', '안전센서'],
    createdAt: '2024-12-28',
    status: 'published',
  },
  {
    id: '6',
    title: 'VOC 처리 설비',
    content: '환경 규제를 만족하는 VOC 제거 시스템',
    category: '환경설비',
    specs: ['제거율: 99%', '에너지 회수', '자동 필터 교체', '실시간 모니터링'],
    createdAt: '2024-12-25',
    status: 'published',
  },
];

export const mockContactInfo: ContactInfo = {
  id: '1',
  email: 'coating@zion.com',
  address: '경기도 화성시 팔탄면 공장길 123\n도장설비 산업단지 내',
  businessHours: '평일: 09:00 - 18:00\n토·일·공휴일 휴무',
  phone: {
    main: '031-123-4567',
    manager: '010-1234-5678',
  },
  fax: '031-123-4568',
  location: {
    address: '경기도 화성시 팔탄면 공장길 123',
    kakaoMapUrl: 'https://map.kakao.com/',
    naverMapUrl: 'https://map.naver.com/',
  },
};

export const mockMembers: Member[] = [
  {
    id: '1',
    email: 'admin@zion.com',
    name: '관리자',
    role: 'admin',
    createdAt: '2024-01-01',
    status: 'active',
  },
  {
    id: '2',
    email: 'user@zion.com',
    name: '김철수',
    role: 'user',
    createdAt: '2024-06-15',
    status: 'active',
  },
];
