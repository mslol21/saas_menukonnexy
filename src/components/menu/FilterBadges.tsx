'use client';

import React from 'react';
import { FilterTag } from '@/types';
import { FILTER_OPTIONS } from '@/lib/mock-data';

interface FilterBadgesProps {
  selectedFilters: FilterTag[];
  onToggleFilter: (filterId: FilterTag) => void;
  isLight?: boolean;
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({
  selectedFilters,
  onToggleFilter,
  isLight = false,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className={`text-xs font-semibold shrink-0 mr-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Filtros:</span>
        {FILTER_OPTIONS.map((opt) => {
          const isSelected = selectedFilters.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onToggleFilter(opt.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-amber-500 text-zinc-950 font-extrabold border-amber-400 shadow-md'
                  : isLight
                  ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 shadow-xs'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
