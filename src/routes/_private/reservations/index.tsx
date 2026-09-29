import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import DefaultLoading from '@/components/default-loading';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppAuth } from '@/hooks/use-app-auth';
import { getUserPermissions } from '@/lib/permissions';
import { ReservationList } from './@components/reservation-list';
import { useGetReservations } from './@hooks/use-reservations-api';

export const Route = createFileRoute('/_private/reservations/')({
  beforeLoad: () => {
    const { isAuthenticated, userType } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({ to: '/app-auth' });
    }

    if (!getUserPermissions(userType).canManageReservations) {
      throw redirect({ to: '/' });
    }
  },
  component: ReservationsPage,
  staticData: { title: 'Reservas de Locais' },
});

function ReservationsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: reservations, isLoading } = useGetReservations();

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Reservas de Locais</CardTitle>
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
          <ReservationList
            reservations={reservations || []}
            onAdd={() => navigate({ to: '/reservations/add' })}
            onOpen={(id) => navigate({ to: '/reservations/details', search: { id } })}
          />
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
