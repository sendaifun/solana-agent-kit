import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ className = '', children }) => {
  return (
    <div className={`relative inline-block rounded-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface AvatarImageProps {
  src: string;
  alt: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt }) => {
  return (
    <div className="h-full w-full relative">
      <Image 
        src={src} 
        alt={alt} 
        fill 
        sizes="100%" 
        className="object-cover" 
        priority
      />
    </div>
  );
};

interface AvatarFallbackProps {
  children: React.ReactNode;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children }) => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium">
      {children}
    </div>
  );
}; 