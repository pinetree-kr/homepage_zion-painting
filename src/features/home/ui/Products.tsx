import { Container } from '@/src/shared/ui';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductCategory } from '@/src/entities/product/model/types';

// Icon Components (lucide-react 기반)
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  </svg>
);

interface ProductsProps {
  products?: Product[];
  categories?: ProductCategory[];
}

export default function Products({ products = [], categories = [] }: ProductsProps) {
  // published 상태인 제품만 필터링
  const publishedProducts = products.filter(p => p.status === 'published');
  
  // 카테고리 맵 생성
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.title]));
  
  // specs를 배열로 변환하는 헬퍼 함수
  const parseSpecs = (specs: any): string[] => {
    if (!specs) return [];
    if (Array.isArray(specs)) return specs;
    if (typeof specs === 'string') {
      try {
        const parsed = JSON.parse(specs);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };


  return (
    <section id="products" className="bg-gray-50 py-24">
      <Container>
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">제품소개</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            최첨단 기술이 적용된 다양한 도장설비 제품을 만나보세요
          </p>
        </div>

        {/* 제품 그리드 */}
        {publishedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedProducts.map((product) => {
              const categoryTitle = product.category_id ? categoryMap.get(product.category_id) || '기타' : '기타';
              const specs = parseSpecs(product.specs);
              const description = product.content_summary || product.content?.replace(/<[^>]*>/g, '').substring(0, 100) || '';

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[#F4F6F8] to-[#2CA7DB]/20 overflow-hidden">
                    {product.thumbnail_url ? (
                      <Image
                        src={product.thumbnail_url}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-[#1A2C6D] text-white text-xs rounded-full">
                        {categoryTitle}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-gray-900 mb-2 text-xl font-normal">{product.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{description}</p>

                    {/* Specs */}
                    {specs.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {specs.slice(0, 3).map((spec, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <SettingsIcon className="w-4 h-4 text-[#2CA7DB] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{spec}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/products/${product.id}`}
                      className="block w-full py-2 bg-[#F4F6F8] text-[#1A2C6D] rounded-lg hover:bg-[#A5C93E] hover:text-white transition-colors text-sm text-center"
                    >
                      상세보기
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            등록된 제품이 없습니다.
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <PackageIcon className="w-12 h-12 text-[#1A2C6D] mb-4" />
            <h4 className="text-gray-900 mb-2 text-xl font-normal">맞춤 제작</h4>
            <p className="text-gray-600 text-sm">고객의 요구사항에 맞춘 맞춤형 설비 제작</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <ZapIcon className="w-12 h-12 text-[#2CA7DB] mb-4" />
            <h4 className="text-gray-900 mb-2 text-xl font-normal">고효율</h4>
            <p className="text-gray-600 text-sm">에너지 절감형 고효율 설비 제공</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <ShieldIcon className="w-12 h-12 text-[#A5C93E] mb-4" />
            <h4 className="text-gray-900 mb-2 text-xl font-normal">A/S 보증</h4>
            <p className="text-gray-600 text-sm">신속한 사후관리 및 기술 지원</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

