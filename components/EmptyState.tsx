'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode | string;   // emoji string or a React element (e.g. a lucide icon)
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-2xl">
        {typeof icon === 'string' ? (
          <span>{icon}</span>
        ) : (
          icon
        )}
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors"
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}
