import type * as React from 'react';
import { cn } from '@/lib/utils';

function Input({
  className,
  type,
  size = 'default',
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & {
  size?: 'sm' | 'default';
}) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        'flex w-full min-w-0 cursor-text items-center gap-2 whitespace-nowrap rounded-md font-medium font-mono text-sm leading-none outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'border-input/50 border-b-2 bg-background ring-1 ring-zinc-300 hover:bg-secondary dark:border-input dark:ring-input',
        'px-4 py-2 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
        'data-[size=default]:h-11 data-[size=sm]:h-8 data-[size=sm]:px-2',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
