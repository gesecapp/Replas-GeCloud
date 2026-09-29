# Padrao de Query (TanStack Query)

Arquivo: `src/query/{feature}.ts`

Consulte `src/query/PATTERN.md` para referencia rapida da estrutura.

## Estrutura do Arquivo

Cada arquivo segue esta ordem:

```
1. Imports
2. Types locais (se necessario)
3. Query Keys
4. Fetch functions (privadas)
5. Query Hooks
6. Mutation Hooks (se houver)
7. Cache Helpers (se necessario)
8. Utilitarios puros (mappers, getters)
```

## Exemplo Completo — Lista + Detalhe

```tsx
import { useQuery } from '@tanstack/react-query';
import { GET, request } from '@/lib/api/client';
import type { FinancialList, FullFinancial } from '@/lib/interfaces/financial';

// 1. Query Keys centralizadas
export const financialsKeys = {
  all: ['financials'] as const,
  lists: () => [...financialsKeys.all, 'list'] as const,
  list: () => [...financialsKeys.lists()] as const,
  details: () => [...financialsKeys.all, 'detail'] as const,
  detail: (id: string) => [...financialsKeys.details(), id] as const,
  byPatient: (patientId: string) => [...financialsKeys.all, 'patient', patientId] as const,
};

// 2. Fetch functions (privadas)
async function fetchFinancials(): Promise<FinancialList[]> {
  const res = await request('financial/list', GET());
  if (!res.success) throw new Error(res.message);
  return res.data as FinancialList[];
}

async function fetchFinancial(id: string): Promise<FullFinancial> {
  const res = await request(`financial/${id}`, GET());
  if (!res.success) throw new Error(res.message);
  return res.data as FullFinancial;
}

// 3. Query Hooks
export function useFinancialsQuery() {
  return useQuery({
    queryKey: financialsKeys.list(),
    queryFn: fetchFinancials,
  });
}

export function useFinancialDetailQuery(id?: string) {
  return useQuery({
    queryKey: financialsKeys.detail(id ?? ''),
    queryFn: () => fetchFinancial(id!),
    enabled: !!id,
  });
}
```

## Resumo do Padrao

1. **Query Keys**: Objeto hierarquico com `as const` (`all > lists > list > details > detail`)
2. **Fetch functions**: Funcoes `async` privadas usando `request()` + `GET()`/`POST()` de `@/lib/api/client`
3. **useQuery**: Hooks separados para listagem e detalhe, com `enabled` para queries condicionais
4. **useMutation**: Hook agrupado retornando todas as mutations com `invalidateQueries` no `onSuccess`

## Variacoes de Keys

```tsx
// Somente lista (sem detalhe)
export const featureKeys = {
  all: ['feature'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  list: () => [...featureKeys.lists()] as const,
};

// Somente detalhe (singleton: clinic, user)
export const featureKeys = {
  all: ['feature'] as const,
  detail: () => [...featureKeys.all, 'detail'] as const,
};

// Lista com parametros (schedule, reminders)
export const featureKeys = {
  all: ['feature'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  list: (params: Params) => [...featureKeys.lists(), params] as const,
};
```

---

## Padroes Avancados

### Lista Paginada com `placeholderData`

Use quando a pagina anterior deve permanecer visivel enquanto a nova carrega:

```tsx
import { keepPreviousData } from '@tanstack/react-query';

export const featureKeys = {
  all: ['feature'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  paginated: (params: SearchParams) => [...featureKeys.lists(), 'paginated', params] as const,
};

export function useFeaturePaginated(params: SearchParams) {
  return useQuery({
    queryKey: featureKeys.paginated(params),
    queryFn: () => fetchFeatures(params),
    placeholderData: keepPreviousData,
  });
}
```

### Mutation Hook

Agrupar todas as mutations num unico hook:

```tsx
export function useFeatureMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
  });

  const update = useMutation({
    mutationFn: updateFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
  });

  return { create, update };
}
```

### Cache Helper (atualizacao manual)

```tsx
export function useFeatureCache() {
  const queryClient = useQueryClient();

  const setCache = (updater: (old: Feature) => Feature) => {
    queryClient.setQueryData<Feature>(featureKeys.detail(), (old) => {
      if (!old) return old;
      return updater(old);
    });
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: featureKeys.all });
  };

  return { setCache, invalidate };
}
```

### Utilitarios Puros (mappers, getters)

Funcoes que recebem dados como argumento — nao chamam hooks:

```tsx
export function mapFeaturesToCombobox(features: Feature[] | undefined) {
  if (!features?.length) return [];
  return features.map((f) => valueAndLabel(f._id, f.name));
}

export function getFeatureName(features: Feature[] | undefined, id: string | undefined): string {
  if (!id || !features) return '';
  return features.find((f) => f._id === id)?.name || '';
}
```

---

## Uso em Componentes

### Consumindo dados com useQuery

```tsx
function FeatureList() {
  const { data, isLoading } = useFeaturesQuery();

  if (isLoading) return <DefaultLoading />;
  if (!data?.length) return <DefaultEmptyData />;

  return data.map((item) => <div key={item._id}>{item.name}</div>);
}
```

### Detalhe com ID condicional

```tsx
function FeatureDetail({ id }: { id?: string }) {
  const { data, isLoading } = useFeatureDetailQuery(id);
  // query so executa quando id existe (enabled: !!id)
}
```

### Usando utilitarios puros com dados de query

```tsx
function PatientSelect() {
  const { data: patients } = usePatientsQuery();
  const options = mapPatientsToCombobox(patients);

  return <Combobox options={options} />;
}
```

### Integracao com Zustand

TanStack Query e o dono da verdade para dados da API. Zustand guarda apenas estado de UI e utilitarios puros.

```tsx
// Zustand: logica pura (nao armazena dados do servidor)
export const useClinicStore = create<ClinicStore>()(() => ({
  getRoomName: (clinic, id) => {
    if (!id || !clinic) return '';
    return clinic.rooms.find((r) => r._id === id)?.name.trim() || '';
  },
}));

// Componente: TanStack fornece dados, Zustand fornece logica
function RoomLabel({ roomId }: { roomId: string }) {
  const { data: clinic } = useClinicApi();
  const getRoomName = useClinicStore((s) => s.getRoomName);
  return <span>{getRoomName(clinic, roomId)}</span>;
}
```

---

## Hooks de Estado Global (Zustand)

Para estado global persistido, use Zustand com middleware `persist`. Nao use `localStorage.setItem` diretamente.

Consulte `docs/state-management.md` para o padrao completo.
