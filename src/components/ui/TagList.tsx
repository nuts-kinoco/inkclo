import React from 'react';

interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span 
          key={i} 
          className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200"
        >
          {tag.replace('color:', '')}
        </span>
      ))}
    </div>
  );
}
