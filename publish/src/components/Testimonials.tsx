import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const testimonials = [
    {
      name: '김철수',
      position: 'CEO, 테크스타트업',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      text: '전문적이고 체계적인 프로젝트 관리로 기대 이상의 결과를 만들어주셨습니다. 특히 소통이 원활해서 작업 과정이 매우 만족스러웠습니다.',
      rating: 5,
    },
    {
      name: '이영희',
      position: '마케팅 디렉터, 글로벌코퍼레이션',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      text: '창의적인 디자인과 뛰어난 기술력으로 우리 브랜드를 한 단계 업그레이드시켜주었습니다. 앞으로도 계속 함께 하고 싶은 파트너입니다.',
      rating: 5,
    },
    {
      name: '박민수',
      position: 'CTO, 핀테크솔루션',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      text: '복잡한 요구사항을 완벽하게 이해하고 구현해주셨습니다. 기술적 전문성과 문제 해결 능력이 탁월한 팀입니다.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-blue-600 mb-4">TESTIMONIALS</h2>
          <h3 className="mb-4">고객 후기</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            함께한 고객들의 생생한 경험을 들어보세요
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 p-8 rounded-2xl relative"
            >
              <Quote className="absolute top-6 right-6 text-blue-200" size={40} />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="mb-1">{testimonial.name}</h4>
                  <p className="text-gray-600">{testimonial.position}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="fill-yellow-400 text-yellow-400" size={16} />
                ))}
              </div>

              <p className="text-gray-700 italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
