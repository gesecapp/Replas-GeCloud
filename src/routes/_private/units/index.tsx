import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Home, Info, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Label } from '@/components/ui/label';
import { useAppAuth } from '@/hooks/use-app-auth';
import { getUserPermissions } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useParentUnits } from '@/routes/_private/units/@hooks/use-parent-units';
import { useSearchUnits } from '@/routes/_private/units/@hooks/use-search-units';
import { useLinkSelfToUnit, useUnits } from '@/routes/_private/units/@hooks/use-units';
import type { Unit } from '@/routes/_private/units/@interface/unit.interface';

export const Route = createFileRoute('/_private/units/')({
  beforeLoad: () => {
    const { isAuthenticated, userType } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({ to: '/app-auth' });
    }

    if (!getUserPermissions(userType).canViewUnits) {
      throw redirect({ to: '/' });
    }
  },
  component: UnitsPage,
  staticData: { title: 'Unidades' },
});

function UnitsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { userType } = useAppAuth();
  const { units, isLoading } = useUnits();

  const isDependent = userType === 'dependente';
  const hasUnits = units.length > 0;

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Unidades</CardTitle>
        <CardAction>
          <Button size={'sm'} onClick={() => navigate({ to: '/' })}>
            <Home className="size-4" />
          </Button>
          <UserAvatarMenu />
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <DefaultLoading />
        ) : (
          <ItemGroup className="gap-6">
            {hasUnits && <LinkedUnitsList units={units} />}
            {!hasUnits && isDependent && <DependentUnitSelection />}
            {!isDependent && <UnitSearchAssignment hasUnits={hasUnits} />}
          </ItemGroup>
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}

function LinkedUnitsList({ units }: { units: Unit[] }) {
  const defaultId = units[0]?.id;

  return (
    <ItemGroup className="gap-4">
      <ItemHeader>
        <ItemContent>
          <ItemTitle className="text-lg">Unidades vinculadas</ItemTitle>
          <ItemDescription>Selecione a unidade que deseja definir como padrão.</ItemDescription>
        </ItemContent>
      </ItemHeader>

      <ItemGroup className="gap-3">
        {units.map((unit) => {
          const isDefault = unit.id === defaultId;
          return (
            <Item key={unit.id} variant="default" className={cn(isDefault && 'ring-2 ring-primary')}>
              <ItemMedia>
                <UnitRadioIndicator selected={isDefault} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="font-medium text-base">{unit.identifier}</ItemTitle>
                <ItemDescription>{getUnitTypeLabel(unit.type)}</ItemDescription>
              </ItemContent>
              {isDefault && (
                <Badge variant="info" className="gap-1">
                  <Star className="size-3" />
                  Padrão
                </Badge>
              )}
            </Item>
          );
        })}
      </ItemGroup>

      <Item variant="muted">
        <ItemMedia>
          <Info className="size-5 text-primary" />
        </ItemMedia>
        <ItemContent>
          <ItemDescription>A unidade marcada como Padrão será utilizada como referência principal em suas interações no sistema.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  );
}

function DependentUnitSelection() {
  const { results, isLoading } = useParentUnits(true);
  const link = useLinkSelfToUnit();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && results.length > 0) {
      setSelectedId(results[0].id);
    }
  }, [results, selectedId]);

  function handleAssign() {
    if (!selectedId) return;
    link.mutate(selectedId, {
      onSuccess: () => {
        toast.success('Unidade vinculada com sucesso!');
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao vincular unidade.';
        toast.error(message);
      },
    });
  }

  if (isLoading) {
    return <DefaultLoading />;
  }

  if (results.length === 0) {
    return (
      <Item variant="default">
        <ItemContent>
          <ItemTitle>Nenhuma unidade disponível</ItemTitle>
          <ItemDescription>O titular ainda não possui unidades vinculadas.</ItemDescription>
        </ItemContent>
      </Item>
    );
  }

  return (
    <ItemGroup className="gap-4">
      <ItemHeader>
        <ItemContent>
          <ItemTitle className="text-lg">Unidades do titular</ItemTitle>
          <ItemDescription>Selecione uma das unidades vinculadas ao titular para se vincular.</ItemDescription>
        </ItemContent>
      </ItemHeader>

      <ItemGroup className="gap-3">
        {results.map((unit) => {
          const isSelected = unit.id === selectedId;
          return (
            <Item key={unit.id} variant="default" onClick={() => setSelectedId(unit.id)} className={cn('cursor-pointer', isSelected && 'ring-2 ring-primary')}>
              <ItemMedia>
                <UnitRadioIndicator selected={isSelected} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="font-medium text-base">{unit.identifier}</ItemTitle>
                <ItemDescription>{getUnitTypeLabel(unit.type)}</ItemDescription>
              </ItemContent>
            </Item>
          );
        })}
      </ItemGroup>

      <Button type="button" onClick={handleAssign} disabled={!selectedId || link.isPending}>
        Vincular unidade
      </Button>
    </ItemGroup>
  );
}

function UnitSearchAssignment({ hasUnits }: { hasUnits: boolean }) {
  const [term, setTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const { results, isLoading } = useSearchUnits(submittedTerm);
  const link = useLinkSelfToUnit();

  function handleSearch() {
    setSubmittedTerm(term.trim());
  }

  function handleAssign(unitId: string) {
    link.mutate(unitId, {
      onSuccess: () => {
        toast.success('Unidade vinculada com sucesso!');
        setTerm('');
        setSubmittedTerm('');
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao vincular unidade.';
        toast.error(message);
      },
    });
  }

  return (
    <ItemGroup className="gap-3">
      <ItemHeader>
        <ItemContent>
          <ItemTitle className="text-lg">{hasUnits ? 'Vincular outra unidade' : 'Selecionar unidade'}</ItemTitle>
          <ItemDescription>
            {hasUnits ? 'Busque pelo identificador para vincular uma nova unidade.' : 'Você ainda não possui unidade vinculada. Busque pelo identificador e selecione a sua.'}
          </ItemDescription>
        </ItemContent>
      </ItemHeader>

      <ItemContent className="gap-2">
        <Label htmlFor="unit-search">Identificador da unidade</Label>
        <ItemContent className="flex-row gap-2">
          <Input
            id="unit-search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Ex.: 101"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button type="button" onClick={handleSearch} disabled={!term.trim() || isLoading}>
            <Search className="size-4" />
            Buscar
          </Button>
        </ItemContent>
      </ItemContent>

      {submittedTerm && (
        <ItemGroup className="gap-2">
          {isLoading ? (
            <DefaultLoading />
          ) : results.length === 0 ? (
            <Item variant="default">
              <ItemContent>
                <ItemDescription>Nenhuma unidade encontrada para "{submittedTerm}".</ItemDescription>
              </ItemContent>
            </Item>
          ) : (
            results.map((unit) => (
              <Item key={unit.id} variant="default">
                <ItemContent>
                  <ItemTitle>{unit.identifier}</ItemTitle>
                  {unit.block && <ItemDescription>Bloco {unit.block}</ItemDescription>}
                </ItemContent>
                <Button size="sm" onClick={() => handleAssign(unit.id)} disabled={link.isPending}>
                  Vincular
                </Button>
              </Item>
            ))
          )}
        </ItemGroup>
      )}
    </ItemGroup>
  );
}

function UnitRadioIndicator({ selected }: { selected: boolean }) {
  return (
    <div className={cn('flex size-5 items-center justify-center rounded-full border-2', selected ? 'border-primary' : 'border-muted-foreground/40')}>
      {selected && <div className="size-2.5 rounded-full bg-primary" />}
    </div>
  );
}

function getUnitTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    commercial: 'Comercial',
    cobertura: 'Cobertura',
  };

  return type ? (labels[type] ?? type) : '-';
}
