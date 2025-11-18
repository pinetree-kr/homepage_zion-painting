'use client';

import { cn } from '@/src/shared/ui/utils';
import type { User } from '@/src/entities/user';

interface UserButtonProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export default function UserButton({ user, size = 'md', className, onClick }: UserButtonProps) {
  if (!user) {
    return null;
  }

  const displayChar = user.name?.charAt(0) || 'U';

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-b from-[#1A2C6D] to-[#2CA7DB] flex items-center justify-center text-white font-medium',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={user.name || '사용자'}
    >
      {displayChar}
    </div>
  );
}

