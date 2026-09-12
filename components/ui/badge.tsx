import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300',
        secondary:
          'border-transparent bg-secondary-50 text-secondary-700 dark:bg-slate-800 dark:text-secondary-300',
        spark:
          'border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
        outline: 'text-foreground border-slate-300 dark:border-slate-700',
        destructive:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

