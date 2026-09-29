import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Home } from 'lucide-react';
import { toast } from 'sonner';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemActions } from '@/components/ui/item';
import { useAppAuth } from '@/hooks/use-app-auth';
import { getUserPermissions } from '@/lib/permissions';
import { ProfessionalForm, type ProfessionalFormSubmit } from '../@components/professional-form';
import { ReservationForm, type ReservationFormSubmit } from '../@components/reservation-form';
import { useReservationsApi } from '../@hooks/use-reservations-api';
import { reservationsSearchSchema } from '../@interface/reservation.schema';

export const Route = createFileRoute('/_private/reservations/add/')({
  validateSearch: reservationsSearchSchema,
  beforeLoad: () => {
    const { isAuthenticated, userType } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({ to: '/app-auth' });
    }

    if (!getUserPermissions(userType).canManageReservations) {
      throw redirect({ to: '/' });
    }
  },
  component: AddReservationPage,
  staticData: { title: 'Efetuar Reserva' },
});

// Uma reserva confirmada na hora e uma que ainda depende de aprovação são resultados diferentes;
// dizer só "reserva criada" faria o morador achar que já está garantida.
function successMessage(phase: string | undefined): string {
  if (phase === 'awaiting_confirmation') return 'Reserva solicitada! Aguarde a confirmação do titular.';
  if (phase === 'pending') return 'Reserva solicitada! Aguarde a aprovação da administração.';
  return 'Reserva confirmada!';
}

function AddReservationPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { createReservation, createProfessionalReservation } = useReservationsApi();

  const isProfessional = mode === 'profissional';

  function handleBack() {
    navigate({ to: '/reservations' });
  }

  // Os erros de reserva (400/404/409) já viram toast pelo QueryClient global — sem onError aqui,
  // para não duplicar a mensagem.
  function handleSubmitLocal(data: ReservationFormSubmit) {
    createReservation.mutate(data, {
      onSuccess: (reservation) => {
        toast.success(successMessage(reservation?.phase));
        handleBack();
      },
    });
  }

  function handleSubmitProfessional(data: ProfessionalFormSubmit) {
    createProfessionalReservation.mutate(data, {
      onSuccess: (reservation) => {
        toast.success(successMessage(reservation?.phase));
        handleBack();
      },
    });
  }

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Efetuar Reserva</CardTitle>
        <CardAction>
          <Button size={'sm'} onClick={handleBack}>
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
          <Button size={'sm'} onClick={() => navigate({ to: '/' })}>
            <Home className="size-4" />
          </Button>
          <UserAvatarMenu />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ItemActions className="justify-start gap-2">
          <Button variant={isProfessional ? 'outline' : 'default'} onClick={() => navigate({ to: '/reservations/add', search: { mode: 'local' } })}>
            Reservar um local
          </Button>
          <Button variant={isProfessional ? 'default' : 'outline'} onClick={() => navigate({ to: '/reservations/add', search: { mode: 'profissional' } })}>
            Reservar com profissional
          </Button>
        </ItemActions>

        {isProfessional ? (
          <ProfessionalForm onSubmit={handleSubmitProfessional} onCancel={handleBack} isLoading={createProfessionalReservation.isPending} />
        ) : (
          <ReservationForm onSubmit={handleSubmitLocal} onCancel={handleBack} isLoading={createReservation.isPending} />
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
