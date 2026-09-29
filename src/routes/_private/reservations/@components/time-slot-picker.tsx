import { Clock } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '../@interface/reservation.schema';
import { isContiguous, splitIntoSlots, timeToMinutes } from '../@utils/reservation.utils';

// "Selecione o horário": blocos de 30 min sobre as faixas livres, escolhidos em dois toques
// (início, depois fim). É a versão touch do AvailabilitySlotPicker do painel — sem hover, que
// não existe no celular: o retorno visual vem do próprio estado selecionado.
export function TimeSlotPicker({ free, startTime, endTime, disabled, onChange }: TimeSlotPickerProps) {
  const slots = useMemo(() => splitIntoSlots(free), [free]);

  const selectedRange = useMemo(() => {
    if (!startTime || !endTime) return null;
    const from = slots.findIndex((s) => s.start === startTime);
    const to = slots.findIndex((s) => s.end === endTime);
    if (from < 0 || to < 0) return null;
    return { from: Math.min(from, to), to: Math.max(from, to) };
  }, [slots, startTime, endTime]);

  // Só o início escolhido: o próximo toque define o fim.
  const pendingStart = startTime && !endTime ? slots.findIndex((s) => s.start === startTime) : -1;

  function handleSelect(index: number) {
    if (disabled) return;

    if (pendingStart < 0) {
      onChange(slots[index].start, '');
      return;
    }

    const from = Math.min(pendingStart, index);
    const to = Math.max(pendingStart, index);

    // Intervalo com buraco no meio seria recusado pelo back-end como conflito — recomeça a
    // seleção no bloco tocado em vez de montar um horário inválido.
    if (!isContiguous(slots, from, to)) {
      onChange(slots[index].start, '');
      return;
    }

    onChange(slots[from].start, slots[to].end);
  }

  function isSelected(index: number): boolean {
    if (selectedRange) return index >= selectedRange.from && index <= selectedRange.to;
    return index === pendingStart;
  }

  if (slots.length === 0) {
    return (
      <ItemGroup className="gap-2">
        <ItemTitle className="font-semibold">Selecione o horário</ItemTitle>
        <ItemDescription>Nenhum horário disponível para esta data.</ItemDescription>
      </ItemGroup>
    );
  }

  return (
    <ItemGroup className="gap-3">
      <ItemTitle className="font-semibold">Selecione o horário</ItemTitle>

      {pendingStart >= 0 && <ItemDescription>Toque no último bloco desejado para definir o fim.</ItemDescription>}

      <div className="flex flex-wrap gap-2">
        {slots.map((slot, index) => (
          <Button
            key={`${slot.start}-${slot.end}`}
            type="button"
            size="sm"
            variant={isSelected(index) ? 'default' : 'outline'}
            disabled={disabled}
            onClick={() => handleSelect(index)}
            className={cn('font-mono tabular-nums')}
          >
            <Clock className="size-3" />
            {slot.start}
          </Button>
        ))}
      </div>

      {startTime && endTime && (
        <ItemDescription>
          Selecionado: <strong>{startTime}</strong> até <strong>{endTime}</strong> ({(timeToMinutes(endTime) - timeToMinutes(startTime)) / 60}h)
        </ItemDescription>
      )}
    </ItemGroup>
  );
}

interface TimeSlotPickerProps {
  free: TimeSlot[];
  startTime: string;
  endTime: string;
  disabled?: boolean;
  onChange: (startTime: string, endTime: string) => void;
}
