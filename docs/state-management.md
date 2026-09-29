# State Management

## Quando Usar Cada Tipo

| Tipo | Ferramenta | Exemplo |
|------|------------|---------|
| Server State | TanStack Query | Lista de usuarios, detalhes, dados da clinica |
| Form State | react-hook-form | Campos de formulario |
| UI Local | useState | Modal aberto, tab ativa |
| UI Global | Zustand | Sidebar, tema, filtro global, utilitarios |
| Persistente | Zustand + persist | Token de auth, preferencias de UI |

## Fronteira Server State vs Client State

**Regra fundamental**: TanStack Query é o dono da verdade para dados que vêm da API.
Zustand guarda apenas estados de UI e utilitários puros — nunca dados de servidor.

```
API ──► TanStack Query (cache, loading, error, refetch)
                │
                ▼
         Componente React
                │
         Zustand (UI state, seletores puros)
```

### Exemplo — Clínica

```tsx
// ERRADO: Zustand armazenando dado de servidor
const useClinicStore = create(persist((set) => ({
  clinic: null,
  refreshClinic: async () => { /* fetch */ set({ clinic: res.data }) },
}), { name: 'clinic-storage' }));

// CORRETO: separação de responsabilidades
// 1. Server state → TanStack Query (src/query/clinic.ts)
export function useClinicApi() {
  return useQuery({
    queryKey: clinicKeys.detail(),
    queryFn: fetchClinic,
    staleTime: 1000 * 60 * 5,
  });
}

// 2. Client state → Zustand com utilitário puro (src/hooks/clinic.ts)
export const useClinicStore = create<ClinicStore>()(() => ({
  getRoomName: (clinic, id) => {
    if (!id || !clinic) return '';
    return clinic.rooms.find((r) => r._id === id)?.name.trim() || '';
  },
}));

// 3. No componente: TanStack fornece os dados, Zustand fornece a lógica
function RoomLabel({ roomId }: { roomId: string }) {
  const { data: clinic } = useClinicApi();
  const getRoomName = useClinicStore((s) => s.getRoomName);
  return <span>{getRoomName(clinic, roomId)}</span>;
}
```

### Atualizar cache após mutação (substitui setClinic)

```tsx
import { useClinicCache } from '@/query/clinic';

const { setClinicCache, invalidateClinic } = useClinicCache();

// Atualização otimista (sem re-fetch)
setClinicCache((old) => ({ ...old, name: 'Novo Nome' }));

// Ou forçar re-fetch do servidor
invalidateClinic();
```

### Anti-pattern: sincronizar TanStack Query com Zustand

```tsx
// NUNCA fazer isso — causa dados desatualizados e race conditions
useEffect(() => {
  if (clinicData) setClinic(clinicData); // sincroniza Query → Zustand
}, [clinicData]);
```

## Zustand com Persist

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EnterpriseFilterStore {
  idEnterprise: string;
  setIdEnterprise: (id: string) => void;
}

export const useEnterpriseFilter = create<EnterpriseFilterStore>()(
  persist(
    (set) => ({
      idEnterprise: '',
      setIdEnterprise: (id) => set({ idEnterprise: id }),
    }),
    {
      name: 'idEnterprise', // chave no localStorage
    },
  ),
);
```

**IMPORTANTE**: NUNCA use `localStorage.setItem` diretamente. Sempre use Zustand com `persist`.

## Derivar Estado (Nao Duplicar)

```tsx
// ERRADO - Estado duplicado
const [users, setUsers] = useState<User[]>([]);
const [activeUsers, setActiveUsers] = useState<User[]>([]);

useEffect(() => {
  setActiveUsers(users.filter(u => u.active));
}, [users]);

// CORRETO - Estado derivado
const [users, setUsers] = useState<User[]>([]);
const activeUsers = useMemo(() => users.filter(u => u.active), [users]);
```

## Anti-Patterns

- NUNCA `localStorage.setItem` direto
- NUNCA `useEffect` para sincronizar estado derivado
- NUNCA `fetch` em `useEffect` (usar TanStack Query)
- NUNCA estado desnecessario (derivar inline ou com useMemo)
