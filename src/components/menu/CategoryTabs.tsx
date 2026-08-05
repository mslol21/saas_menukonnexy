'use client';

import React from 'react';
import { Category } from '@/types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  primaryColor?: string;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  primaryColor = '#B8860B',
}) => {
  return (
    <div className="sticky top-0 z-30 py-3 glass-panel border-y border-white/10 backdrop-blur-md mb-6">
      <div className="max-w-4xl mx-auto px-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => onSelectCategory('all')}
          style={activeCategoryId === 'all' ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
            activeCategoryId === 'all'
              ? 'text-white shadow-lg scale-105 border font-black'
              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
          }`}
        >
          ✨ Todos os Pratos
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={activeCategoryId === cat.id ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              activeCategoryId === cat.id
                ? 'text-white shadow-lg scale-105 border font-black'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};
