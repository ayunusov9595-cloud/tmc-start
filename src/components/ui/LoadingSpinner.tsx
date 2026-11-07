import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`.trim()}
      role="status"
      aria-label={text ?? 'Yuklanmoqda'}
    >
      <Loader2
        className={`animate-spin text-burgundy-600 ${sizeClasses[size]}`}
      />
      {text && <p className="text-sm text-slate-500">{text}</p>}
      <span className="sr-only">{text ?? 'Yuklanmoqda...'}</span>
    </div>
  );
}
