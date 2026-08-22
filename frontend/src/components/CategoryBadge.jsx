import React from 'react';
import { Utensils, Building2, Camera, Music, Truck, Sparkles, Tag } from 'lucide-react';

export const CategoryBadge = ({ category, showIcon = true, size = 'sm' }) => {
  const cat = (category || '').toLowerCase();

  let bg = 'bg-stone-100';
  let text = 'text-stone-700';
  let border = 'border-stone-200';
  let Icon = Tag;

  if (cat.includes('cater') || cat.includes('food') || cat.includes('beverage')) {
    bg = 'bg-[#fef3eb]';
    text = 'text-[#dd5b00]';
    border = 'border-[#dd5b00]/25';
    Icon = Utensils;
  } else if (cat.includes('venue') || cat.includes('hall') || cat.includes('space')) {
    bg = 'bg-[#f8f2fe]';
    text = 'text-[#7c3aed]';
    border = 'border-[#d6b6f6]/40';
    Icon = Building2;
  } else if (cat.includes('photo') || cat.includes('video') || cat.includes('decor') || cat.includes('flower')) {
    bg = 'bg-[#fdf0f9]';
    text = 'text-[#db2777]';
    border = 'border-[#ff64c8]/30';
    Icon = Camera;
  } else if (cat.includes('music') || cat.includes('sound') || cat.includes('dj') || cat.includes('av') || cat.includes('audio')) {
    bg = 'bg-[#eef6fd]';
    text = 'text-[#0284c7]';
    border = 'border-[#62aef0]/40';
    Icon = Music;
  } else if (cat.includes('transport') || cat.includes('logistic') || cat.includes('staff')) {
    bg = 'bg-[#edf8f8]';
    text = 'text-[#0d9488]';
    border = 'border-[#2a9d99]/30';
    Icon = Truck;
  } else {
    bg = 'bg-stone-100';
    text = 'text-stone-600';
    border = 'border-stone-200';
    Icon = Sparkles;
  }

  const isSmall = size === 'sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full capitalize transition-colors ${bg} ${text} ${border} ${
      isSmall ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
    }`}>
      {showIcon && <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
