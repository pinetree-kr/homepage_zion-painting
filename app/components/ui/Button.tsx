import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick 
}: ButtonProps) {
  const baseStyles = 'px-8 py-3.5 rounded-full font-normal text-base leading-6 transition-colors';
  
  const variants = {
    primary: 'bg-[#1A2C6D] text-white hover:bg-[#15204f]',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
    outline: 'bg-transparent text-[#1A2C6D] border border-[#1A2C6D] hover:bg-[#1A2C6D] hover:text-white'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

