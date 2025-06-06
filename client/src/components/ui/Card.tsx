import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  compact?: boolean;
}

export function Card({ 
  children, 
  className, 
  hoverable = false, 
  compact = false, 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-card',
        hoverable && 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        compact ? 'p-3' : 'p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('mb-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ 
  children, 
  className, 
  as: Component = 'h3', 
  ...props 
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        'font-semibold text-gray-900 dark:text-white',
        Component === 'h1' && 'text-2xl',
        Component === 'h2' && 'text-xl',
        Component === 'h3' && 'text-lg',
        Component === 'h4' && 'text-base',
        Component === 'h5' && 'text-sm',
        Component === 'h6' && 'text-xs',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div
      className={cn('text-gray-700 dark:text-gray-300', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('mt-4 pt-3 border-t border-gray-100 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
}