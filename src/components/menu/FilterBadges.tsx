'use client';

import React from 'react';
import { FilterTag } from '@/types';
import { FILTER_OPTIONS } from '@/lib/mock-data';

interface FilterBadgesProps {
  selectedFilters: FilterTag[];
  onToggleFilter: (filterId: FilterTag) => void;
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({
  selectedFilters,
  onToggleFilter,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-zinc-400 shrink-0 mr-1">Filtros:</span>
        {FILTER_OPTIONS.map((opt) => {
          const isSelected = selectedFilters.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onToggleFilter(opt.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
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
