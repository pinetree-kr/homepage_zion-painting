import { motion } from 'motion/react';
import { Building2, Award, Globe, Users } from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: '40년 전통',
    description: '1984년 설립 이래 도장설비 분야의 선두주자로 성장해왔습니다',
  },
  {
    icon: Award,
    title: '기술력 인정',
    description: 'ISO 인증 및 다수의 특허 보유로 검증된 기술력을 자랑합니다',
  },
  {
    icon: Globe,
    title: '글로벌 네트워크',
    description: '국내외 다양한 산업 분야에 최적화된 도장 솔루션을 제공합니다',
  },
  {
    icon: Users,
    title: '전문 인력',
    description: '풍부한 경험의 엔지니어와 기술진이 완벽한 서비스를 제공합니다',
  },
];

export function About() {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-gray-900 mb-4">회사소개</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            도장설비 전문기업으로서 최고 품질의 제품과 서비스로 고객만족을 실현합니다
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#1A2C6D] to-[#2CA7DB] rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="text-white" size={32} />
              </div>
              <h3 className="text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Company Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-gray-900 mb-6">기업 비전</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                우리는 최첨단 도장설비 기술과 40년 이상의 노하우를 바탕으로 
                자동차, 전자, 건설기계 등 다양한 산업 분야에 최적화된 도장 솔루션을 제공합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                지속적인 연구개발과 기술혁신을 통해 고객의 생산성 향상과 
                품질 개선에 기여하는 글로벌 도장설비 전문기업으로 성장하겠습니다.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 mb-6">핵심 가치</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#2CA7DB] rounded-full mt-2" />
                  <div>
                    <h4 className="text-gray-900 mb-1">품질 우선</h4>
                    <p className="text-gray-600 text-sm">엄격한 품질관리로 최상의 제품을 제공합니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#2CA7DB] rounded-full mt-2" />
                  <div>
                    <h4 className="text-gray-900 mb-1">고객 중심</h4>
                    <p className="text-gray-600 text-sm">고객의 요구사항을 최우선으로 생각합니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#2CA7DB] rounded-full mt-2" />
                  <div>
                    <h4 className="text-gray-900 mb-1">기술 혁신</h4>
                    <p className="text-gray-600 text-sm">끊임없는 연구개발로 기술을 선도합니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
