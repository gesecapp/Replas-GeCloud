# Padroes React

## Declaracao de Componentes

**SEMPRE** use `function` declarations:

```tsx
// CORRETO
function UserCard({ user }: UserCardProps) {
  return (
    <Item>
      <ItemTitle>{user.name}</ItemTitle>
      <ItemDescription>{user.email}</ItemDescription>
    </Item>
  );
}

// EVITAR
const UserCard = ({ user }: UserCardProps) => { ... };
const UserCard: React.FC<UserCardProps> = ({ user }) => { ... };
```

## Estrutura Interna do Componente

Ordem recomendada:

```tsx
function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 1. Hooks de contexto/router
  const navigate = Route.useNavigate();

  // 2. Hooks de estado global (Zustand)
  const { idEnterprise } = useEnterpriseFilter();

  // 3. Hooks de dados (TanStack Query)
  const { data, isLoading } = useUsers();

  // 4. Hooks de estado local
  const [isOpen, setIsOpen] = useState(false);

  // 5. Valores derivados / useMemo
  const filteredUsers = useMemo(() => data?.filter(u => u.active), [data]);

  // 6. Callbacks / useCallback
  const handleSelect = useCallback((user: User) => {
    onSelect?.(user);
    setIsOpen(false);
  }, [onSelect]);

  // 7. Effects (usar com moderacao)
  useEffect(() => { ... }, []);

  // 8. Early returns
  if (isLoading) return <DefaultLoading />;
  if (!data?.length) return <DefaultEmptyData />;

  // 9. Render
  return ( ... );
}
```

## Early Returns

Ordem: loading -> error -> empty -> success

```tsx
function UserProfile({ userId }: { userId?: string }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <DefaultLoading />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <DefaultEmptyData />;

  return (
    <Item>
      <ItemTitle>{user.name}</ItemTitle>
    </Item>
  );
}
```

## Conditional Rendering

```tsx
// Simples - &&
{hasPermission && <AdminPanel />}

// If-else - ternario
{isLoading ? <Spinner /> : <Content />}

// Multiplas condicoes - config object
function StatusBadge({ status }: { status: Status }) {
  const config = {
    active: { label: 'Ativo', variant: 'success' },
    inactive: { label: 'Inativo', variant: 'secondary' },
    pending: { label: 'Pendente', variant: 'warning' },
  }[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

## Conditional Classes

```tsx
import { cn } from '@/lib/utils/cn.util';

className={cn(
  'rounded-md font-medium',
  variant === 'primary' && 'bg-primary text-white',
  variant === 'outline' && 'border border-input bg-transparent',
  className
)}
```

## Anti-Patterns

### Props Drilling -> usar Zustand ou Context
```tsx
// EVITAR: passar user por 4 niveis
// CORRETO: const { user } = useAuth();
```

### useEffect para estado derivado -> usar useMemo
```tsx
// EVITAR: useEffect(() => setTotal(...), [items])
// CORRETO: const total = useMemo(() => ..., [items])
```

### Fetch em useEffect -> usar TanStack Query
```tsx
// EVITAR: useEffect(() => fetch(...), [])
// CORRETO: const { data } = useUsers()
```
