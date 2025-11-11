import { motion } from 'motion/react';
import { Package, Zap, Shield, Settings } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const products = [
  {
    id: 1,
    title: '자동 스프레이 건',
    category: '도장 장비',
    description: '정밀한 도장 작업을 위한 자동 스프레이 건',
    specs: ['분사압력: 0.5~3.0 bar', '노즐 크기: 0.8~2.0mm', '도료 용량: 1L'],
  },
  {
    id: 2,
    title: '컨베이어 시스템',
    category: '이송 설비',
    description: '효율적인 생산라인 구축을 위한 컨베이어',
    specs: ['속도: 1~10m/min', '내하중: 500kg', '길이: 맞춤 제작'],
  },
  {
    id: 3,
    title: '건조로',
    category: '열처리 설비',
    description: '고효율 적외선 건조 시스템',
    specs: ['온도: 80~200°C', '용량: 5~50㎡', '에너지: 전기/가스'],
  },
  {
    id: 4,
    title: '도장 부스',
    category: '부스 설비',
    description: '산업용 도장 부스 시스템',
    specs: ['크기: 맞춤 제작', '환기: 20,000㎥/h', '조명: LED 방폭등'],
  },
  {
    id: 5,
    title: '분체도장 설비',
    category: '특수 설비',
    description: '친환경 분체도장 시스템',
    specs: ['분사압력: 60~100kPa', '회수율: 95% 이상', '자동 색상 교체'],
  },
  {
    id: 6,
    title: '로봇 도장 시스템',
    category: '자동화 설비',
    description: '6축 로봇을 활용한 자동 도장',
    specs: ['도달거리: 2.5m', '반복정도: ±0.1mm', '프로그램 저장: 1000개'],
  },
];

export function Products() {
  return (
    <section id="products" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-gray-900 mb-4">제품소개</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            최첨단 기술이 적용된 다양한 도장설비 제품을 만나보세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-[#F4F6F8] to-[#2CA7DB]/20 overflow-hidden">
                <ImageWithFallback
                  src={`https://images.unsplash.com/photo-${1500000000000 + index}?w=600&h=400&fit=crop`}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-[#1A2C6D] text-white text-xs rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-gray-900 mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{product.description}</p>

                {/* Specs */}
                <div className="space-y-2 mb-4">
                  {product.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Settings className="w-4 h-4 text-[#2CA7DB] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{spec}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-2 bg-[#F4F6F8] text-[#1A2C6D] rounded-lg hover:bg-[#A5C93E] hover:text-white transition-colors text-sm">
                  상세보기
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white p-6 rounded-xl shadow-md">
            <Package className="w-12 h-12 text-[#1A2C6D] mb-4" />
            <h4 className="text-gray-900 mb-2">맞춤 제작</h4>
            <p className="text-gray-600 text-sm">고객의 요구사항에 맞춘 맞춤형 설비 제작</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <Zap className="w-12 h-12 text-[#2CA7DB] mb-4" />
            <h4 className="text-gray-900 mb-2">고효율</h4>
            <p className="text-gray-600 text-sm">에너지 절감형 고효율 설비 제공</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <Shield className="w-12 h-12 text-[#A5C93E] mb-4" />
            <h4 className="text-gray-900 mb-2">A/S 보증</h4>
            <p className="text-gray-600 text-sm">신속한 사후관리 및 기술 지원</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
