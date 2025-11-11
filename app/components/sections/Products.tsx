import Container from '../layout/Container';
import Image from 'next/image';

// Icon Components (lucide-react 기반)
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  </svg>
);

export default function Products() {
  const products = [
    {
      id: 1,
      category: '도장 장비',
      title: '자동 스프레이 건',
      description: '정밀한 도장 작업을 위한 자동 스프레이 건',
      specs: [
        '분사압력: 0.5~3.0 bar',
        '노즐 크기: 0.8~2.0mm',
        '도료 용량: 1L'
      ]
    },
    {
      id: 2,
      category: '이송 설비',
      title: '컨베이어 시스템',
      description: '효율적인 생산라인 구축을 위한 컨베이어',
      specs: [
        '속도: 1~10m/min',
        '내하중: 500kg',
        '길이: 맞춤 제작'
      ]
    },
    {
      id: 3,
      category: '열처리 설비',
      title: '건조로',
      description: '고효율 적외선 건조 시스템',
      specs: [
        '온도: 80~200°C',
        '용량: 5~50㎡',
        '에너지: 전기/가스'
      ]
    },
    {
      id: 4,
      category: '부스 설비',
      title: '도장 부스',
      description: '산업용 도장 부스 시스템',
      specs: [
        '크기: 맞춤 제작',
        '환기: 20,000㎥/h',
        '조명: LED 방폭등'
      ]
    },
    {
      id: 5,
      category: '특수 설비',
      title: '분체도장 설비',
      description: '친환경 분체도장 시스템',
      specs: [
        '분사압력: 60~100kPa',
        '회수율: 95% 이상',
        '자동 색상 교체'
      ]
    },
    {
      id: 6,
      category: '자동화 설비',
      title: '로봇 도장 시스템',
      description: '6축 로봇을 활용한 자동 도장',
      specs: [
        '도달거리: 2.5m',
        '반복정도: ±0.1mm',
        '프로그램 저장: 1000개'
      ]
    }
  ];


  return (
    <section id="products" className="bg-gray-50 py-24">
      <Container>
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">제품소개</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            최첨단 기술이 적용된 다양한 도장설비 제품을 만나보세요
          </p>
        </div>

        {/* 제품 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-[#F4F6F8] to-[#2CA7DB]/20 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-[#1A2C6D] text-white text-xs rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-gray-900 mb-2 text-xl font-normal">{product.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{product.description}</p>

                {/* Specs */}
                <div className="space-y-2 mb-4">
                  {product.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <SettingsIcon className="w-4 h-4 text-[#2CA7DB] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{spec}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-2 bg-[#F4F6F8] text-[#1A2C6D] rounded-lg hover:bg-[#A5C93E] hover:text-white transition-colors text-sm">
                  상세보기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <PackageIcon className="w-12 h-12 text-[#1A2C6D] mb-4" />
            <h4 className="text-gray-900 mb-2 text-xl font-normal">맞춤 제작</h4>
            <p className="text-gray-600 text-sm">고객의 요구사항에 맞춘 맞춤형 설비 제작</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <ZapIcon className="w-12 h-12 text-[#2CA7DB] mb-4" />
            <h4 className="text-gray-900 mb-2 text-xl font-normal">고효율</h4>
            <p className="text-gray-600 text-sm">에너지 절감형 고효율 설비 제공</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <ShieldIcon className="w-12 h-12 text-[#A5C93E] mb-4" />
            <h4 className="text-gray-900 mb-2 text-xl font-normal">A/S 보증</h4>
            <p className="text-gray-600 text-sm">신속한 사후관리 및 기술 지원</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

