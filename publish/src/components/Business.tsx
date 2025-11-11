import { motion } from 'motion/react';
import { useState } from 'react';
import { Layers, Droplets, Wind, Gauge, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockBusinessInfo } from '../utils/mockData';

const businessAreas = [
  {
    icon: Layers,
    title: '자동 도장 시스템',
    description: '자동차 및 산업용 자동 도장 라인 설계 및 시공',
    features: ['로봇 도장 시스템', '컨베이어 시스템', '자동 제어 시스템'],
  },
  {
    icon: Droplets,
    title: '도장 부스',
    description: '다양한 산업 분야에 적용 가능한 도장 부스 제작',
    features: ['건식/습식 부스', '분체 도장 부스', '특수 도장 부스'],
  },
  {
    icon: Wind,
    title: '건조로 시스템',
    description: '효율적인 열처리 및 건조 시스템 제공',
    features: ['적외선 건조로', '열풍 건조로', '가스/전기 건조로'],
  },
  {
    icon: Gauge,
    title: '환경 설비',
    description: '친환경 도장설비 및 배기처리 시스템',
    features: ['VOC 처리설비', '집진 시스템', '폐수 처리 설비'],
  },
];

export function Business() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  
  // 카테고리별로 사업실적 그룹화
  const achievements = mockBusinessInfo.achievements || [];
  const categories = ['전체', ...Array.from(new Set(achievements.map(a => a.category)))];
  
  const filteredAchievements = selectedCategory === '전체' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <section id="business" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-gray-900 mb-4">사업소개</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            다양한 산업 분야에 특화된 도장설비 솔루션을 제공하고,
            <br />
            검증된 실적으로 고객의 신뢰를 얻고 있습니다
          </p>
        </motion.div>

        {/* 사업분야 섹션 */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-gray-900 mb-2">사업분야</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {businessAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2CA7DB]/10 to-[#1A2C6D]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <area.icon className="text-white" size={32} />
                  </div>
                  
                  <h3 className="text-gray-900 mb-3">{area.title}</h3>
                  <p className="text-gray-600 mb-6">{area.description}</p>
                  
                  <div className="space-y-2">
                    {area.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#2CA7DB] rounded-full" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Industries Served */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-2xl p-12 text-center"
          >
            <h3 className="text-white mb-8">주요 적용 산업</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {['자동차', '전자', '건설기계', '조선', '항공', '가구'].map((industry, index) => (
                <motion.div
                  key={industry}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-colors"
                >
                  <p className="text-white">{industry}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 사업실적 섹션 */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-gray-900 mb-2">사업실적</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] rounded-full mb-6" />
            
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 사업실적 카드 그리드 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
          >
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* 카테고리 배지 */}
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#1A2C6D] to-[#2CA7DB] text-white text-xs rounded-full">
                    {achievement.category}
                  </span>
                </div>

                {/* 날짜 */}
                <div className="text-sm text-gray-500 mb-3">
                  {new Date(achievement.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {/* 제목 */}
                <h4 className="text-gray-900 mb-4 pr-20 group-hover:text-[#1A2C6D] transition-colors">
                  {achievement.title}
                </h4>

                {/* 내용 */}
                <p className="text-gray-600 line-clamp-3">
                  {achievement.content}
                </p>

                {/* 하단 장식 */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A2C6D] via-[#2CA7DB] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>

          {/* 실적이 없을 때 */}
          {filteredAchievements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              해당 카테고리의 사업실적이 없습니다.
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
