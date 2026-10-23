'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon = null,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center mb-4 text-zinc-400">
        {icon}
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
