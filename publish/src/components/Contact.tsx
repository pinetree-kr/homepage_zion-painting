import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, Lock } from 'lucide-react';
import { useState } from 'react';
import { User } from '../types';
import { toast } from 'sonner';

interface ContactProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

export function Contact({ currentUser, onLoginClick }: ContactProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    toast.success('문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
    setMessage('');
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-gray-900 mb-4">문의하기</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            도장설비에 대한 문의사항이 있으시면 언제든지 연락주세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-gray-900 mb-6">연락처 정보</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F8] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-[#1A2C6D]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 mb-1">이메일</h4>
                    <p className="text-gray-600">coating@zion.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F8] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-[#1A2C6D]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 mb-1">전화번호</h4>
                    <p className="text-gray-600">대표: 031-123-4567</p>
                    <p className="text-gray-600 text-sm">담당자: 010-1234-5678</p>
                    <p className="text-gray-600 text-sm">팩스: 031-123-4568</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F8] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-[#1A2C6D]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 mb-1">본사 주소</h4>
                    <p className="text-gray-600">
                      경기도 화성시 팔탄면 공장길 123
                      <br />
                      도장설비 산업단지 내
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F4F6F8] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-[#1A2C6D]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 mb-1">영업시간</h4>
                    <p className="text-gray-600">평일: 09:00 - 18:00</p>
                    <p className="text-gray-600 text-sm">토·일·공휴일 휴무</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
              <MapPin className="text-gray-400" size={48} />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-2xl p-8"
          >
            <h3 className="text-gray-900 mb-6">빠른 문의</h3>
            
            {!currentUser ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Lock className="text-gray-400" size={48} />
                <p className="text-gray-600 text-center">
                  문의를 남기시려면 로그인이 필요합니다
                </p>
                <button
                  onClick={onLoginClick}
                  className="px-6 py-3 bg-[#1A2C6D] text-white rounded-lg hover:bg-[#A5C93E] transition-colors"
                >
                  로그인하기
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">작성자</span>
                    <span className="text-gray-900">{currentUser.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">이메일</span>
                    <span className="text-gray-900 text-sm">{currentUser.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">문의내용 *</label>
                  <textarea
                    rows={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1A2C6D] focus:outline-none transition-colors resize-none bg-white"
                    placeholder="문의하실 내용을 자세히 입력해주세요"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1A2C6D] text-white rounded-lg hover:bg-[#A5C93E] transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  문의하기
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
