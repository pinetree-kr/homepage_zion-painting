import Container from '../layout/Container';

// Icon Components
const Building2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const AwardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function About() {
  const features = [
    {
      icon: Building2Icon,
      title: '40년 전통',
      description: '1984년 설립 이래 도장설비 분야의 선두주자로 성장해왔습니다',
    },
    {
      icon: AwardIcon,
      title: '기술력 인정',
      description: 'ISO 인증 및 다수의 특허 보유로 검증된 기술력을 자랑합니다',
    },
    {
      icon: GlobeIcon,
      title: '글로벌 네트워크',
      description: '국내외 다양한 산업 분야에 최적화된 도장 솔루션을 제공합니다',
    },
    {
      icon: UsersIcon,
      title: '전문 인력',
      description: '풍부한 경험의 엔지니어와 기술진이 완벽한 서비스를 제공합니다',
    },
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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">회사소개</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              도장설비 전문기업으로서 최고 품질의 제품과 서비스로 고객만족을 실현합니다
            </p>
          </div>

          {/* 특징 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-gray-900 mb-3 text-xl font-normal">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* 기업 비전 및 핵심 가치 */}
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* 기업 비전 */}
              <div>
                <h3 className="text-2xl font-normal text-gray-900 mb-6">기업 비전</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  우리는 최첨단 도장설비 기술과 40년 이상의 노하우를 바탕으로 
                  자동차, 전자, 건설기계 등 다양한 산업 분야에 최적화된 도장 솔루션을 제공합니다.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  지속적인 연구개발과 기술혁신을 통해 고객의 생산성 향상과 
                  품질 개선에 기여하는 글로벌 도장설비 전문기업으로 성장하겠습니다.
                </p>
              </div>

              {/* 핵심 가치 */}
              <div>
                <h3 className="text-2xl font-normal text-gray-900 mb-6">핵심 가치</h3>
                <div className="space-y-4">
                  {coreValues.map((value, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#2CA7DB] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-gray-900 mb-1 text-xl font-normal">{value.title}</h4>
                        <p className="text-gray-600 text-sm">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

