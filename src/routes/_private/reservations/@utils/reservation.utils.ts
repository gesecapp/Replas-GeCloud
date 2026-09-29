import { SLOT_GRANULARITY_MINUTES } from '../@consts/reservation.consts';
import type { OperatingHour, TimeSlot } from '../@interface/reservation.schema';

// Datas trafegam como 'YYYY-MM-DD' (wall-clock, sem fuso) e são exibidas como 'DD/MM/YYYY'.
// A conversão é feita por string de propósito: `new Date('2026-09-13')` é interpretado como
// meia-noite UTC e, no horário de Brasília, volta como dia 12.

export function toDisplayDate(isoDate: string | undefined | null): string {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromIsoDate(isoDate: string | undefined | null): Date | undefined {
  if (!isoDate) return undefined;
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

const WEEKDAY_BY_INDEX = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function weekdayOf(date: Date): string {
  return WEEKDAY_BY_INDEX[date.getDay()];
}

// Dias da semana em que o local abre. Usado para desabilitar no calendário as datas em que a
// reserva seria recusada por `operating-hours-conflict` — melhor barrar antes do que depois.
export function openWeekdays(operatingHours: OperatingHour[] | undefined): Set<string> {
  return new Set((operatingHours ?? []).map((h) => h.dayOfWeek));
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// Fatia as faixas livres em blocos de granularidade fixa — é neles que o morador toca.
// O último bloco de uma faixa pode ser menor que a granularidade (faixa 08:00–08:20).
export function splitIntoSlots(free: TimeSlot[], granularity = SLOT_GRANULARITY_MINUTES): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (const range of free) {
    const start = timeToMinutes(range.start);
    const end = timeToMinutes(range.end);
    for (let cursor = start; cursor < end; cursor += granularity) {
      slots.push({ start: minutesToTime(cursor), end: minutesToTime(Math.min(cursor + granularity, end)) });
    }
  }
  return slots;
}

// Um intervalo de blocos só vale se for contínuo: dois blocos livres separados por um ocupado
// não formam uma reserva. Como `slots` já vem em ordem, basta cada bloco começar onde o
// anterior terminou.
export function isContiguous(slots: TimeSlot[], fromIndex: number, toIndex: number): boolean {
  for (let i = fromIndex; i < toIndex; i += 1) {
    if (slots[i].end !== slots[i + 1].start) return false;
  }
  return true;
}
