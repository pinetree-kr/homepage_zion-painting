'use client';

import { useState } from 'react';
import { ActivityLog, BugReport } from '@/app/lib/types';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  Download,
  Bug,
  User,
  Calendar,
  Globe,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { toast } from 'sonner';
import { DataTable, DataTableColumn, DataTableAction } from '../ui/DataTable';

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: 'admin1',
    userName: '시온관리자',
    action: '로그인',
    details: '관리자 페이지 로그인',
    timestamp: '2024-11-10T09:00:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    userId: 'user1',
    userName: '김철수',
    action: '문의 작성',
    details: '견적 문의 작성 완료',
    timestamp: '2024-11-10T08:45:00Z',
    ipAddress: '192.168.1.101'
  },
];

const mockBugReports: BugReport[] = [
  {
    id: '1',
    title: '로그인 페이지 모바일 레이아웃 오류',
    description: '모바일 환경에서 로그인 버튼이 화면 밖으로 벗어남',
    status: 'resolved',
    priority: 'high',
    reportedBy: '김철수',
    createdAt: '2024-11-08T10:00:00Z',
    resolvedAt: '2024-11-09T14:00:00Z'
  },
  {
    id: '2',
    title: '이미지 업로드 실패',
    description: '5MB 이상 이미지 업로드 시 오류 발생',
    status: 'in-progress',
    priority: 'critical',
    reportedBy: '이영희',
    createdAt: '2024-11-09T15:30:00Z'
  },
];

export default function LogManagement() {
  const [activityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [bugReports, setBugReports] = useState<BugReport[]>(mockBugReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredBugReports = bugReports.filter(bug => {
    const matchesSearch = 
      bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleExportLogs = () => {
    toast.success('로그가 CSV 파일로 다운로드되었습니다');
  };

  const handleUpdateBugStatus = (bugId: string, newStatus: BugReport['status']) => {
    setBugReports(bugReports.map(bug => 
      bug.id === bugId 
        ? { 
            ...bug, 
            status: newStatus,
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : bug.resolvedAt
          }
        : bug
    ));
    toast.success('버그 상태가 업데이트되었습니다');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return '접수';
      case 'in-progress': return '처리중';
      case 'resolved': return '해결';
      case 'closed': return '종료';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return '긴급';
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const activityLogColumns: DataTableColumn<ActivityLog>[] = [
    {
      id: 'action',
      header: '작업',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#1A2C6D]" />
          <span>{row.action}</span>
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'userName',
      header: '사용자',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-3 w-3" />
          {row.userName}
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'details',
      header: '상세',
      accessor: (row) => (
        <span className="text-sm text-gray-600">{row.details}</span>
      ),
      width: '35%'
    },
    {
      id: 'timestamp',
      header: '시간',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-3 w-3" />
          {formatDate(row.timestamp)}
        </div>
      ),
      sortable: true,
      width: '20%'
    },
    {
      id: 'ipAddress',
      header: 'IP 주소',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Globe className="h-3 w-3" />
          {row.ipAddress || '-'}
        </div>
      ),
      width: '15%'
    }
  ];

  const bugReportColumns: DataTableColumn<BugReport>[] = [
    {
      id: 'title',
      header: '제목',
      accessor: (row) => row.title,
      sortable: true,
      width: '30%'
    },
    {
      id: 'priority',
      header: '우선순위',
      accessor: (row) => (
        <Badge variant="outline" className={`text-xs ${getPriorityColor(row.priority)}`}>
          {row.priority === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
          {getPriorityLabel(row.priority)}
        </Badge>
      ),
      sortable: true,
      width: '12%'
    },
    {
      id: 'status',
      header: '상태',
      accessor: (row) => (
        <Badge variant="outline" className={`text-xs ${getStatusColor(row.status)}`}>
          {row.status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
          {row.status === 'in-progress' && <Clock className="h-3 w-3 mr-1" />}
          {row.status === 'open' && <AlertCircle className="h-3 w-3 mr-1" />}
          {row.status === 'closed' && <XCircle className="h-3 w-3 mr-1" />}
          {getStatusLabel(row.status)}
        </Badge>
      ),
      sortable: true,
      width: '13%'
    },
    {
      id: 'reportedBy',
      header: '보고자',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-3 w-3" />
          {row.reportedBy}
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'createdAt',
      header: '보고일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {formatDate(row.createdAt)}
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'resolvedAt',
      header: '해결일',
      accessor: (row) => (
        <span className="text-sm text-gray-600">
          {row.resolvedAt ? formatDate(row.resolvedAt) : '-'}
        </span>
      ),
      sortable: true,
      width: '15%'
    }
  ];

  const bugReportActions: DataTableAction<BugReport>[] = [
    {
      label: (row) => row.status === 'resolved' ? '재개' : '해결 완료',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (row) => handleUpdateBugStatus(row.id, row.status === 'resolved' ? 'open' : 'resolved')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 text-2xl font-semibold mb-2">로그 관리</h1>
          <p className="text-gray-500 text-sm">시스템 활동 로그와 버그 리포트를 관리합니다</p>
        </div>
        <Button 
          onClick={handleExportLogs}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          로그 내보내기
        </Button>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            활동 로그
          </TabsTrigger>
          <TabsTrigger value="bugs" className="gap-2">
            <Bug className="h-4 w-4" />
            버그 리포트
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>활동 로그</CardTitle>
              <CardDescription>
                시스템의 모든 사용자 활동을 기록합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={activityLogs}
                columns={activityLogColumns}
                getRowId={(row) => row.id}
                emptyMessage="활동 로그가 없습니다"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>버그 리포트</CardTitle>
              <CardDescription>
                보고된 버그와 이슈를 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="제목 또는 설명으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="open">접수</SelectItem>
                    <SelectItem value="in-progress">처리중</SelectItem>
                    <SelectItem value="resolved">해결</SelectItem>
                    <SelectItem value="closed">종료</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="우선순위" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 우선순위</SelectItem>
                    <SelectItem value="critical">긴급</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                data={filteredBugReports}
                columns={bugReportColumns}
                actions={bugReportActions}
                getRowId={(row) => row.id}
                emptyMessage="버그 리포트가 없습니다"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

