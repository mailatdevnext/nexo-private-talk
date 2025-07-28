
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
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse"></div>
        
        {/* Inner geometric shape */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Connected nodes pattern */}
          <div className="absolute w-2 h-2 bg-primary rounded-full top-2 left-2"></div>
          <div className="absolute w-2 h-2 bg-primary rounded-full top-2 right-2"></div>
          <div className="absolute w-2 h-2 bg-primary rounded-full bottom-2 left-2"></div>
          <div className="absolute w-2 h-2 bg-primary rounded-full bottom-2 right-2"></div>
          
          {/* Connecting lines */}
          <div className="absolute w-0.5 h-6 bg-primary/60 transform rotate-45 origin-center"></div>
          <div className="absolute w-0.5 h-6 bg-primary/60 transform -rotate-45 origin-center"></div>
          
          {/* Central core */}
          <div className="w-3 h-3 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg shadow-primary/20"></div>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-sm"></div>
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
