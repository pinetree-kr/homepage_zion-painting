'use client';

import { Card } from '@/src/shared/ui';

interface SkeletonSectionProps {
  title?: string;
  height?: string;
}

export function SkeletonSection({ title, height = 'h-64' }: SkeletonSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        {title && (
          <div className="mb-4">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        )}
        <div className={`${height} bg-gray-100 rounded animate-pulse`} />
      </Card>
      <div className="flex justify-end">
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonStrengthsSection() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 310px))' }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="h-48 bg-gray-100 rounded animate-pulse" />
            </Card>
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonValuesSection() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

