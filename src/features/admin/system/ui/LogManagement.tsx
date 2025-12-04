'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityLog, LogType } from '@/src/entities';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  Download,
  User,
  Calendar,
  XCircle,
  UserPlus,
  Shield,
  LogIn,
  Settings,
  FileText,
  MessageSquare,
  Calculator,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui';
import { toast } from 'sonner';
import { DataTable, DataTableColumn, DataTablePagination } from '@/src/shared/ui';


const logTypeLabels: Record<LogType, string> = {
  USER_SIGNUP: '사용자 가입',
  ADMIN_SIGNUP: '관리자 가입',
  LOGIN_FAILED: '로그인 실패',
  ADMIN_LOGIN: '관리자 로그인',
  SECTION_SETTING_CHANGE: '섹션 설정 변경',
  BOARD_CREATE: '게시판 생성',
  BOARD_UPDATE: '게시판 수정',
  BOARD_DELETE: '게시판 삭제',
  POST_CREATE: '게시글 작성',
  POST_ANSWER: '관리자 답변',
  ERROR: '오류 로그',
};

const logTypeIcons: Record<LogType, typeof Activity> = {
  USER_SIGNUP: UserPlus,
  ADMIN_SIGNUP: Shield,
  LOGIN_FAILED: XCircle,
  ADMIN_LOGIN: LogIn,
  SECTION_SETTING_CHANGE: Settings,
  BOARD_CREATE: FileText,
  BOARD_UPDATE: FileText,
  BOARD_DELETE: FileText,
  POST_CREATE: MessageSquare,
  POST_ANSWER: MessageSquare,
  ERROR: AlertTriangle,
};

const logTypeColors: Record<LogType, string> = {
  USER_SIGNUP: 'bg-blue-100 text-blue-800 border-blue-200',
  ADMIN_SIGNUP: 'bg-purple-100 text-purple-800 border-purple-200',
  LOGIN_FAILED: 'bg-red-100 text-red-800 border-red-200',
  ADMIN_LOGIN: 'bg-green-100 text-green-800 border-green-200',
  SECTION_SETTING_CHANGE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  BOARD_CREATE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  BOARD_UPDATE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  BOARD_DELETE: 'bg-gray-100 text-gray-800 border-gray-200',
  POST_CREATE: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  POST_ANSWER: 'bg-teal-100 text-teal-800 border-teal-200',
  ERROR: 'bg-red-100 text-red-800 border-red-200',
};

interface LogManagementProps {
  initialLogs: ActivityLog[];
  totalCount: number;
  stats: Record<LogType, number>;
  totalLogCount: number;
  searchQuery: string;
  logTypeFilter: string;
  dateFilter: string;
  currentPage: number;
  itemsPerPage: number;
}

export default function LogManagement({
  initialLogs,
  totalCount,
  stats: logTypeCounts,
  totalLogCount,
  searchQuery: initialSearchQuery,
  logTypeFilter: initialLogTypeFilter,
  dateFilter: initialDateFilter,
  currentPage,
  itemsPerPage,
}: LogManagementProps) {
  const router = useRouter();

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set('search', value);
    if (initialLogTypeFilter !== 'all') params.set('logType', initialLogTypeFilter);
    if (initialDateFilter !== 'all') params.set('dateFilter', initialDateFilter);
    router.push(`/admin/system/logs?${params.toString()}`);
  };

  const handleLogTypeChange = (value: string) => {
    const params = new URLSearchParams();
    if (initialSearchQuery) params.set('search', initialSearchQuery);
    if (value !== 'all') params.set('logType', value);
    if (initialDateFilter !== 'all') params.set('dateFilter', initialDateFilter);
    router.push(`/admin/system/logs?${params.toString()}`);
  };

  const handleDateFilterChange = (value: string) => {
    const params = new URLSearchParams();
    if (initialSearchQuery) params.set('search', initialSearchQuery);
    if (initialLogTypeFilter !== 'all') params.set('logType', initialLogTypeFilter);
    if (value !== 'all') params.set('dateFilter', value);
    router.push(`/admin/system/logs?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (initialSearchQuery) params.set('search', initialSearchQuery);
    if (initialLogTypeFilter !== 'all') params.set('logType', initialLogTypeFilter);
    if (initialDateFilter !== 'all') params.set('dateFilter', initialDateFilter);
    if (page > 1) params.set('page', page.toString());
    router.push(`/admin/system/logs?${params.toString()}`);
  };

  const filteredLogs = initialLogs; // 서버에서 이미 필터링된 데이터
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // TODO: 로그가 많이 쌓일 경우 부하가 걸릴 수 있어 주석 처리
  // 나중에 서버 사이드에서 처리하거나 페이지네이션된 내보내기로 구현 필요
  // const handleExportLogs = () => {
  //   // CSV 형식으로 내보내기
  //   const headers = ['ID', '사용자', '로그 타입', '작업', '상세', '시간', '메타데이터'];
  //   const rows = filteredLogs.map(log => [
  //     log.id,
  //     log.userName,
  //     logTypeLabels[log.logType],
  //     log.action,
  //     log.details,
  //     formatDate(log.timestamp),
  //     log.metadata ? JSON.stringify(log.metadata) : '-'
  //   ]);
  //   
  //   const csvContent = [
  //     headers.join(','),
  //     ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  //   ].join('\n');
  //   
  //   const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const link = document.createElement('a');
  //   const url = URL.createObjectURL(blob);
  //   link.setAttribute('href', url);
  //   link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`);
  //   link.style.visibility = 'hidden';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   
  //   toast.success('로그가 CSV 파일로 다운로드되었습니다');
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderMetadata = (log: ActivityLog) => {
    if (!log.metadata) return null;
    
    const metadataItems: React.ReactElement[] = [];
    
    if (log.metadata.sectionName) {
      metadataItems.push(
        <div key="section" className="text-xs text-gray-500">
          섹션: {log.metadata.sectionName}
        </div>
      );
    }
    
    if (log.metadata.boardName) {
      metadataItems.push(
        <div key="board" className="text-xs text-gray-500">
          게시판: {log.metadata.boardName}
        </div>
      );
    }
    
    if (log.metadata.postId) {
      metadataItems.push(
        <div key="post" className="text-xs text-gray-500">
          게시글 ID: {log.metadata.postId}
        </div>
      );
    }
    
    if (log.metadata.errorMessage) {
      metadataItems.push(
        <div key="error" className="text-xs text-red-600 font-medium">
          오류: {log.metadata.errorMessage}
        </div>
      );
    }
    
    if (log.metadata.beforeValue && log.metadata.afterValue) {
      metadataItems.push(
        <div key="change" className="text-xs text-gray-500 mt-1">
          <div>변경 전: {log.metadata.beforeValue}</div>
          <div>변경 후: {log.metadata.afterValue}</div>
        </div>
      );
    }
    
    return metadataItems.length > 0 ? (
      <div className="mt-1 space-y-0.5">
        {metadataItems}
      </div>
    ) : null;
  };

  const activityLogColumns: DataTableColumn<ActivityLog>[] = [
    {
      id: 'logType',
      header: '로그 타입',
      accessor: (row) => {
        const IconComponent = logTypeIcons[row.logType];
        return (
          <Badge variant="outline" className={`text-xs ${logTypeColors[row.logType]}`}>
            <IconComponent className="h-3 w-3 mr-1" />
            {logTypeLabels[row.logType]}
          </Badge>
        );
      },
      sortable: true,
      width: '15%'
    },
    {
      id: 'action',
      header: '작업',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.action}</span>
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
      width: '12%'
    },
    {
      id: 'details',
      header: '상세',
      accessor: (row) => (
        <div className="text-sm text-gray-600">
          <div>{row.details}</div>
          {renderMetadata(row)}
        </div>
      ),
      width: '30%'
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
      width: '18%'
    }
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 text-2xl font-semibold mb-2">로그 관리</h1>
          <p className="text-gray-500 text-sm">시스템의 모든 활동과 오류를 기록하고 관리합니다</p>
        </div>
        {/* TODO: 로그가 많이 쌓일 경우 부하가 걸릴 수 있어 주석 처리
        <Button 
          onClick={handleExportLogs}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          로그 내보내기
        </Button>
        */}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">전체 로그</p>
                <p className="text-2xl font-semibold">{totalLogCount}</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">사용자 가입</p>
                <p className="text-2xl font-semibold">{logTypeCounts.USER_SIGNUP}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">관리자 로그인</p>
                <p className="text-2xl font-semibold">{logTypeCounts.ADMIN_LOGIN}</p>
              </div>
              <LogIn className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">로그인 실패</p>
                <p className="text-2xl font-semibold">{logTypeCounts.LOGIN_FAILED}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">게시글 작성</p>
                <p className="text-2xl font-semibold">{logTypeCounts.POST_CREATE}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">오류 로그</p>
                <p className="text-2xl font-semibold">{logTypeCounts.ERROR}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

          <Card>
            <CardHeader>
              <CardTitle>활동 로그</CardTitle>
              <CardDescription>
            시스템의 모든 사용자 활동과 오류를 기록합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="사용자, 작업, 상세 내용으로 검색..."
                      defaultValue={initialSearchQuery}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchChange(e.currentTarget.value);
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                      if (input) {
                        handleSearchChange(input.value);
                      }
                    }}
                    variant="outline"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

            <Select value={initialLogTypeFilter} onValueChange={handleLogTypeChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="로그 타입" />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="all">모든 타입</SelectItem>
                <SelectItem value="USER_SIGNUP">사용자 가입</SelectItem>
                <SelectItem value="ADMIN_SIGNUP">관리자 가입</SelectItem>
                <SelectItem value="LOGIN_FAILED">로그인 실패</SelectItem>
                <SelectItem value="ADMIN_LOGIN">관리자 로그인</SelectItem>
                <SelectItem value="SECTION_SETTING_CHANGE">섹션 설정 변경</SelectItem>
                <SelectItem value="BOARD_CREATE">게시판 생성</SelectItem>
                <SelectItem value="BOARD_UPDATE">게시판 수정</SelectItem>
                <SelectItem value="BOARD_DELETE">게시판 삭제</SelectItem>
                <SelectItem value="POST_CREATE">게시글 작성</SelectItem>
                <SelectItem value="POST_ANSWER">관리자 답변</SelectItem>
                <SelectItem value="ERROR">오류 로그</SelectItem>
                  </SelectContent>
                </Select>

            <Select value={initialDateFilter} onValueChange={handleDateFilterChange}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="기간" />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="today">오늘</SelectItem>
                <SelectItem value="week">최근 7일</SelectItem>
                <SelectItem value="month">최근 30일</SelectItem>
                  </SelectContent>
                </Select>
              </div>

          <DataTable
            data={filteredLogs}
            columns={activityLogColumns}
            getRowId={(row) => row.id}
            emptyMessage="로그가 없습니다"
          />
          
          {totalPages > 1 && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
            </CardContent>
          </Card>
    </div>
  );
}
