import Container from '../layout/Container';
import Card from '../ui/Card';

export default function Business() {
  const businessAreas = [
    {
      title: '자동 도장 시스템',
      description: '자동차 및 산업용 자동 도장 라인 설계 및 시공',
      items: ['로봇 도장 시스템', '컨베이어 시스템', '자동 제어 시스템']
    },
    {
      title: '도장 부스',
      description: '다양한 산업 분야에 적용 가능한 도장 부스 제작',
      items: ['건식/습식 부스', '분체 도장 부스', '특수 도장 부스']
    },
    {
      title: '건조로 시스템',
      description: '효율적인 열처리 및 건조 시스템 제공',
      items: ['적외선 건조로', '열풍 건조로', '가스/전기 건조로']
    },
    {
      title: '환경 설비',
      description: '친환경 도장설비 및 배기처리 시스템',
      items: ['VOC 처리설비', '집진 시스템', '폐수 처리 설비']
    }
  ];

  const industries = ['자동차', '전자', '건설기계', '조선', '항공', '가구'];

  const achievements = [
    {
      date: '2024년 12월 15일',
      title: '현대자동차 도장라인 구축',
      description: '현대자동차 아산공장 완전 자동화 도장라인 구축 완료',
      category: '자동차'
    },
    {
      date: '2024년 11월 20일',
      title: '삼성전자 가전제품 도장설비',
      description: '삼성전자 수원공장 가전제품 도장설비 납품',
      category: '가전'
    },
    {
      date: '2024년 10월 10일',
      title: 'LG전자 친환경 도장라인',
      description: 'LG전자 창원공장 친환경 도장라인 설치',
      category: '가전'
    },
    {
      date: '2024년 9월 5일',
      title: '기아자동차 스마트 도장설비',
      description: '기아자동차 화성공장 AI 기반 스마트 도장설비 구축',
      category: '자동차'
    }
  ];

  return (
    <section id="business" className="bg-white py-24">
      <Container>
        <div className="flex flex-col gap-20">
          {/* 헤더 */}
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-4xl font-bold text-gray-900">사업소개</h2>
            <div className="flex flex-col items-center gap-2 text-xl text-gray-600 text-center max-w-3xl">
              <p>다양한 산업 분야에 특화된 도장설비 솔루션을 제공하고,</p>
              <p>검증된 실적으로 고객의 신뢰를 얻고 있습니다</p>
            </div>
          </div>

          {/* 사업분야 */}
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-normal text-gray-900">사업분야</h3>
              <div className="h-1 w-20 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessAreas.map((area, index) => (
                <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] p-8">
                  {/* 배경 원형 */}
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-[#2CA7DB]/10 to-[#1A2C6D]/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 flex flex-col gap-6">
                    {/* 아이콘 */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L20 12L30 14L22 22L24 32L16 26L8 32L10 22L2 14L12 12L16 2Z" fill="white"/>
                      </svg>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xl font-normal text-gray-900">{area.title}</h4>
                      <p className="text-base text-gray-600 leading-6">{area.description}</p>
                      
                      <div className="flex flex-col gap-2 mt-2">
                        {area.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2CA7DB]"></div>
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 주요 적용 산업 */}
          <Card className="bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] p-12">
            <div className="flex flex-col gap-8">
              <h3 className="text-2xl font-normal text-white text-center">주요 적용 산업</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {industries.map((industry, index) => (
                  <div
                    key={index}
                    className="bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-colors text-center"
                  >
                    <span className="text-white">{industry}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 사업실적 */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 mb-6">
              <h3 className="text-2xl font-normal text-gray-900">사업실적</h3>
              <div className="h-1 w-20 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-full"></div>
            </div>
            
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button className="px-6 py-2 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white rounded-full text-base font-normal shadow-lg">
                전체
              </button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-normal hover:bg-gray-200 transition-colors">
                자동차
              </button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-base font-normal hover:bg-gray-200 transition-colors">
                가전
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="group relative border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* 카테고리 배지 */}
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white text-xs rounded-full">
                      {achievement.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-500">{achievement.date}</p>
                    <h4 className="text-xl font-normal text-gray-900 pr-20 group-hover:text-[#1A2C6D] transition-colors">{achievement.title}</h4>
                    <p className="text-base text-gray-600 line-clamp-3">{achievement.description}</p>
                  </div>
                  
                  {/* 하단 장식 */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A2C6D] via-[#2CA7DB] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

