import { CalendarPlus, ChevronLeft, ChevronRight, Clock, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import DefaultEmptyData from '@/components/default-empty-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import { reservationTypeLabel } from '../@consts/reservation.consts';
import type { Reservation } from '../@interface/reservation.schema';
import { toDisplayDate } from '../@utils/reservation.utils';
import { ReservationStatusBadge } from './reservation-status-badge';

const PAGE_SIZE = 10;

// Ordem de leitura para o morador: o que está por vir primeiro, histórico depois. `findAll` já
// devolve por data decrescente, o que joga o futuro distante no topo — aqui a ordenação é por
// proximidade do hoje, que é o que a pessoa quer ver ao abrir a tela.
function sortByRelevance(a: Reservation, b: Reservation): number {
  const today = new Date().toISOString().slice(0, 10);
  const aFuture = a.date >= today;
  const bFuture = b.date >= today;
  if (aFuture !== bFuture) return aFuture ? -1 : 1;
  if (aFuture) return a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date);
  return a.date === b.date ? b.startTime.localeCompare(a.startTime) : b.date.localeCompare(a.date);
}

export function ReservationList({ reservations, onAdd, onOpen }: ReservationListProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = term
      ? reservations.filter((r) => (r.location?.name ?? '').toLowerCase().includes(term) || reservationTypeLabel(r.reservationType).toLowerCase().includes(term))
      : reservations;
    return [...matched].sort(sortByRelevance);
  }, [reservations, search]);

  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  return (
    <ItemGroup className="gap-4">
      <ItemHeader>
        <ItemTitle className="text-lg">Minhas Reservas</ItemTitle>
        <ItemActions>
          <Button size="sm" onClick={onAdd}>
            <CalendarPlus className="size-4" />
            Reservar
          </Button>
        </ItemActions>
      </ItemHeader>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por local ou tipo..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <DefaultEmptyData />
      ) : (
        <ItemGroup>
          {pageItems.map((reservation) => (
            <Item key={reservation.id} variant="default" className="cursor-pointer items-center" onClick={() => onOpen(reservation.id)}>
              <ItemContent className="gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ItemTitle className="font-medium">{reservation.location?.name ?? 'Local'}</ItemTitle>
                  <ReservationStatusBadge phase={reservation.phase} />
                </div>
                <ItemDescription className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {reservationTypeLabel(reservation.reservationType)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {toDisplayDate(reservation.date)} · {reservation.startTime}–{reservation.endTime}
                  </span>
                </ItemDescription>
              </ItemContent>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Item>
          ))}
        </ItemGroup>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <ItemDescription>
            Exibindo {page * PAGE_SIZE + 1} a {Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
          </ItemDescription>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, i) => i).map((i) => (
              <Button key={i} variant={page === i ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(i)}>
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => p + 1)} disabled={page >= pageCount - 1}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </ItemGroup>
  );
}

interface ReservationListProps {
  reservations: Reservation[];
  onAdd: () => void;
  onOpen: (id: string) => void;
}
