'use client';

import { useState, useEffect } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { toast } from 'sonner';
import { getContactInfo, saveContactInfo } from '../api/company-actions';

export default function ContactInfo() {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    address: '',
    businessHours: '',
    phoneMain: '',
    phoneManager: '',
    fax: '',
    kakaoMapUrl: '',
    naverMapUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getContactInfo();
      if (data) {
        setContactInfo({
          email: data.email || '',
          address: data.address || '',
          businessHours: data.business_hours || '',
          phoneMain: data.phone_main || '',
          phoneManager: data.phone_manager || '',
          fax: data.fax || '',
          kakaoMapUrl: data.kakao_map_url || '',
          naverMapUrl: data.naver_map_url || '',
        });
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await saveContactInfo({
        email: contactInfo.email,
        address: contactInfo.address,
        business_hours: contactInfo.businessHours,
        phone_main: contactInfo.phoneMain,
        phone_manager: contactInfo.phoneManager,
        fax: contactInfo.fax,
        kakao_map_url: contactInfo.kakaoMapUrl,
        naver_map_url: contactInfo.naverMapUrl,
      });

      if (result.success) {
        toast.success('회사 정보가 저장되었습니다.');
      } else {
        toast.error(`저장 중 오류가 발생했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 오류:', error);
      toast.error(`저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 text-lg font-semibold">오시는 길 · 연락처</h3>
          <Button onClick={handleSave} className="gap-2" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
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

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-gray-900 mb-4 text-lg font-semibold">지도 링크</h3>
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

