'use client';

import { ChevronDown, Download } from 'lucide-react';

export type SortOption = 'views' | 'engagement' | 'trending' | 'date';
export type FilterOption = 'all' | 'month' | 'week';

interface FilterBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  filter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  onExport: () => void;
}

export default function FilterBar({
  sort,
  onSortChange,
  filter,
  onFilterChange,
  onExport,
}: FilterBarProps) {
  const filters: { label: string; value: FilterOption }[] = [
    { label: 'All Time', value: 'all' },
    { label: 'This Month', value: 'month' },
    { label: 'This Week', value: 'week' },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === f.value
                ? 'bg-[#1A1A1A] text-white shadow-sm border border-white/5'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none w-full sm:w-auto bg-[#0A0A0A] border border-white/10 text-white py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            <option value="views">Sort by Views</option>
            <option value="engagement">Sort by Engagement</option>
            <option value="trending">Sort by Trending</option>
            <option value="date">Sort by Date</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>
  );
}
