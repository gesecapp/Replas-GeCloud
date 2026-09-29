# Recursos Disponíveis no Projeto

## Componentes de Data Inputs (`src/components/data-inputs/`)

Usar os componentes prontos ao invés de criar comboboxes e selects do zero. Já encapsulam estado, loading, busca e erro.

| Componente | Import | Descrição |
|------------|--------|-----------|
| `DatePickerButton` | `@/components/data-inputs/date-picker-button` | Botão com popover de calendário |
| `DateTimePicker` | `@/components/data-inputs/date-time-picker` | Seletor de data/hora com dia inteiro, intervalo e horários em 15min |

**Props padrão dos comboboxes:** `controller` (react-hook-form), `disabled?`, `fetchFn` (async que retorna `{ value, label }[]`)

## Componentes de Domínio

| Componente | Import | Descrição |
|------------|--------|-----------|
| `UploadImage` | `@/components/upload-image` | Upload de imagem |
| `MobileDock` | `@/components/mobile-dock` | Navegação mobile |

## Componentes Obrigatórios

| Componente | Import | Quando Usar |
|------------|--------|-------------|
| `DefaultEmptyData` | `@/components/default-empty-data` | Dados vazios ou busca sem resultado |
| `DefaultLoading` | `@/components/default-loading` | Qualquer loading/requisição pendente |
| `DefaultFormLayout` | `@/components/default-form-layout` | Layout de formulários com seções |
| `DefaultKPI` | `@/components/default-KPI` | Exibição de números e KPIs |
| `DefaultStatsSection` | `@/components/default-stats-section` | Seção de estatísticas |

## Componentes de UI (ShadCN)

Todos em `src/components/ui/`. Os mais usados:

**Componentes comuns:** `Item`, `ItemGroup`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemMedia`, `ItemActions`, `ItemHeader`, `ItemFooter`
**Dados:** `DataTable`, `DataTableColumn`, `DataTableColumnHeader`, `DataTablePagination`
**Formulários:** `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
**Inputs:** `Input`, `Select`, `Checkbox`, `Switch`, `Textarea`, `RadioGroup`
**Feedback:** `Badge`, `Spinner`, `Skeleton`, `Progress`, `Timeline`
**Overlays:** `Dialog`, `AlertDialog`, `Sheet`, `Drawer`, `Popover`, `DropdownMenu`, `Tooltip`
**Navegação:** `Tabs`, `Accordion`, `Breadcrumb`, `Pagination`

## Hooks Globais (`src/hooks/`)

**Verificar aqui ANTES de criar um hook novo.**

| Hook | Arquivo | Descrição |
|------|---------|-----------|
| `useAuth` | `auth.ts` | Sessão, login, logout, token |
| `useUserStore` | `user.ts` | Dados do usuário autenticado (persist) |
| `useFavorites` | `use-favorites.ts` | Favoritos persistentes |
| `useIsMobile` | `use-mobile.ts` | Detecta dispositivo mobile |
| `useSidebar` | `use-sidebar-toggle.ts` | Estado da sidebar |

## Query Hooks (`src/query/`)

| Arquivo | Keys | Hooks Principais |
|---------|------|-----------------|
| `users.ts` | `usersKeys` | `useUsersQuery`, `useUserDetailQuery`, `useUserMutations` |
| `invites.ts` | `invitesKeys` | `useInvitesQuery`, `useInviteMutations` |

## Helpers (`src/lib/helpers/`)

| Arquivo | Funções Principais |
|---------|-------------------|
| `translate.ts` | `t(key)` — traduz chave via `translations.json` |
| `formatDate.utils.ts` | `formatDate(date, pattern?, fallback?)`, `formatDistanceToNow(date)`, `getLocalizedMonths()` |
| `formatter.helper.ts` | `formatPhone()`, `formatCPF()`, `formatCurrency()`, `formatCEP()` |
| `calendar.utils.ts` | Utilitários de calendário |
| `regex.helper.ts` | Regex patterns |
| `upload.helper.ts` | Upload de arquivos |
| `validade.helper.ts` | Validações |
| `zodMessage.helper.ts` | Mensagens de erro Zod customizadas |
| `dataManager.helper.ts` | Utilitários de dados |

## Ícones (Lucide Icons)

Usar exclusivamente o pacote **lucide-react**.

```tsx
import { UserIcon, TrashIcon, PencilIcon, SearchIcon } from 'lucide-react';
```

## API Client (`src/lib/api/client.ts`)

```tsx
import { GET, POST, PUT, PATCH, DELETE, request, api } from '@/lib/api/client';

// Fetch direto
const res = await request('patient', GET());
const res = await request('patient', POST(body));

// Estilo axios (retorna { data: Response<T> })
const { data } = await api.get<Patient[]>('patient');
const { data } = await api.post<Patient>('patient', body);
```

- Auth automático via token do Zustand store
- Header: `Authorization: Ease ${token}`
- Base URL: `import.meta.env.VITE_CORE_URL`
