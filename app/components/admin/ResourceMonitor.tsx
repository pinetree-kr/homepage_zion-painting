'use client';

import { useState, useEffect } from 'react';
import { ResourceUsage } from '@/app/lib/types';
import { 
  Server, 
  HardDrive, 
  Cpu, 
  Activity,
  TrendingUp,
  TrendingDown,
  Database,
  Wifi
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Badge } from '../ui/Badge';

const generateMockData = (): ResourceUsage[] => {
  const data: ResourceUsage[] = [];
  const now = Date.now();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString();
    data.push({
      timestamp,
      memory: {
        used: 2048 + Math.random() * 1024,
        total: 8192,
        percentage: 25 + Math.random() * 20
      },
      storage: {
        used: 45000 + Math.random() * 5000,
        total: 100000,
        percentage: 45 + Math.random() * 10
      },
      bandwidth: {
        incoming: Math.random() * 100,
        outgoing: Math.random() * 80
      }
    });
  }
  
  return data;
};

export default function ResourceMonitor() {
  const [resourceData, setResourceData] = useState<ResourceUsage[]>(generateMockData());
  const [currentUsage, setCurrentUsage] = useState<ResourceUsage>(resourceData[resourceData.length - 1]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMockData();
      setResourceData(newData);
      setCurrentUsage(newData[newData.length - 1]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} GB`;
    } else {
      return `${bytes.toFixed(2)} MB`;
    }
  };

  const formatBandwidth = (mbps: number) => {
    return `${mbps.toFixed(2)} MB/s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 text-2xl font-semibold mb-2">리소스 모니터링</h1>
        <p className="text-gray-500 text-sm">시스템 리소스 사용량을 실시간으로 모니터링합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">메모리</CardTitle>
              <Cpu className="h-4 w-4 text-[#1A2C6D]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{currentUsage.memory.percentage.toFixed(1)}%</span>
              <span className="text-sm text-gray-500">
                {formatBytes(currentUsage.memory.used)} / {formatBytes(currentUsage.memory.total)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#1A2C6D] h-2 rounded-full transition-all"
                style={{ width: `${currentUsage.memory.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">스토리지</CardTitle>
              <HardDrive className="h-4 w-4 text-[#A5C93E]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{currentUsage.storage.percentage.toFixed(1)}%</span>
              <span className="text-sm text-gray-500">
                {formatBytes(currentUsage.storage.used)} / {formatBytes(currentUsage.storage.total)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#A5C93E] h-2 rounded-full transition-all"
                style={{ width: `${currentUsage.storage.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">다운로드</CardTitle>
              <TrendingDown className="h-4 w-4 text-[#2CA7DB]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-gray-400" />
              <span className="text-2xl">{formatBandwidth(currentUsage.bandwidth.incoming)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">업로드</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#2CA7DB]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-gray-400" />
              <span className="text-2xl">{formatBandwidth(currentUsage.bandwidth.outgoing)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">사용량</TabsTrigger>
          <TabsTrigger value="bandwidth">대역폭</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>시스템 리소스 사용량</CardTitle>
              <CardDescription>
                최근 24시간 동안의 메모리 및 스토리지 사용률
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                차트 영역 (차트 라이브러리 설치 필요)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bandwidth">
          <Card>
            <CardHeader>
              <CardTitle>네트워크 대역폭</CardTitle>
              <CardDescription>
                최근 24시간 동안의 업로드/다운로드 대역폭
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                차트 영역 (차트 라이브러리 설치 필요)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              시스템 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">서버 상태</span>
              <Badge variant="default" className="bg-green-500">정상</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">데이터베이스</span>
              <Badge variant="default" className="bg-green-500">연결됨</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">업타임</span>
              <span className="text-gray-900">99.9%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              데이터베이스
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">연결 수</span>
              <span className="text-gray-900">12 / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">쿼리 속도</span>
              <span className="text-gray-900">45ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">캐시 히트율</span>
              <span className="text-gray-900">98.5%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

