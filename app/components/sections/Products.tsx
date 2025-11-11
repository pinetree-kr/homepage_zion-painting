import Container from '../layout/Container';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function Products() {
  const products = [
    {
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

  const services = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="4" width="36" height="40" rx="4" stroke="#1A2C6D" strokeWidth="4"/>
          <path d="M14 14H34M14 24H34M14 34H24" stroke="#1A2C6D" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: '맞춤 제작',
      description: '고객의 요구사항에 맞춘 맞춤형 설비 제작'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" stroke="#2CA7DB" strokeWidth="4"/>
          <path d="M24 12V24L32 28" stroke="#2CA7DB" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: '고효율',
      description: '에너지 절감형 고효율 설비 제공'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 8L30 18L42 20L34 28L36 40L24 34L12 40L14 28L6 20L18 18L24 8Z" stroke="#A5C93E" strokeWidth="4" fill="none"/>
        </svg>
      ),
      title: 'A/S 보증',
      description: '신속한 사후관리 및 기술 지원'
    }
  ];

  return (
    <section id="products" className="bg-gray-50 py-24">
      <Container>
        <div className="flex flex-col gap-16">
          {/* 헤더 */}
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-4xl font-bold text-gray-900">제품소개</h2>
            <p className="text-xl text-gray-600 text-center max-w-3xl">
              최첨단 기술이 적용된 다양한 도장설비 제품을 만나보세요
            </p>
          </div>

          {/* 제품 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <Card key={index} className="flex flex-col overflow-hidden">
                {/* 이미지 영역 */}
                <div className="relative h-48 bg-gradient-to-br from-[#F4F6F8] to-[#2CA7DB]/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-22 h-22 bg-gray-300 rounded-lg opacity-50"></div>
                  </div>
                  {/* 카테고리 배지 */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-[#1A2C6D] text-white rounded-full text-xs font-normal">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* 내용 영역 */}
                <div className="flex flex-col gap-4 p-6">
                  <h3 className="text-xl font-normal text-gray-900">{product.title}</h3>
                  <p className="text-base text-gray-600 text-sm">{product.description}</p>
                  
                  {/* 스펙 */}
                  <div className="flex flex-col gap-2 mb-4">
                    {product.specs.map((spec, specIndex) => (
                      <div key={specIndex} className="flex items-start gap-2 text-sm">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
                          <circle cx="8" cy="8" r="6" stroke="#2CA7DB" strokeWidth="1.33"/>
                          <circle cx="8" cy="8" r="2" fill="#2CA7DB"/>
                        </svg>
                        <span className="text-gray-700">{spec}</span>
                      </div>
                    ))}
                  </div>

                  {/* 상세보기 버튼 */}
                  <button className="w-full py-2 bg-[#F4F6F8] text-[#1A2C6D] rounded-lg hover:bg-[#A5C93E] hover:text-white transition-colors text-sm">
                    상세보기
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* 서비스 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <h4 className="text-xl font-normal text-gray-900 mb-2">{service.title}</h4>
                  <p className="text-base text-gray-600 text-sm">{service.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

