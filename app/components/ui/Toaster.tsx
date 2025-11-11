'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#1A2C6D',
          border: '1px solid #e5e7eb',
        },
      }}
    />
  );
}

