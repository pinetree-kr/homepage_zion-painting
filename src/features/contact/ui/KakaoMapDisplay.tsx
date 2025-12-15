'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface KakaoMapDisplayProps {
  coords: [number, number]; // [latitude, longitude]
  apiKey: string;
  address?: string | null;
  className?: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMapDisplay({ coords, apiKey, address, className = '' }: KakaoMapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 카카오맵 초기화
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    const [lat, lng] = coords;

    // 이미 스크립트가 로드되어 있고 지도 API가 사용 가능한 경우
    if (window.kakao && window.kakao.maps) {
      initializeMap(lat, lng);
      return;
    }

    // 스크립트가 이미 DOM에 있는지 확인
    const existingScript = document.querySelector(`script[src*="dapi.kakao.com"]`);
    if (existingScript) {
      // 스크립트가 있으면 500ms마다 확인
      let checkInterval: NodeJS.Timeout | null = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
          window.kakao.maps.load(() => {
            initializeMap(lat, lng);
          });
        }
      }, 500);

      // 최대 10초 대기
      const timeoutId = setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
      }, 10000);

      return () => {
        if (checkInterval) clearInterval(checkInterval);
        clearTimeout(timeoutId);
      };
    }

    // 스크립트가 없으면 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    let checkInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    script.onload = () => {
      // 스크립트 로드 후 500ms마다 확인
      checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          if (checkInterval) clearInterval(checkInterval);
          if (timeoutId) clearTimeout(timeoutId);
          window.kakao.maps.load(() => {
            initializeMap(lat, lng);
          });
        }
      }, 500);

      // 최대 10초 대기 (20회 * 500ms)
      timeoutId = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
      }, 10000);
    };

    document.head.appendChild(script);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [apiKey, coords, mapLoaded]);

  const initializeMap = (lat: number, lng: number) => {
    if (!mapRef.current || mapLoaded) return;

    const container = mapRef.current;
    container.innerHTML = '';

    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3,
    };
    const map = new window.kakao.maps.Map(container, options);

    // 마커 추가
    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(map);

    setMapLoaded(true);
  };

  const handleAddressClick = () => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://map.kakao.com/link/search/${encodedAddress}`, '_blank');
    }
  };

  return (
    <>
      {/* <Script src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`} strategy="beforeInteractive" /> */}
      <div className={`rounded-xl overflow-hidden border border-gray-200 shadow-lg ${className}`}>
        <div ref={mapRef} className="w-full h-[400px]" />
        {address && (
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <button
              type="button"
              onClick={handleAddressClick}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1A2C6D] transition-colors group"
            >
              <svg
                className="w-4 h-4 text-gray-500 group-hover:text-[#1A2C6D] transition-colors"
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
              <span className="flex-1 text-left">{address}</span>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-[#1A2C6D] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
