'use client';

import React from 'react';
import { Category } from '@/types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="sticky top-0 z-30 py-3 glass-panel border-y border-white/10 backdrop-blur-md mb-6">
      <div className="max-w-4xl mx-auto px-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
            activeCategoryId === 'all'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 border border-orange-400/40 scale-105'
              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
          }`}
        >
          ✨ Todos os Pratos
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              activeCategoryId === cat.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 border border-orange-400/40 scale-105'
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
