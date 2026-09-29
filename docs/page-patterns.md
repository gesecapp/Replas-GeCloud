# Padroes de Pagina

## Estrutura de uma Página

Todo arquivo que usa `createFileRoute()` é uma **Página**. Páginas renderizam o conteúdo diretamente, sem wrapper obrigatório de Card. Use `Item`/`ItemGroup` para agrupar conteúdo e `DataTable` para listagens.

## Pagina de Listagem (Exemplo Completo)

> **Regra**: Toda listagem de dados DEVE usar `DataTable` de `@/components/ui/data-table`.
> NUNCA use `ItemGroup` / `Item` para apresentar listagens de registros.

Exemplo de `src/routes/_private/users/index.tsx`:

```tsx
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

import DefaultEmptyData from '@/components/default-empty-data';
import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PartialUser } from '@/lib/interfaces/user';
import { useUsersQuery } from '@/query/users';

// 1. Schema de validacao dos search params
const searchSchema = z.object({
  page: z.number().optional().default(1),
  size: z.number().optional().default(20),
  search: z.string().optional(),
});

type SearchParams = z.infer<typeof searchSchema>;

// 2. Definicao da rota
export const Route = createFileRoute('/_private/users/')({
  component: UserListPage,
  staticData: {
    title: 'Usuários',
    description: 'Gerenciamento de usuários do sistema',
  },
  validateSearch: (search: Record<string, unknown>): SearchParams => searchSchema.parse(search),
});

// 3. Componente da pagina
function UserListPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { page, size, search } = useSearch({ from: '/_private/users/' });

  // 4. Fetch de dados
  const { data, isLoading } = useUsersQuery();

  // 5. Filtro/paginacao no cliente (quando o backend nao suporta)
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter((u) => u.name.toLowerCase().includes(lowerSearch) || u.email?.toLowerCase().includes(lowerSearch));
  }, [data, search]);

  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / size);
  const items = filteredData.slice((page - 1) * size, page * size);

  // 6. Definicao das colunas — SEMPRE com useMemo e tipagem correta
  const columns = useMemo<DataTableColumn<PartialUser>[]>(
    () => [
      {
        key: 'name',
        header: 'Usuário',
        sortable: true,
        render: (_, item) => <span className="font-medium">{item.name}</span>,
      },
      {
        key: 'email',
        header: 'E-mail',
        render: (_, item) => <span className="text-muted-foreground text-sm">{item.email}</span>,
      },
      {
        key: '_id',
        header: '',
        width: '50px',
        render: (_, item) => (
          <Button variant="secondary" size="sm" onClick={() => navigate({ to: '/users/details', search: { id: item._id } })}>
            Ver
          </Button>
        ),
      },
    ],
    [navigate],
  );

  // 7. Render
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar usuário..."
          defaultValue={search || ''}
          className="max-w-64"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              navigate({
                search: (prev: SearchParams) => ({
                  ...prev,
                  search: e.currentTarget.value || undefined,
                  page: 1,
                }),
              });
            }
          }}
        />
        <Button onClick={() => navigate({ to: '/users/invite' })}>Convidar</Button>
      </div>

      {isLoading ? (
        <DefaultLoading />
      ) : items.length === 0 ? (
        <DefaultEmptyData />
      ) : (
        <DataTable
          data={items}
          columns={columns}
          searchable={false}
          showPagination={false}
          bordered={true}
          onRowClick={(row) => navigate({ to: '/users/details', search: { id: row._id } })}
        />
      )}

      {totalCount > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span>Exibir</span>
          <Select value={String(size)} onValueChange={(val) => navigate({ search: (prev: SearchParams) => ({ ...prev, size: Number(val), page: 1 }) })}>
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>por página</span>
          <span className="ml-4 tabular-nums">Total: {totalCount}</span>
          <Pagination className="ml-auto w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && navigate({ search: (prev: SearchParams) => ({ ...prev, page: page + 1 }) })}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
```


## Pagina de Formulario (Exemplo Completo)

Exemplo de `src/routes/_private/users/add/index.tsx`:

```tsx
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import DefaultLoading from '@/components/default-loading';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';

import { useUser, useUsersApi } from '@/hooks/use-users-api';
import { UserForm } from './@components/user-form';
import { useUserForm } from './@hooks/use-user-form';

const searchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute('/_private/users/add/')({
  component: UserAddPage,
  staticData: {
    title: 'Usuário',
    description: 'Cadastro e edição de usuário',
  },
  validateSearch: searchSchema,
});

function UserAddPage() {
  const { id } = useSearch({ from: '/_private/users/add/' });
  const { data: user, isLoading } = useUser(id);

  if (id && isLoading) return <DefaultLoading />;

  return <UserAddFormContent initialData={user} />;
}

function UserAddFormContent({ initialData }: { initialData?: any }) {
  const navigate = useNavigate();
  const { deleteUser } = useUsersApi();

  const formData = useMemo(() => {
    if (!initialData) return undefined;
    return { id: initialData.id };
  }, [initialData]);

  const { form, onSubmit, isPending } = useUserForm(formData);

  const handleDelete = async () => {
    if (!initialData?.id) return;
    try {
      await deleteUser.mutateAsync(initialData.id);
      toast.success('Excluído com sucesso');
      navigate({ to: '/users' });
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <UserForm />
        <div className="flex justify-between pt-4">
          {initialData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={deleteUser.isPending || isPending}>
                  {deleteUser.isPending ? <Spinner className="mr-2 size-4" /> : null}
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" disabled={isPending} className="ml-auto min-w-30">
            {isPending && <Spinner className="mr-2 size-4" />}
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
```
