import type { ReactNode, HTMLAttributes } from 'react';

/* ─── Card Root ─── */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: boolean;
}

export function Card({
  children,
  hover = false,
  padding = true,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-200 shadow-sm
        ${hover ? 'transition-shadow duration-200 hover:shadow-md' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Card Header ─── */

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={`pb-4 border-b border-slate-100 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Card Body ─── */

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={`py-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

/* ─── Card Footer ─── */

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div
      className={`pt-4 border-t border-slate-100 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
