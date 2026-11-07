import type { ReactNode, HTMLAttributes } from 'react';

type BadgeColor =
  | 'burgundy'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'red'
  | 'gray'
  | 'purple';

type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  size?: BadgeSize;
  children: ReactNode;
}

const colorClasses: Record<BadgeColor, string> = {
  burgundy: 'bg-burgundy-100 text-burgundy-800 ring-burgundy-200',
  green: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  blue: 'bg-blue-100 text-blue-800 ring-blue-200',
  yellow: 'bg-amber-100 text-amber-800 ring-amber-200',
  red: 'bg-red-100 text-red-800 ring-red-200',
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  purple: 'bg-purple-100 text-purple-800 ring-purple-200',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  color = 'gray',
  size = 'md',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ring-1 ring-inset
        ${colorClasses[color]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
