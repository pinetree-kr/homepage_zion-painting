import Container from '../layout/Container';
import Card from '../ui/Card';

export default function About() {
  const features = [
    {
      title: '40년 전통',
      description: '1984년 설립 이래 도장설비 분야의 선두주자로 성장해왔습니다',
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L20 12L30 14L22 22L24 32L16 26L8 32L10 22L2 14L12 12L16 2Z" fill="white"/>
          </svg>
        </div>
      )
    },
    {
      title: '기술력 인정',
      description: 'ISO 인증 및 다수의 특허 보유로 검증된 기술력을 자랑합니다',
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L20 12L30 14L22 22L24 32L16 26L8 32L10 22L2 14L12 12L16 2Z" fill="white"/>
          </svg>
        </div>
      )
    },
    {
      title: '글로벌 네트워크',
      description: '국내외 다양한 산업 분야에 최적화된 도장 솔루션을 제공합니다',
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L20 12L30 14L22 22L24 32L16 26L8 32L10 22L2 14L12 12L16 2Z" fill="white"/>
          </svg>
        </div>
      )
    },
    {
      title: '전문 인력',
      description: '풍부한 경험의 엔지니어와 기술진이 완벽한 서비스를 제공합니다',
      icon: (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L20 12L30 14L22 22L24 32L16 26L8 32L10 22L2 14L12 12L16 2Z" fill="white"/>
          </svg>
        </div>
      )
    }
  ];

  const coreValues = [
    {
      title: '품질 우선',
      description: '엄격한 품질관리로 최상의 제품을 제공합니다'
    },
    {
      title: '고객 중심',
      description: '고객의 요구사항을 최우선으로 생각합니다'
    },
    {
      title: '기술 혁신',
      description: '끊임없는 연구개발로 기술을 선도합니다'
    }
  ];

  return (
    <section id="about" className="bg-gray-50 py-24">
      <Container>
        <div className="flex flex-col gap-16">
          {/* 헤더 */}
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-4xl font-bold text-gray-900">회사소개</h2>
            <p className="text-xl text-gray-600 text-center max-w-3xl">
              도장설비 전문기업으로서 최고 품질의 제품과 서비스로 고객만족을 실현합니다
            </p>
          </div>

          {/* 특징 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col gap-6">
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-normal text-gray-900">{feature.title}</h3>
                  <p className="text-base text-gray-600 leading-6">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* 기업 비전 및 핵심 가치 */}
          <Card className="p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* 기업 비전 */}
              <div className="flex flex-col gap-6">
                <h3 className="text-2xl font-normal text-gray-900">기업 비전</h3>
                <div className="flex flex-col gap-4 text-base text-gray-700 leading-relaxed">
                  <p>
                    우리는 최첨단 도장설비 기술과 40년 이상의 노하우를 바탕으로 자동차, 전자, 건설기계 등 다양한 산업 분야에 최적화된 도장 솔루션을 제공합니다.
                  </p>
                  <p>
                    지속적인 연구개발과 기술혁신을 통해 고객의 생산성 향상과 품질 개선에 기여하는 글로벌 도장설비 전문기업으로 성장하겠습니다.
                  </p>
                </div>
              </div>

              {/* 핵심 가치 */}
              <div className="flex flex-col gap-6">
                <h3 className="text-2xl font-normal text-gray-900">핵심 가치</h3>
                <div className="flex flex-col gap-6">
                  {coreValues.map((value, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#2CA7DB] mt-2 flex-shrink-0"></div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-xl font-normal text-gray-900">{value.title}</h4>
                        <p className="text-sm text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}

