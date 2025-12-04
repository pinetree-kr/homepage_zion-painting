'use client';

import { useState, useEffect } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { toast } from 'sonner';
import { getContactInfo, saveContactInfo } from '../api/company-actions';
import { formatPhoneForStorage, formatPhoneOnInput } from '@/src/shared/lib/utils';

export default function ContactInfo() {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    address: '',
    businessHours: '',
    phonePrimary: '',
    phoneSecondary: '',
    fax: '',
    mapUrl: '',
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
      console.log(data)
      if (data) {
        setContactInfo({
          email: data.email || '',
          address: data.address || '',
          businessHours: data.business_hours || '',
          phonePrimary: data.phone_primary || '',
          phoneSecondary: data.phone_secondary || '',
          fax: data.fax || '',
          mapUrl: data.map_url || '',
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
        phone_primary: formatPhoneForStorage(contactInfo.phonePrimary),
        phone_secondary: formatPhoneForStorage(contactInfo.phoneSecondary),
        fax: formatPhoneForStorage(contactInfo.fax),
        map_url: contactInfo.mapUrl,
      });

      if (result.success) {
        toast.success('회사 정보가 저장되었습니다.');
        // 저장 후 다시 로드하여 DB에 저장된 형식으로 표시
        await loadData();
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h3 className="text-gray-900 text-lg font-semibold">오시는 길 · 연락처</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                value={contactInfo.phonePrimary}
                onChange={(e) => {
                  const formatted = formatPhoneOnInput(e.target.value, contactInfo.phonePrimary);
                  setContactInfo({ ...contactInfo, phonePrimary: formatted });
                }}
                placeholder="031-123-4567 또는 +82-31-123-4567"
              />
            </div>
            <div>
              <Label>담당자 전화번호</Label>
              <Input
                type="tel"
                value={contactInfo.phoneSecondary}
                onChange={(e) => {
                  const formatted = formatPhoneOnInput(e.target.value, contactInfo.phoneSecondary);
                  setContactInfo({ ...contactInfo, phoneSecondary: formatted });
                }}
                placeholder="010-1234-5678 또는 +82-10-1234-5678"
              />
            </div>
          </div>

          <div>
            <Label>팩스</Label>
            <Input
              type="tel"
              value={contactInfo.fax}
              onChange={(e) => {
                const formatted = formatPhoneOnInput(e.target.value, contactInfo.fax);
                setContactInfo({ ...contactInfo, fax: formatted });
              }}
              placeholder="031-123-4568 또는 +82-31-123-4568"
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

          <div>
            <Label>지도 링크</Label>
            <div className="flex gap-2">
              <Input
                value={contactInfo.mapUrl}
                onChange={(e) => setContactInfo({ ...contactInfo, mapUrl: e.target.value })}
                placeholder="https://map.kakao.com/... 또는 https://map.naver.com/..."
              />
              {contactInfo.mapUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(contactInfo.mapUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSave} className="h-[42px] gap-2" disabled={saving} size="lg">
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

