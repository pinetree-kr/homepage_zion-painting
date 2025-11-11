import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Portfolio() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      title: 'E-커머스 플랫폼',
      category: 'web',
      image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80',
      description: '최신 웹 기술을 활용한 쇼핑몰 구축',
    },
    {
      title: '모바일 뱅킹 앱',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
      description: '안전하고 편리한 금융 서비스',
    },
    {
      title: '기업 대시보드',
      category: 'design',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      description: '데이터 시각화 및 분석 도구',
    },
    {
      title: '헬스케어 플랫폼',
      category: 'web',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      description: '환자 관리 시스템',
    },
    {
      title: 'AI 챗봇 서비스',
      category: 'mobile',
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80',
      description: '고객 서비스 자동화',
    },
    {
      title: '브랜드 리뉴얼',
      category: 'design',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
      description: '기업 아이덴티티 재설계',
    },
  ];

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'web', label: '웹' },
    { id: 'mobile', label: '모바일' },
    { id: 'design', label: '디자인' },
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="portfolio" className="py-24 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-blue-600 mb-4">PORTFOLIO</h2>
          <h3 className="mb-4">프로젝트</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-4 mb-12 flex-wrap"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`px-6 py-2 rounded-full transition-all ${
                filter === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <button className="px-6 py-2 bg-white text-gray-900 rounded-full flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors">
                    자세히 보기
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h4 className="mb-2">{project.title}</h4>
                <p className="text-gray-600">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
