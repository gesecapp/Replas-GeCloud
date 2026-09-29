import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, DoorOpen, Menu } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { FontSizeSwitcher } from '@/components/nav-actions/font-size-switcher';
import { ThemeSwitcher } from '@/components/nav-actions/switch-theme';
import { Button } from '@/components/ui/button';
import { ItemTitle } from '@/components/ui/item';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TreeProvider, TreeView } from '@/components/ui/tree';
import { buildNavRoutes } from '@/config/routes';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useUserPermissions } from '@/hooks/use-user-permissions';
import { renderTreeNodes } from './tree-nodes';

export function TreeNavigation({ hideMenu = false, showLogout = false }: TreeNavigationProps) {
  const navigate = useNavigate();
  const { clearAuth } = useAppAuth();
  const { userType } = useUserPermissions();
  const [open, setOpen] = useState(false);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate({ to: path });
      setOpen(false);
    },
    [navigate],
  );

  function handleBack() {
    window.history.back();
  }

  function handleLogout() {
    clearAuth();
    navigate({ to: '/app-auth' });
  }

  const treeNodes = useMemo(() => renderTreeNodes(buildNavRoutes(userType), handleNavigate), [handleNavigate, userType]);

  return (
    <div className="flex w-full gap-2 bg-card pb-4">
      {showLogout ? (
        <Button variant="ghost" onClick={handleLogout} className="h-12">
          <DoorOpen className="size-4" />
          Sair
        </Button>
      ) : (
        <Button variant="ghost" onClick={handleBack} className="h-12">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      )}
      <ThemeSwitcher variant="ghost" size="default" />
      <FontSizeSwitcher variant="ghost" size="default" />

      {!hideMenu && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="h-12 flex-1">
              <Menu className="size-4" />
              <ItemTitle className="text-lg">Menu</ItemTitle>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="flex max-h-[85vh] flex-col rounded-t-xl p-0 sm:max-w-none">
            <SheetHeader className="border-b px-4 py-3 text-left">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-2 py-4 pb-8">
              <TreeProvider animateExpand>
                <TreeView>{treeNodes}</TreeView>
              </TreeProvider>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

type TreeNavigationProps = {
  hideMenu?: boolean;
  showLogout?: boolean;
};
