import { useState } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

export function ContactInfo() {
  const [contactInfo, setContactInfo] = useState({
    email: 'coating@zion.com',
    address: '경기도 화성시 팔탄면 공장길 123\n도장설비 산업단지 내',
    businessHours: '평일: 09:00 - 18:00\n토·일·공휴일 휴무',
    phoneMain: '031-123-4567',
    phoneManager: '010-1234-5678',
    fax: '031-123-4568',
    kakaoMapUrl: '',
    naverMapUrl: '',
  });

  const handleSave = () => {
    toast.success('연락처 정보가 저장되었습니다.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">연락정보 관리</h2>
          <p className="text-muted-foreground text-sm">이메일, 주소, 연락처 등을 관리합니다</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          저장
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label>대표 이메일</Label>
            <Input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              placeholder="coating@company.com"
            />
          </div>

          <div>
            <Label>주소</Label>
            <Textarea
              value={contactInfo.address}
              onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
              placeholder="주소를 입력하세요"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>대표 전화번호</Label>
              <Input
                type="tel"
                value={contactInfo.phoneMain}
                onChange={(e) => setContactInfo({ ...contactInfo, phoneMain: e.target.value })}
                placeholder="031-123-4567"
              />
            </div>
            <div>
              <Label>담당자 전화번호</Label>
              <Input
                type="tel"
                value={contactInfo.phoneManager}
                onChange={(e) => setContactInfo({ ...contactInfo, phoneManager: e.target.value })}
                placeholder="010-1234-5678"
              />
            </div>
          </div>

          <div>
            <Label>팩스</Label>
            <Input
              type="tel"
              value={contactInfo.fax}
              onChange={(e) => setContactInfo({ ...contactInfo, fax: e.target.value })}
              placeholder="031-123-4568"
            />
          </div>

          <div>
            <Label>영업시간</Label>
            <Textarea
              value={contactInfo.businessHours}
              onChange={(e) => setContactInfo({ ...contactInfo, businessHours: e.target.value })}
              placeholder="평일: 09:00 - 18:00"
              rows={3}
            />
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-gray-900 mb-4">지도 링크</h3>
            <div className="space-y-4">
              <div>
                <Label>카카오맵 링크</Label>
                <div className="flex gap-2">
                  <Input
                    value={contactInfo.kakaoMapUrl}
                    onChange={(e) => setContactInfo({ ...contactInfo, kakaoMapUrl: e.target.value })}
                    placeholder="https://map.kakao.com/..."
                  />
                  {contactInfo.kakaoMapUrl && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(contactInfo.kakaoMapUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <Label>네이버 지도 링크</Label>
                <div className="flex gap-2">
                  <Input
                    value={contactInfo.naverMapUrl}
                    onChange={(e) => setContactInfo({ ...contactInfo, naverMapUrl: e.target.value })}
                    placeholder="https://map.naver.com/..."
                  />
                  {contactInfo.naverMapUrl && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(contactInfo.naverMapUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
