import { useState, useEffect } from 'react';
import { ResourceUsage } from '../../types';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data generator
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

export function ResourceMonitor() {
  const [resourceData, setResourceData] = useState<ResourceUsage[]>(generateMockData());
  const [currentUsage, setCurrentUsage] = useState<ResourceUsage>(resourceData[resourceData.length - 1]);

  useEffect(() => {
    // Simulate real-time updates
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const chartData = resourceData.map(data => ({
    time: formatTime(data.timestamp),
    memory: data.memory.percentage,
    storage: data.storage.percentage,
    incoming: data.bandwidth.incoming,
    outgoing: data.bandwidth.outgoing
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">리소스 모니터링</h1>
        <p className="text-muted-foreground">
          시스템 리소스 사용량을 실시간으로 모니터링합니다
        </p>
      </div>

      {/* Current Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Memory */}
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
              <span className="text-sm text-muted-foreground">
                {formatBytes(currentUsage.memory.used)} / {formatBytes(currentUsage.memory.total)}
              </span>
            </div>
            <Progress value={currentUsage.memory.percentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Storage */}
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
              <span className="text-sm text-muted-foreground">
                {formatBytes(currentUsage.storage.used)} / {formatBytes(currentUsage.storage.total)}
              </span>
            </div>
            <Progress value={currentUsage.storage.percentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Incoming Bandwidth */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">다운로드</CardTitle>
              <TrendingDown className="h-4 w-4 text-[#2CA7DB]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl">{formatBandwidth(currentUsage.bandwidth.incoming)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Outgoing Bandwidth */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">업로드</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#2CA7DB]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl">{formatBandwidth(currentUsage.bandwidth.outgoing)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">사용량</TabsTrigger>
          <TabsTrigger value="bandwidth">대역폭</TabsTrigger>
        </TabsList>

        {/* Usage Chart */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>시스템 리소스 사용량</CardTitle>
              <CardDescription>
                최근 24시간 동안의 메모리 및 스토리지 사용률
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                    label={{ value: '사용률 (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#1A2C6D" 
                    strokeWidth={2}
                    name="메모리"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="storage" 
                    stroke="#A5C93E" 
                    strokeWidth={2}
                    name="스토리지"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bandwidth Chart */}
        <TabsContent value="bandwidth">
          <Card>
            <CardHeader>
              <CardTitle>네트워크 대역폭</CardTitle>
              <CardDescription>
                최근 24시간 동안의 업로드/다운로드 대역폭
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: '대역폭 (MB/s)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="incoming" 
                    stackId="1"
                    stroke="#2CA7DB" 
                    fill="#2CA7DB"
                    fillOpacity={0.6}
                    name="다운로드"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="outgoing" 
                    stackId="2"
                    stroke="#1A2C6D" 
                    fill="#1A2C6D"
                    fillOpacity={0.6}
                    name="업로드"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              시스템 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">서버 상태</span>
              <span className="text-sm font-medium text-green-600">정상 운영중</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">가동 시간</span>
              <span className="text-sm font-medium">45일 12시간</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">CPU 코어</span>
              <span className="text-sm font-medium">8 코어</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">운영체제</span>
              <span className="text-sm font-medium">Ubuntu 22.04 LTS</span>
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
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">DB 상태</span>
              <span className="text-sm font-medium text-green-600">연결됨</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">총 테이블</span>
              <span className="text-sm font-medium">24개</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">총 레코드</span>
              <span className="text-sm font-medium">12,548개</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">DB 크기</span>
              <span className="text-sm font-medium">245 MB</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
