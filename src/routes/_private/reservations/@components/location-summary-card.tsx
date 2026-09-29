import { CalendarCheck, CircleAlert, CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { reservationTypeLabel } from '../@consts/reservation.consts';
import type { LocationSummary } from '../@interface/reservation.schema';

// Amplitude do funcionamento na semana — o card resume ("08:00 às 21:00") em vez de listar sete
// linhas; o detalhe por dia aparece no painel de disponibilidade, já filtrado pela data escolhida.
function hoursRange(hours: LocationSummary['operatingHours']): { start: string; end: string } | null {
  if (!hours || hours.length === 0) return null;
  let start = hours[0].startTime;
  let end = hours[0].endTime;
  for (const hour of hours) {
    if (hour.startTime < start) start = hour.startTime;
    if (hour.endTime > end) end = hour.endTime;
  }
  return { start, end };
}

function Line({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CircleCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <CircleAlert className="size-4 shrink-0 text-yellow-600 dark:text-yellow-400" />}
      <ItemDescription>{children}</ItemDescription>
    </div>
  );
}

export function LocationSummaryCard({ summary, isLoading }: LocationSummaryCardProps) {
  if (isLoading) {
    return (
      <Item variant="outline">
        <ItemContent className="flex-row items-center gap-2">
          <Spinner />
          <ItemDescription>Carregando resumo do local...</ItemDescription>
        </ItemContent>
      </Item>
    );
  }

  if (!summary) return null;

  const isAutomatic = summary.confirmationMode === 'automatic';
  const hours = hoursRange(summary.operatingHours);

  return (
    <Item variant="outline">
      <ItemContent className="gap-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <ItemTitle className="font-semibold text-base">{summary.name}</ItemTitle>
        </div>

        <ItemGroup className="gap-1.5">
          <Line ok={isAutomatic}>{isAutomatic ? 'Reserva automática' : 'Reserva moderada — depende de aprovação'}</Line>
          {summary.maxPeoplePerReservation != null && <Line ok>Até {summary.maxPeoplePerReservation} pessoas</Line>}
          {hours && (
            <Line ok>
              Funcionamento: {hours.start} às {hours.end}
            </Line>
          )}
          {!isAutomatic && <Line ok={false}>Prazo de aprovação: {summary.approvalWindowHours} horas</Line>}
        </ItemGroup>

        {summary.reservationTypes.length > 0 && (
          <ItemGroup className="gap-1.5">
            <ItemDescription>Tipos aceitos neste local</ItemDescription>
            <div className="flex flex-wrap gap-2">
              {summary.reservationTypes.map((type) => (
                <Badge key={type} variant="neutral">
                  {reservationTypeLabel(type)}
                </Badge>
              ))}
            </div>
          </ItemGroup>
        )}
      </ItemContent>
    </Item>
  );
}

interface LocationSummaryCardProps {
  summary: LocationSummary | null | undefined;
  isLoading: boolean;
}
