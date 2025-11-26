'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

export interface DataTableSearchBarProps {
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  searchParamKey?: string; // URL searchParam 키 (기본값: 'search')
}

export function DataTableSearchBar({
  placeholder = '검색...',
  debounceMs = 300,
  className = '',
  searchParamKey = 'search'
}: DataTableSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get(searchParamKey) || '');
  const isUpdatingRef = useRef(false); // URL 업데이트 중인지 추적

  // URL 업데이트 (debounce)
  useEffect(() => {
    // URL 업데이트 중이면 스킵
    if (isUpdatingRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      const currentUrlSearchTerm = searchParams?.get(searchParamKey) || '';
      const trimmedSearchTerm = searchTerm.trim();
      
      // URL과 현재 입력값이 같으면 업데이트하지 않음
      if (currentUrlSearchTerm === trimmedSearchTerm) {
        return;
      }

      isUpdatingRef.current = true;

      const params = new URLSearchParams(searchParams?.toString() || '');
      
      if (trimmedSearchTerm) {
        params.set(searchParamKey, trimmedSearchTerm);
        params.set('page', '1'); // 검색 시 첫 페이지로
      } else {
        params.delete(searchParamKey);
        params.delete('page'); // 검색어가 없으면 page도 제거 (기본값 1)
      }

      router.push(`?${params.toString()}`, { scroll: false });
      
      // URL 업데이트 완료 후 플래그 리셋
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs, router, searchParams, searchParamKey]);

  // URL의 searchParam이 변경되면 동기화 (외부에서 URL이 변경된 경우만)
  useEffect(() => {
    // URL 업데이트 중이면 스킵 (자기 자신이 업데이트한 경우)
    if (isUpdatingRef.current) {
      return;
    }

    const urlSearchTerm = searchParams?.get(searchParamKey) || '';
    // URL이 변경되었고, 현재 입력값과 다를 때만 동기화
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams, searchParamKey]); // searchTerm을 의존성에서 제거하여 무한 루프 방지

  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete(searchParamKey);
    params.delete('page');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

