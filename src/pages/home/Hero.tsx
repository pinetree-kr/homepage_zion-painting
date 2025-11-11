import { Container } from '@/src/shared/ui';

export default function Hero() {
  return (
    <section 
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 44, 109, 1) 0%, rgba(44, 167, 219, 1) 50%, rgba(26, 44, 109, 1) 100%)'
      }}
    >
      {/* 배경 원형 요소들 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 md:right-40 w-72 h-72 bg-[#A5C93E] rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#2CA7DB] rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Container className="relative z-10 py-24 pt-32">
        <div className="flex flex-col items-center text-center gap-6">
          {/* 제목 */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-normal text-white leading-tight">
              최첨단 도장설비로
              <br />
              완벽한 품질을 실현합니다
            </h1>
            <p className="text-xl md:text-2xl font-normal text-white/90 max-w-3xl mx-auto leading-[1.33]">
              40년 이상의 경험과 기술력으로 산업 도장설비 분야를 선도합니다
            </p>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="group px-8 py-4 bg-white text-[#1A2C6D] rounded-full hover:bg-[#A5C93E] hover:text-white transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
              제품 카탈로그
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path 
                  d="M7.5 15L12.5 10L7.5 5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="group px-8 py-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/20">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="10" r="3" fill="currentColor"/>
              </svg>
              시설 둘러보기
            </button>
          </div>

          {/* 스크롤 인디케이터 */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 mt-16">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

