import { useNavigate } from '@tanstack/react-router';
import { Cog, Home, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { StatusVariant } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetAppUser } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';

export function UserAvatarMenu({ badgeStatus }: UserAvatarMenuProps) {
  const { setMenuOpen } = useSidebarToggle();
  const { clearAuth } = useAppAuth();
  const navigate = useNavigate();
  const { data: user } = useGetAppUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLogout() {
    clearAuth();
    navigate({ to: '/app-auth' });
  }

  function handleGoHome() {
    navigate({ to: '/' });
  }

  const themeLabel = mounted
    ? theme === 'sunset'
      ? 'Sunset'
      : theme === 'ocean-blue'
        ? 'Ocean Blue'
        : theme === 'dark'
          ? 'Escuro'
          : theme === 'light'
            ? 'Claro'
            : 'Sistema'
    : 'Tema';

  return (
    <DropdownMenu onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset focus-visible:ring-ring">
          {badgeStatus && <StatusIndicator status={badgeStatus} className="absolute top-1 left-1" />}
          <Avatar className="size-10 cursor-pointer">
            <AvatarImage src={user?.url_image?.[0]} alt={user?.name} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs">Logado como</span>
            <span className="truncate font-medium">{user?.name || '—'}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleGoHome}>
          <Home className="size-4" />
          Início
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Cog className="size-4" />
            Tema: {themeLabel}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-accent font-medium' : ''}>
              <Cog className="size-4" />
              Sistema {theme === 'system' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-accent font-medium' : ''}>
              Claro {theme === 'light' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-accent font-medium' : ''}>
              Escuro {theme === 'dark' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('sunset')} className={theme === 'sunset' ? 'bg-accent font-medium' : ''}>
              Sunset {theme === 'sunset' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('ocean-blue')} className={theme === 'ocean-blue' ? 'bg-accent font-medium' : ''}>
              Ocean Blue {theme === 'ocean-blue' && '✓'}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
          <LogOut className="size-4 stroke-destructive" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface UserAvatarMenuProps {
  badgeStatus?: StatusVariant;
}
