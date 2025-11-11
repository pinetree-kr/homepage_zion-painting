import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Code, Palette, BarChart3, Shield, Globe, Zap } from 'lucide-react';

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const services = [
    {
      icon: Code,
      title: '웹 개발',
      description: '최신 기술 스택을 활용한 반응형 웹사이트 및 웹 애플리케이션 개발',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Palette,
      title: 'UI/UX 디자인',
      description: '사용자 중심의 직관적이고 아름다운 인터페이스 디자인',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: '데이터 분석',
      description: '비즈니스 인사이트를 제공하는 데이터 분석 및 시각화',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Shield,
      title: '보안 솔루션',
      description: '기업 데이터를 안전하게 보호하는 보안 시스템 구축',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Globe,
      title: '클라우드 서비스',
      description: '확장 가능한 클라우드 인프라 설계 및 관리',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Zap,
      title: '성능 최적화',
      description: '웹사이트 및 애플리케이션의 속도와 성능 향상',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <section id="services" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-blue-600 mb-4">SERVICES</h2>
          <h3 className="mb-4">제공 서비스</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            다양한 분야의 전문 서비스를 통해 고객의 비즈니스 목표를 실현합니다
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="text-white" size={32} />
                </div>
                
                <h4 className="mb-3 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h4>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
