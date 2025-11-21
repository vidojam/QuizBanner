import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12', 
    lg: 'h-28',
    xl: 'h-18'
  };

  return (
    <div className={`${sizeClasses[size]} aspect-square bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg ${className}`}>
      <span className={`font-bold text-white ${size === 'lg' ? 'text-5xl' : size === 'xl' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'}`}>
        QB
      </span>
    </div>
  );
};