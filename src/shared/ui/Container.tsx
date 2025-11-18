'use client';

import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`max-w-6xl mx-auto px-8 ${className}`}>
      {children}
    </div>
  );
}

