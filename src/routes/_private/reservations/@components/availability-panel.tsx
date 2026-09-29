import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import type { AvailabilityResponse } from '../@interface/reservation.schema';
import { toDisplayDate } from '../@utils/reservation.utils';

// "Informações importantes": o mesmo trio de blocos do painel (gesec-webclient
// AvailabilityDisplay), com as cores mapeadas nas variantes do Badge — que já vêm resolvidas
// para tema claro e escuro, então não há cor solta no JSX.
export function AvailabilityPanel({ availability, isLoading, date }: AvailabilityPanelProps) {
  if (isLoading) {
    return (
      <Item variant="outline">
        <ItemContent className="flex-row items-center gap-2">
          <Spinner />
          <ItemDescription>Carregando disponibilidade...</ItemDescription>
        </ItemContent>
      </Item>
    );
  }

  if (!availability) {
    return (
      <Item variant="outline">
        <ItemContent>
          <ItemDescription>Selecione um local e uma data para ver os horários.</ItemDescription>
        </ItemContent>
      </Item>
    );
  }

  return (
    <Item variant="outline">
      <ItemContent className="gap-4">
        <ItemTitle className="font-semibold text-base">Informações importantes</ItemTitle>

        <ItemGroup className="gap-1">
          <ItemDescription>Horário de funcionamento do local</ItemDescription>
          {availability.operatingHours.length === 0 ? (
            <ItemDescription>Não definido</ItemDescription>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availability.operatingHours.map((slot) => (
                <Badge key={`op-${slot.start}-${slot.end}`} variant="info">
                  {slot.start} – {slot.end}
                </Badge>
              ))}
            </div>
          )}
        </ItemGroup>

        {availability.professionalSchedules && availability.professionalSchedules.length > 0 && (
          <ItemGroup className="gap-1">
            <ItemDescription>Horário em que o profissional atende</ItemDescription>
            <div className="flex flex-wrap gap-2">
              {availability.professionalSchedules.map((slot) => (
                <Badge key={`prof-${slot.start}-${slot.end}`} variant="info">
                  {slot.start} – {slot.end}
                </Badge>
              ))}
            </div>
          </ItemGroup>
        )}

        <ItemGroup className="gap-1">
          <ItemDescription>Reservas em andamento no local {date ? `em ${toDisplayDate(date)}` : 'para o dia selecionado'}</ItemDescription>
          {availability.occupied.length === 0 ? (
            <ItemDescription>Nenhuma reserva para o dia selecionado.</ItemDescription>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availability.occupied.map((slot) => (
                <Badge key={`busy-${slot.source}-${slot.start}-${slot.end}`} variant="error">
                  {slot.start} – {slot.end}
                </Badge>
              ))}
            </div>
          )}
        </ItemGroup>

        <ItemGroup className="gap-1">
          <ItemDescription>Horários livres no dia da reserva</ItemDescription>
          {availability.professionalUnavailable ? (
            <ItemDescription>
              O profissional marcou indisponibilidade nesta data
              {availability.unavailabilityReason ? ` (${availability.unavailabilityReason})` : ''}.
            </ItemDescription>
          ) : availability.free.length === 0 ? (
            <ItemDescription>Nenhum horário livre neste dia.</ItemDescription>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availability.free.map((slot) => (
                <Badge key={`free-${slot.start}-${slot.end}`} variant="success">
                  {slot.start} – {slot.end}
                </Badge>
              ))}
            </div>
          )}
        </ItemGroup>
      </ItemContent>
    </Item>
  );
}

interface AvailabilityPanelProps {
  availability: AvailabilityResponse | null | undefined;
  isLoading: boolean;
  date?: string;
}
