'use client';

import { useState, useEffect } from 'react';
import { Save, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { Switch } from '@/src/shared/ui';
import { toast } from 'sonner';
import { getContactInfo, saveContactInfo, geocodeAddress, decryptMapApiKeys } from '../api/company-actions';
import { formatPhoneForStorage, formatPhoneOnInput } from '@/src/shared/lib/utils';
import type { MapConfig } from '@/src/entities/site-setting/model/types';

export default function ContactInfo() {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    address: '',
    businessHours: '',
    phonePrimary: '',
    phoneSecondary: '',
    fax: '',
  });
  const [maps, setMaps] = useState<MapConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState<{ kakao: boolean; naver: boolean }>({
    kakao: false,
    naver: false,
  });

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
          phonePrimary: data.phone_primary || '',
          phoneSecondary: data.phone_secondary || '',
          fax: data.fax || '',
        });
        
        // maps 데이터 로드 및 복호화
        if (data.maps && Array.isArray(data.maps) && data.maps.length > 0) {
          // 복호화된 API 키 가져오기
          const decryptedKeys = await decryptMapApiKeys(data.maps);
          
          // maps 데이터 설정 (복호화된 값으로 표시용)
          const mapsWithDefaults = data.maps.map((map) => {
            return {
              ...map,
              enabled: map.enabled !== undefined ? map.enabled : false,
              // 복호화된 값으로 표시 (저장 시에는 다시 암호화됨)
              client_id: map.provider === 'kakao' 
                ? (decryptedKeys.kakao.client_id || '')
                : (decryptedKeys.naver.client_id || ''),
              client_secret: map.provider === 'naver' 
                ? (decryptedKeys.naver.client_secret || '')
                : null,
            };
          });
          setMaps(mapsWithDefaults);
        } else {
          // 기본값 설정
          setMaps([
            { provider: 'kakao', enabled: false, coords: null, client_id: '', client_secret: null },
            { provider: 'naver', enabled: false, coords: null, client_id: '', client_secret: '' },
          ]);
        }
      } else {
        // 기본값 설정
        setMaps([
          { provider: 'kakao', enabled: false, coords: null, client_id: '', client_secret: null },
          { provider: 'naver', enabled: false, coords: null, client_id: '', client_secret: '' },
        ]);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getMap = (provider: 'kakao' | 'naver'): MapConfig => {
    const map = maps.find((m) => m.provider === provider);
    if (map) return map;
    // 없으면 새로 생성
    const newMap: MapConfig = {
      provider,
      enabled: false,
      coords: null,
      client_id: null,
      client_secret: null,
    };
    setMaps([...maps, newMap]);
    return newMap;
  };

  const updateMap = (provider: 'kakao' | 'naver', updates: Partial<MapConfig>) => {
    const currentMap = getMap(provider);
    const updatedMaps = maps.map((m) => (m.provider === provider ? { ...currentMap, ...updates } : m));
    // 만약 현재 provider가 없었다면 추가
    if (!maps.find((m) => m.provider === provider)) {
      updatedMaps.push({ ...currentMap, ...updates });
    }
    setMaps(updatedMaps);
  };

  const handleGeocode = async (provider: 'kakao' | 'naver') => {
    if (!contactInfo.address || contactInfo.address.trim() === '') {
      toast.error('주소를 먼저 입력해주세요.');
      return;
    }

    const currentMap = getMap(provider);
    
    // 저장된 API 키 확인
    if (provider === 'kakao') {
      if (!currentMap.client_id || currentMap.client_id.trim() === '') {
        toast.error('카카오맵 Client ID를 먼저 입력해주세요.');
        return;
      }
    } else {
      if (!currentMap.client_id || currentMap.client_id.trim() === '' || 
          !currentMap.client_secret || currentMap.client_secret.trim() === '') {
        toast.error('네이버맵 Client ID와 Secret을 먼저 입력해주세요.');
        return;
      }
    }

    try {
      setGeocoding((prev) => ({ ...prev, [provider]: true }));
      const result = await geocodeAddress(
        contactInfo.address, 
        provider,
        currentMap.client_id || null,
        currentMap.client_secret || null
      );

      if (result.success && result.coords) {
        updateMap(provider, { coords: result.coords });
        toast.success('주소를 좌표로 변환했습니다.');
      } else {
        toast.error(result.error || '주소 변환에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Geocoding 오류:', error);
      toast.error('주소 변환 중 오류가 발생했습니다.');
    } finally {
      setGeocoding((prev) => ({ ...prev, [provider]: false }));
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
        maps: maps, // 모든 maps 저장 (enabled, coords 포함)
      });

      if (result.success) {
        toast.success('회사 정보가 저장되었습니다.');
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

  const kakaoMap = getMap('kakao');
  const naverMap = getMap('naver');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-gray-900 text-lg font-semibold">오시는 길 · 연락처</span>
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

          {/* 지도 설정 */}
          <div className="border-t border-gray-200 pt-6 space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">지도 설정</Label>
              <p className="text-sm text-gray-500 mb-4">
                지도 API 키를 입력하고 저장하면 암호화되어 저장됩니다.
              </p>
            </div>

            {/* 카카오맵 설정 */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={kakaoMap.enabled}
                    onCheckedChange={(checked) => updateMap('kakao', { enabled: checked })}
                  />
                  <Label className="text-base font-medium">카카오맵</Label>
                </div>
              </div>

              {kakaoMap.enabled && (
                <div className="space-y-3 pl-9 border-l-2 border-gray-200">
                  <div>
                    <Label className="text-sm">REST API 키 (Client ID)</Label>
                    <Input
                      type="password"
                      value={kakaoMap.client_id || ''}
                      onChange={(e) => updateMap('kakao', { client_id: e.target.value })}
                      placeholder="카카오맵 REST API 키를 입력하세요"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">좌표 (위도, 경도)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={
                          kakaoMap.coords
                            ? `${kakaoMap.coords[0].toFixed(6)}, ${kakaoMap.coords[1].toFixed(6)}`
                            : ''
                        }
                        readOnly
                        placeholder="주소를 기반으로 자동으로 찾습니다"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleGeocode('kakao')}
                        disabled={
                          geocoding.kakao || !contactInfo.address || !kakaoMap.client_id
                        }
                      >
                        {geocoding.kakao ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span className="ml-2">좌표 찾기</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 네이버맵 설정 */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={naverMap.enabled}
                    onCheckedChange={(checked) => updateMap('naver', { enabled: checked })}
                  />
                  <Label className="text-base font-medium">네이버맵</Label>
                </div>
              </div>

              {naverMap.enabled && (
                <div className="space-y-3 pl-9 border-l-2 border-gray-200">
                  <div>
                    <Label className="text-sm">Client ID</Label>
                    <Input
                      type="password"
                      value={naverMap.client_id || ''}
                      onChange={(e) => updateMap('naver', { client_id: e.target.value })}
                      placeholder="네이버 클라우드 플랫폼 Client ID를 입력하세요"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Client Secret</Label>
                    <Input
                      type="password"
                      value={naverMap.client_secret || ''}
                      onChange={(e) => updateMap('naver', { client_secret: e.target.value })}
                      placeholder="네이버 클라우드 플랫폼 Client Secret을 입력하세요"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">좌표 (위도, 경도)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={
                          naverMap.coords
                            ? `${naverMap.coords[0].toFixed(6)}, ${naverMap.coords[1].toFixed(6)}`
                            : ''
                        }
                        readOnly
                        placeholder="주소를 기반으로 자동으로 찾습니다"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleGeocode('naver')}
                        disabled={
                          geocoding.naver || !contactInfo.address || !naverMap.client_id || !naverMap.client_secret
                        }
                      >
                        {geocoding.naver ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span className="ml-2">좌표 찾기</span>
                      </Button>
                    </div>
                  </div>
                </div>
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
