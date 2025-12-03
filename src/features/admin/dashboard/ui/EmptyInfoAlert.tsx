'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/src/shared/ui';
import { EmptyInfo } from '@/src/entities/dashboard';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EmptyInfoAlertProps {
  emptyInfo: EmptyInfo[];
}

const getInfoTypeLabel = (type: EmptyInfo['type']) => {
  switch (type) {
    case 'company':
      return '회사 정보';
    case 'business':
      return '사업 정보';
    case 'contact':
      return '연락처 정보';
    default:
      return '정보';
  }
};

const getInfoTypeLink = (type: EmptyInfo['type'], field: string) => {
  if (type === 'company') {
    if (field === 'introduction' || field === 'vision' || field === 'greetings' || field === 'mission' || field === 'strengths' || field === 'values') {
      return '/admin/sections/company';
    } else if (field === 'histories') {
      return '/admin/sections/company/history';
    } else if (field === 'organization_members') {
      return '/admin/sections/company/organization';
    } else {
      return '/admin/sections/company';
    }
  } else if (type === 'business') {
    return '/admin/sections/business';
  } else if (type === 'contact') {
    return '/admin/sections/contacts';
  }
  return '/admin';
};

export default function EmptyInfoAlert({ emptyInfo }: EmptyInfoAlertProps) {
  if (emptyInfo.length === 0) {
    return null;
  }

  // 타입별로 그룹화
  const groupedByType = emptyInfo.reduce((acc, info) => {
    if (!acc[info.type]) {
      acc[info.type] = [];
    }
    acc[info.type].push(info);
    return acc;
  }, {} as Record<EmptyInfo['type'], EmptyInfo[]>);

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg font-semibold text-amber-900">
            입력이 필요한 정보
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedByType).map(([type, infos]) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-amber-900">
                  {getInfoTypeLabel(type as EmptyInfo['type'])}
                </h4>
                <Link href={getInfoTypeLink(type as EmptyInfo['type'], infos[0].field)}>
                  <Button variant="outline" size="sm" className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-100">
                    수정하기
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {infos.map((info, index) => (
                  <Badge
                    key={`${info.type}-${info.field}-${index}`}
                    variant="outline"
                    className="text-xs bg-white border-amber-300 text-amber-700"
                  >
                    {info.label}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

