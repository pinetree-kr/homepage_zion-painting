'use client';

import * as React from 'react';
import { cn } from './utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'resize-none border border-gray-300 placeholder:text-gray-400 flex min-h-16 w-full rounded-md bg-white px-3 py-2 text-base transition-colors outline-none focus:ring-2 focus:ring-[#1A2C6D] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

