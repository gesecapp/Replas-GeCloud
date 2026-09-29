import { Badge } from '@/components/ui/badge';
import { phaseLabel, RESERVATION_PHASE_VARIANTS } from '../@consts/reservation.consts';

// A tela lê `phase` (derivada no back-end), nunca `status`: é ela que desdobra `confirmed` em
// agendada / em andamento / concluída, que é a distinção que importa para o morador.
export function ReservationStatusBadge({ phase }: { phase: string }) {
  return <Badge variant={RESERVATION_PHASE_VARIANTS[phase] ?? 'neutral'}>{phaseLabel(phase)}</Badge>;
}
