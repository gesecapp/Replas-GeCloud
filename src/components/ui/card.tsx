import type * as React from 'react';
import { usePlatform } from '@/hooks/use-platform';
import { cn } from '@/lib/utils';

const platformPt: Record<ReturnType<typeof usePlatform>, string> = {
  ios: 'pt-12',
  android: 'pt-8',
  other: 'pt-6',
};

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  const platform = usePlatform();
  return (
    <div
      data-slot="card"
      className={cn('mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 pb-20 text-card-foreground md:max-w-6xl', platformPt[platform], className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('@container/card-header flex w-full auto-rows-min items-center justify-between gap-2 px-4 max-sm:mt-6 md:px-6 [.border-b]:pb-6', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('font-medium font-mono text-2xl leading-none', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-action" className={cn('col-start-2 row-span-2 row-start-1 flex items-center gap-3 self-center justify-self-end', className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('@container flex w-full flex-col gap-10 px-4 py-4 md:px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('fixed bottom-0 left-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 items-center px-4 md:max-w-6xl md:px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
