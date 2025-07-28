
import React from 'react';

interface NexoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NexoLogo = ({ size = 'md', className = '' }: NexoLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Simple Diamond Logo */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 transform rotate-45 rounded-sm shadow-lg shadow-primary/20"></div>
      </div>
      
      {/* Logo Text */}
      <div className={`${textSizeClasses[size]} font-bold tracking-tight`}>
        <span className="text-primary">N</span>
        <span className="text-foreground">E</span>
        <span className="text-primary">X</span>
        <span className="text-foreground">O</span>
      </div>
    </div>
  );
};
