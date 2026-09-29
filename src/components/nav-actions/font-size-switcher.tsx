import { AArrowDown, AArrowUp, ALargeSmall } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFontSize } from '@/hooks/use-font-size';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';

type FontSizeSwitcherProps = Pick<ComponentProps<typeof Button>, 'variant' | 'size'>;

export function FontSizeSwitcher({ variant = 'ghost', size = 'icon' }: FontSizeSwitcherProps) {
  const { setMenuOpen } = useSidebarToggle();
  const { fontSize, increase, decrease } = useFontSize();

  return (
    <DropdownMenu onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant}>
          <ALargeSmall />
          <span className="sr-only">Tamanho da fonte</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={increase} disabled={fontSize >= 20}>
          <AArrowUp />
          Aumentar fonte
        </DropdownMenuItem>
        <DropdownMenuItem onClick={decrease} disabled={fontSize <= 10}>
          <AArrowDown />
          Diminuir fonte
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
