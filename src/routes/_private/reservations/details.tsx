import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Home } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
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
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { useAppAuth } from '@/hooks/use-app-auth';
import { getUserPermissions } from '@/lib/permissions';
import { ReservationStatusBadge } from './@components/reservation-status-badge';
import { CANCELABLE_PHASES, reservationTypeLabel } from './@consts/reservation.consts';
import { useGetReservation, useReservationsApi } from './@hooks/use-reservations-api';
import { reservationDetailsSearchSchema } from './@interface/reservation.schema';
import { toDisplayDate } from './@utils/reservation.utils';

export const Route = createFileRoute('/_private/reservations/details')({
  validateSearch: reservationDetailsSearchSchema,
  beforeLoad: () => {
    const { isAuthenticated, userType } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({ to: '/app-auth' });
    }

    if (!getUserPermissions(userType).canManageReservations) {
      throw redirect({ to: '/' });
    }
  },
  component: ReservationDetailsPage,
  staticData: { title: 'Detalhe da Reserva' },
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <ItemGroup className="gap-0.5">
      <ItemDescription className="font-medium text-xs uppercase">{label}</ItemDescription>
      <ItemTitle className="font-normal">{value}</ItemTitle>
    </ItemGroup>
  );
}

function ReservationDetailsPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { userId } = useAppAuth();
  const { data: reservation, isLoading } = useGetReservation(id);
  const { cancelReservation, acceptReservation, refuseReservation } = useReservationsApi();
  const [showCancel, setShowCancel] = useState(false);

  function handleBack() {
    navigate({ to: '/reservations' });
  }

  if (isLoading) {
    return (
      <Card className="min-h-screen rounded-none border-none">
        <CardContent>
          <DefaultLoading />
        </CardContent>
      </Card>
    );
  }

  // O titular é quem age sobre a reserva. Numa aula o titular é o profissional, então o morador
  // que solicitou enxerga o detalhe mas não vê botão nenhum — é o mesmo escopo que o back-end
  // aplica (leitura para participante, ação só para titular).
  const isOwner = !!reservation && !!userId && String(reservation.ownerId) === userId;
  const canAccept = isOwner && reservation?.phase === 'awaiting_confirmation';
  const canCancel = isOwner && CANCELABLE_PHASES.includes(reservation?.phase ?? '');

  return (
    <>
      <Card className="min-h-screen rounded-none border-none">
        <CardHeader>
          <CardTitle>Detalhe da Reserva</CardTitle>
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
          {!reservation ? (
            <ItemDescription>Reserva não encontrada.</ItemDescription>
          ) : (
            <ItemGroup className="gap-6">
              <Item variant="outline">
                <ItemContent className="gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <ItemTitle className="font-semibold text-base">{reservation.location?.name ?? 'Local'}</ItemTitle>
                    <ReservationStatusBadge phase={reservation.phase} />
                  </div>

                  <Field label="Tipo" value={reservationTypeLabel(reservation.reservationType)} />
                  <Field label="Data" value={toDisplayDate(reservation.date)} />
                  <Field label="Horário" value={`${reservation.startTime} até ${reservation.endTime}`} />
                  <Field label="Titular" value={reservation.owner?.name ?? '-'} />
                  {reservation.participants && reservation.participants.length > 0 && (
                    <Field label={`Participantes (${reservation.participants.length})`} value={reservation.participants.map((p) => p.name).join(', ')} />
                  )}
                  {reservation.quantityPeople != null && <Field label="Pessoas estimadas" value={String(reservation.quantityPeople)} />}
                  {reservation.notes && <Field label="Observações" value={reservation.notes} />}
                </ItemContent>
              </Item>

              {reservation.phase === 'awaiting_confirmation' && !isOwner && (
                <ItemDescription>Aguardando a confirmação do titular. Você será avisado quando ela for confirmada.</ItemDescription>
              )}

              {(canAccept || canCancel) && (
                <ItemActions className="justify-end gap-2">
                  {canAccept && (
                    <>
                      <Button
                        variant="outline"
                        disabled={refuseReservation.isPending}
                        onClick={() =>
                          refuseReservation.mutate(reservation.id, {
                            onSuccess: () => toast.success('Reserva recusada.'),
                          })
                        }
                      >
                        Recusar
                      </Button>
                      <Button
                        disabled={acceptReservation.isPending}
                        onClick={() =>
                          acceptReservation.mutate(reservation.id, {
                            onSuccess: () => toast.success('Reserva confirmada!'),
                          })
                        }
                      >
                        Confirmar
                      </Button>
                    </>
                  )}
                  {canCancel && (
                    <Button variant="outline" onClick={() => setShowCancel(true)}>
                      Cancelar reserva
                    </Button>
                  )}
                </ItemActions>
              )}
            </ItemGroup>
          )}
        </CardContent>

        <CardFooter>
          <TreeNavigation />
        </CardFooter>
      </Card>

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja cancelar esta reserva? Dependendo do prazo do local, pode haver cobrança de multa.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!reservation) return;
                cancelReservation.mutate(reservation.id, {
                  onSuccess: () => {
                    toast.success('Reserva cancelada.');
                    setShowCancel(false);
                    handleBack();
                  },
                  onError: () => setShowCancel(false),
                });
              }}
            >
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
