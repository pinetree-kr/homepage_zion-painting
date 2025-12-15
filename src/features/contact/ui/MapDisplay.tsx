'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MapConfig } from '@/src/entities/site-setting/model/types';
import KakaoMapDisplay from './KakaoMapDisplay';
import NaverMapDisplay from './NaverMapDisplay';

interface MapDisplayProps {
  maps: MapConfig[] | null;
  address?: string | null;
  className?: string;
  mapApiKeys: {
    kakao: string | null;
    naver: { clientId: string | null; clientSecret: string | null };
  };
}

export default function MapDisplay({ maps, address, className = '', mapApiKeys }: MapDisplayProps) {
  const [selectedProvider, setSelectedProvider] = useState<'kakao' | 'naver' | null>(null);

  // 사용 가능한 지도 찾기 (enabled가 true이고, coords가 있고, 해당 provider의 API 키가 있는 것)
  const availableMaps = useMemo(() => maps?.filter((map) => {
    if (!map.enabled) return false; // enabled가 false면 제외
    if (!map.coords || map.coords.length !== 2) return false;
    if (map.provider === 'kakao' && mapApiKeys.kakao) return true;
    if (map.provider === 'naver' && mapApiKeys.naver.clientId && mapApiKeys.naver.clientSecret)
      return true;
    return false;
  }) || [], [maps, mapApiKeys]);

  useEffect(() => {
    if (availableMaps.length === 0) {
      setSelectedProvider(null);
      return;
    }

    // 첫 번째 사용 가능한 지도를 기본 선택
    const firstMap = availableMaps[0];
    setSelectedProvider(firstMap.provider);
  }, [availableMaps]);


  if (availableMaps.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-xl h-[400px] flex items-center justify-center border border-gray-200 ${className}`}>
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-gray-500">지도 정보가 없습니다</p>
        </div>
      </div>
    );
  }

  const hasKakao = availableMaps.some((m) => m.provider === 'kakao');
  const hasNaver = availableMaps.some((m) => m.provider === 'naver');

  return (
    <div className={className}>
      {/* 지도 제공자 선택 탭 (여러 개 있을 때만 표시) */}
      {hasKakao && hasNaver && (
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => {
              setSelectedProvider('kakao');
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${selectedProvider === 'kakao'
              ? 'text-[#1A2C6D]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            카카오맵
            {selectedProvider === 'kakao' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A2C6D]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedProvider('naver');
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${selectedProvider === 'naver'
              ? 'text-[#1A2C6D]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            네이버맵
            {selectedProvider === 'naver' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A2C6D]" />
            )}
          </button>
        </div>
      )}

      {/* 카카오맵 */}
      {selectedProvider === 'kakao' && hasKakao && (() => {
        const kakaoMap = availableMaps.find((m) => m.provider === 'kakao');
        return kakaoMap?.coords && mapApiKeys.kakao ? (
          <KakaoMapDisplay coords={kakaoMap.coords} apiKey={mapApiKeys.kakao} address={address} />
        ) : null;
      })()}

      {/* 네이버맵 */}
      {selectedProvider === 'naver' && hasNaver && (() => {
        const naverMap = availableMaps.find((m) => m.provider === 'naver');
        return naverMap?.coords && mapApiKeys.naver.clientId && mapApiKeys.naver.clientSecret ? (
          <NaverMapDisplay 
            coords={naverMap.coords} 
            clientId={mapApiKeys.naver.clientId}
            clientSecret={mapApiKeys.naver.clientSecret}
            address={address}
          />
        ) : null;
      })()}
    </div>
  );
}
