import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Home, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccessUserApi } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { ProfileForm } from './@components/profile-form';

export const Route = createFileRoute('/_private/access-user/')({
  beforeLoad: () => {
    const { isAuthenticated } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/app-auth',
      });
    }
  },
  component: AccessUserPage,
  staticData: { title: 'Editar Perfil' },
});

function AccessUserPage() {
  const navigate = useNavigate();
  const { obliterateSelf } = useAccessUserApi();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDeleteAccount() {
    obliterateSelf.mutate(undefined, {
      onSuccess: () => navigate({ to: '/app-auth' }),
    });
  }

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardAction>
          <Button size={'sm'} variant={'destructive'} onClick={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" />
          </Button>
          <Button size={'sm'} onClick={() => navigate({ to: '/' })}>
            <Home className="size-4" />
          </Button>
          <UserAvatarMenu />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ProfileForm />
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Sua conta e todos os dados associados serão permanentemente excluídos e você perderá o acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={obliterateSelf.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant={'destructive'} disabled={obliterateSelf.isPending} onClick={handleDeleteAccount}>
              {obliterateSelf.isPending ? 'Excluindo...' : 'Excluir conta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
