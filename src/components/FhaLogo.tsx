import React from 'react';

interface FhaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export function FhaLogo({ className = '', size = '100%' }: FhaLogoProps) {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;
  
  return (
    <img
      src="https://fha.gov.ng/themes/fha/assets/images/fha-logo.png"
      alt="Federal Housing Authority Logo"
      className={`object-contain select-none max-w-full max-h-full ${className}`}
      style={{ width: sizeStyle, height: sizeStyle }}
      referrerPolicy="no-referrer"
    />
  );
}
