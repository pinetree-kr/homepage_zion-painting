'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui';
import type { LucideIcon } from 'lucide-react';

// 주요 lucide-react 아이콘 목록 (존재하는 아이콘만)
const ICON_NAMES = [
  'Award', 'Briefcase', 'Building', 'Building2', 'CheckCircle', 'Clock', 'Code', 'DollarSign',
  'Heart', 'Lightbulb', 'Rocket', 'Shield', 'Star', 'Target', 'TrendingUp', 'Users', 'Zap',
  'Activity', 'Airplay', 'AlertCircle', 'AlertTriangle', 'Archive', 'ArrowRight', 'ArrowUp',
  'BarChart', 'Bell', 'Book', 'BadgeCheck', 'Box', 'Calendar', 'Camera', 'Check', 'ChevronRight',
  'Circle', 'Cloud', 'Coffee', 'Command', 'Compass', 'Copy', 'CreditCard', 'Crown', 'Database',
  'Download', 'Edit', 'Eye', 'File', 'FileText', 'Filter', 'Flag', 'Folder', 'Gift', 'Globe',
  'Grid', 'HardDrive', 'Home', 'Image', 'Info', 'Key', 'Layers', 'Link', 'Lock', 'Mail',
  'Map', 'Menu', 'MessageSquare', 'Mic', 'Minus', 'Monitor', 'Moon', 'MoreHorizontal',
  'Music', 'Package', 'Paperclip', 'Pause', 'Phone', 'Play', 'Plus', 'Power', 'Printer',
  'RefreshCw', 'Save', 'Search', 'Settings', 'Share', 'ShoppingBag', 'ShoppingCart', 'Smile',
  'Sun', 'Tag', 'ThumbsUp', 'Wrench', 'Trash', 'Truck', 'Upload', 'User', 'Video', 'Wifi',
].filter(iconName => iconName in LucideIcons) as string[];

interface IconSelectorProps {
  className?: string;
  value: string;
  onChange: (iconName: string) => void;
}

export function IconSelector({ className, value, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = ICON_NAMES.filter(iconName =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const IconComponent = value && ICON_NAMES.includes(value) && value in LucideIcons
    ? (LucideIcons[value as keyof typeof LucideIcons] as LucideIcon)
    : null;

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={className}>
      <Label>아이콘</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          {IconComponent ? (
            <>
              <IconComponent className="h-4 w-4" />
              {/* <span>{value}</span> */}
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>선택</span>
            </>
          )}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="z-999 max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>아이콘 선택</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="아이콘 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div
              className="flex-1 overflow-y-auto max-h-[500px] border border-gray-200 rounded-lg p-4 min-h-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
            >
              <div className="grid grid-cols-4 gap-4">
                {filteredIcons.map((iconName) => {
                  if (!(iconName in LucideIcons)) return null;
                  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
                  if (!Icon) return null;

                  return (
                    <button
                      key={iconName}
                      onClick={() => handleSelectIcon(iconName)}
                      className={`flex flex-col items-center justify-center gap-1 md:gap-3 p-2 py-3 md:p-3 md:py-4 rounded-lg border-2 transition-colors w-full ${value === iconName
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      title={iconName}
                    >
                      <Icon className="h-6 w-6 md:h-7 md:w-7" />
                      <span className="text-xs md:text-sm text-gray-600 truncate w-full text-center font-medium">
                        {iconName}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filteredIcons.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

