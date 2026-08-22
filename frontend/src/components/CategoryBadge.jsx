import React from 'react';
import { Utensils, Building2, Camera, Music, Truck, Sparkles, Tag } from 'lucide-react';

export const CategoryBadge = ({ category, showIcon = true, size = 'sm' }) => {
  const cat = (category || '').toLowerCase();

  let bg = 'bg-stone-100';
  let text = 'text-ink-secondary';
  let border = 'border-stone-200';
  let Icon = Tag;

  if (cat.includes('cater') || cat.includes('food') || cat.includes('beverage')) {
    bg = 'bg-sticker-orange-bg';
    text = 'text-sticker-orange';
    border = 'border-sticker-orange/20';
    Icon = Utensils;
  } else if (cat.includes('venue') || cat.includes('hall') || cat.includes('space')) {
    bg = 'bg-sticker-purple-bg';
    text = 'text-[#7c3aed]';
    border = 'border-sticker-purple/30';
    Icon = Building2;
  } else if (cat.includes('photo') || cat.includes('video') || cat.includes('decor') || cat.includes('flower')) {
    bg = 'bg-sticker-pink-bg';
    text = 'text-[#db2777]';
    border = 'border-sticker-pink/20';
    Icon = Camera;
  } else if (cat.includes('music') || cat.includes('sound') || cat.includes('dj') || cat.includes('av') || cat.includes('audio')) {
    bg = 'bg-sticker-sky-bg';
    text = 'text-[#0284c7]';
    border = 'border-sticker-sky/30';
    Icon = Music;
  } else if (cat.includes('transport') || cat.includes('logistic') || cat.includes('staff')) {
    bg = 'bg-sticker-teal-bg';
    text = 'text-sticker-teal';
    border = 'border-sticker-teal/20';
    Icon = Truck;
  } else {
    bg = 'bg-stone-100';
    text = 'text-ink-muted';
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
