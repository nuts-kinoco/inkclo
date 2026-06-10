import React from 'react';

interface ColorChipProps {
  color: string;
  className?: string;
}

export function ColorChip({ color, className = '' }: ColorChipProps) {
  return (
    <div 
      className={`w-6 h-6 rounded border border-gray-200 shadow-sm ${className}`}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}
