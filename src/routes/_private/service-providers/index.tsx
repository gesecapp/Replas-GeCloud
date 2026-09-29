import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import DefaultLoading from '@/components/default-loading';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllSyncStatuses, useGetGuestsByParent } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { getUserPermissions } from '@/lib/permissions';
import { ServiceProviderList } from './@components/service-provider-list';

export const Route = createFileRoute('/_private/service-providers/')({
  beforeLoad: () => {
    const { isAuthenticated, userType } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/app-auth',
      });
    }

    if (!getUserPermissions(userType).canManageServiceProviders) {
      throw redirect({ to: '/' });
    }
  },
  component: ServiceProvidersPage,
  staticData: { title: 'Meus Prestadores' },
});

function ServiceProvidersPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: providers, isLoading } = useGetGuestsByParent('prestador_de_servico');
  const { data: syncStatuses } = useGetAllSyncStatuses();

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Meus Prestadores</CardTitle>
        <CardAction>
          <Button size={'sm'} onClick={() => navigate({ to: '/' })}>
            <Home className="size-4" />
          </Button>
          <UserAvatarMenu />
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <DefaultLoading />
        ) : (
          <ServiceProviderList
            guests={providers || []}
            syncStatuses={syncStatuses}
            onAdd={() => navigate({ to: '/service-providers/add' })}
            onEdit={(id) => navigate({ to: '/service-providers/add', search: { guestId: id } })}
          />
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
