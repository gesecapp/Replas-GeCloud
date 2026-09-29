import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { OperatingHour } from '../@interface/reservation.schema';
import { fromIsoDate, openWeekdays, toDisplayDate, toIsoDate, weekdayOf } from '../@utils/reservation.utils';

// Calendário em popover, e não input mascarado como no resto do app, porque aqui o campo precisa
// DESABILITAR datas: passado e dias em que o local não abre. Deixar o morador digitar uma data
// impossível só para receber um 409 depois é pior do que não oferecê-la.
export function DateField({ value, operatingHours, disabled, onChange }: DateFieldProps) {
  // Popover controlado só para fechar ao escolher a data: aberto, o calendário cobre os campos
  // seguintes do formulário, e num viewport de celular isso esconde metade da tela.
  const [open, setOpen] = useState(false);
  const selected = fromIsoDate(value);
  const openDays = openWeekdays(operatingHours);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isDisabled(date: Date): boolean {
    if (date < today) return true;
    // Sem horário de funcionamento cadastrado, não há dia válido — o back-end recusaria tudo.
    if (openDays.size === 0) return true;
    return !openDays.has(weekdayOf(date));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground')}>
          {value ? toDisplayDate(value) : 'Selecione a data'}
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground/80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* locale explícito: sem ele o react-day-picker cai no inglês ("August 2026", "Su Mo Tu"),
            que seria o único texto em inglês num app inteiro em pt-BR. */}
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          disabled={isDisabled}
          defaultMonth={selected ?? today}
          onSelect={(date) => {
            onChange(date ? toIsoDate(date) : '');
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateFieldProps {
  value: string;
  operatingHours: OperatingHour[] | undefined;
  disabled?: boolean;
  onChange: (isoDate: string) => void;
}
