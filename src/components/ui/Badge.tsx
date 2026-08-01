import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'outline' | 'danger' | 'warning';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-all';
  
  const variants = {
    primary: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    secondary: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    accent: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    outline: 'bg-transparent text-zinc-300 border border-zinc-700',
  };

  return (
    <span className={clsx(baseStyle, variants[variant], className)}>
      {children}
    </span>
  );
};
