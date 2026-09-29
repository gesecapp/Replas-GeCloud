import {
  ArrowDownAZ,
  ArrowUpAZ,
  Cake,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FileClock,
  ImageOff,
  Mail,
  MoreHorizontal,
  Pencil,
  PhoneIncoming,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import DefaultEmptyData from '@/components/default-empty-data';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item';
import { useAccessUserApi } from '@/hooks/use-access-user-api';
import { useIsMobile } from '@/hooks/use-mobile';
import { applyCpfMask, applyPhoneMask } from '@/lib/masks';
import type { GuestProps, UserSyncStatus } from '@/routes/_private/access-user/@interface/access-user.interface';

const PAGE_SIZE = 10;

export function ServiceProviderList({ guests, syncStatuses, onAdd, onEdit }: ServiceProviderListProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [guestToDelete, setGuestToDelete] = useState<{ id: string; name: string } | null>(null);
  const { deleteGuest } = useAccessUserApi();
  const isMobile = useIsMobile();

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return guests
      .map((guest) => {
        const id = guest._id || guest.id || '';
        const syncStatus = syncStatuses?.find((s) => s.user.id === id);
        return { ...guest, _resolvedId: id, syncStatus } as ServiceProviderItem;
      })
      .filter((item) => !q || item.name?.toLowerCase().includes(q) || item.document?.includes(q))
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') {
          cmp = (a.name || '').localeCompare(b.name || '', 'pt-BR');
        } else {
          const da = a.birthday ? new Date(a.birthday).getTime() : 0;
          const db = b.birthday ? new Date(b.birthday).getTime() : 0;
          cmp = da - db;
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [guests, syncStatuses, search, sortField, sortDir]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleConfirmDelete() {
    if (!guestToDelete) return;
    deleteGuest.mutate(guestToDelete.id, {
      onSuccess: () => {
        toast.success('Prestador excluído com sucesso!');
        setGuestToDelete(null);
      },
      onError: (err: Error & { response?: { data?: { message?: string } } }) => {
        toast.error(err?.response?.data?.message || 'Erro ao excluir prestador.');
        setGuestToDelete(null);
      },
    });
  }

  const SortIcon = sortDir === 'asc' ? ArrowDownAZ : ArrowUpAZ;

  return (
    <>
      <ItemGroup className="gap-4">
        <ItemHeader>
          <ItemTitle className="text-lg">Prestadores de Serviço</ItemTitle>
          <ItemActions>
            <Button size="sm" onClick={onAdd}>
              <Plus className="size-4" />
              Adicionar
            </Button>
          </ItemActions>
        </ItemHeader>

        <ItemActions className="gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant={sortField === 'name' ? 'default' : 'outline'} onClick={() => toggleSort('name')}>
            {sortField === 'name' && <SortIcon className="size-4" />}
            Nome
          </Button>
          <Button variant={sortField === 'birthday' ? 'default' : 'outline'} onClick={() => toggleSort('birthday')}>
            {sortField === 'birthday' && <SortIcon className="size-4" />}
            Nascimento
          </Button>
        </ItemActions>

        {filtered.length === 0 ? (
          <DefaultEmptyData />
        ) : (
          <ItemGroup>
            {pageItems.map((item) => (
              <Item key={item._resolvedId} variant="default" className="cursor-pointer items-center" onClick={() => onEdit(item._resolvedId)}>
                <div className="flex flex-1 items-center gap-4">
                  <ItemMedia variant="image">
                    <Avatar className="size-full rounded-none">
                      <AvatarImage src={item.url_image?.[0]} alt={item.name || ''} />
                      <AvatarFallback>
                        {(item.name || '?')
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle className="text-base">{item.name || '-'}</ItemTitle>
                    <ItemDescription>{applyCpfMask(item.document || '')}</ItemDescription>
                  </ItemContent>
                </div>

                {!isMobile && (
                  <div className="flex flex-wrap items-center gap-4">
                    {item.telephones && item.telephones.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <PhoneIncoming className="size-4" />
                        <ItemDescription>{item.telephones.map((t) => applyPhoneMask(t)).join(', ')}</ItemDescription>
                      </div>
                    )}
                    {item.birthday && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Cake className="size-4" />
                        <ItemDescription>{new Date(item.birthday).toLocaleDateString('pt-BR')}</ItemDescription>
                      </div>
                    )}
                    {item.email && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Mail className="size-4" />
                        <ItemDescription>{item.email}</ItemDescription>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <ItemDescription className="flex items-center gap-2">
                    {item.registration_complete === true && (
                      <>
                        <FileCheck className="size-4 text-green-600" />
                        <ImageOff className="size-4 text-yellow-600" />
                      </>
                    )}
                    {item.registration_complete === false && (
                      <>
                        <FileClock className="size-4 text-yellow-600" />
                        <ImageOff className="size-4 text-yellow-600" />
                      </>
                    )}
                    {item.registration_complete == null && (
                      <>
                        <FileClock className="size-4 text-gray-400" />
                        <ImageOff className="size-4 text-gray-400" />
                      </>
                    )}
                  </ItemDescription>
                  <div className="flex items-center justify-end border-l pl-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => onEdit(item._resolvedId)}>
                          <Pencil className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setGuestToDelete({ id: item._resolvedId, name: item.name || '' })}>
                          <Trash2 className="size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Item>
            ))}

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
        )}
      </ItemGroup>

      <AlertDialog open={!!guestToDelete} onOpenChange={() => setGuestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Prestador</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir o prestador {guestToDelete?.name}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type SortField = 'name' | 'birthday';
type SortDir = 'asc' | 'desc';

interface ServiceProviderListProps {
  guests: GuestProps[];
  syncStatuses?: UserSyncStatus[];
  onAdd: () => void;
  onEdit: (id: string) => void;
}

type ServiceProviderItem = GuestProps & { _resolvedId: string; syncStatus?: UserSyncStatus };
