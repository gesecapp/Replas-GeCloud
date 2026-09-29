import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { StatusIndicator } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { getSyncState, getSyncStateInfo, RegistrationStatusAlert } from '@/components/user-sync-alert';
import { useGetAppUser, useGetUserSyncStatus } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useUserPermissions } from '@/hooks/use-user-permissions';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_private/')({
  component: DashboardPage,
});

function DashboardCardIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <ItemGroup aria-hidden className="pointer-events-none flex h-16 items-center justify-center overflow-hidden">
      <div className="dashboard-card-illustration" role="img" aria-label={alt} style={{ '--dashboard-card-icon': `url("${src}")` } as CSSProperties} />
    </ItemGroup>
  );
}

// Card que navega direto. Extraído porque o bloco se repetia idêntico em cada atalho, com a
// única variação sendo destino, rótulo e ícone.
function DashboardLinkCard({ to, title, icon, alt }: { to: string; title: string; icon: string; alt: string }) {
  return (
    <Item variant="default" className="group h-full items-stretch hover:bg-secondary">
      <Link to={to} className="flex h-full w-full flex-col justify-between no-underline">
        <ItemContent className="flex-row items-start justify-between">
          <ItemTitle className="font-medium text-base">{title}</ItemTitle>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:text-sky-500" />
        </ItemContent>
        <DashboardCardIcon src={icon} alt={alt} />
      </Link>
    </Item>
  );
}

// Card que agrupa: em vez de navegar, abre os atalhos do grupo logo abaixo. É `button` e não
// `Link` porque não leva a lugar nenhum — a seta vira chevron para não prometer navegação.
function DashboardGroupCard({ title, icon, alt, open, onToggle }: { title: string; icon: string; alt: string; open: boolean; onToggle: () => void }) {
  return (
    <Item variant="default" className={cn('group h-full items-stretch hover:bg-secondary', open && 'bg-secondary')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex h-full w-full cursor-pointer flex-col justify-between text-left">
        <ItemContent className="flex-row items-start justify-between">
          <ItemTitle className="font-medium text-base">{title}</ItemTitle>
          <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:text-sky-500', open && 'rotate-180 text-sky-500')} />
        </ItemContent>
        <DashboardCardIcon src={icon} alt={alt} />
      </button>
    </Item>
  );
}

// Atalho de dentro de um grupo: mesma navegação dos cards antigos, só menor e sem ilustração —
// a ilustração já está no card do grupo, repeti-la duas vezes embaixo dele vira ruído.
function DashboardSubCard({ to, title }: { to: string; title: string }) {
  return (
    <Item variant="outline" className="group items-stretch hover:bg-secondary">
      <Link to={to} className="flex w-full items-center justify-between no-underline">
        <ItemTitle className="font-medium text-sm">{title}</ItemTitle>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:stroke-3 group-hover:text-sky-500" />
      </Link>
    </Item>
  );
}

// Painel expandido. Ocupa as duas colunas para cair na linha inteira abaixo do card do grupo,
// independentemente de o grupo estar na coluna da esquerda ou da direita.
function DashboardGroupPanel({ children }: { children: ReactNode }) {
  return <div className="col-span-2 grid grid-cols-2 gap-4">{children}</div>;
}

type DashboardGroup = 'visitors' | 'dependents' | 'service-providers';

function DashboardPage() {
  const { userId } = useAppAuth();
  const { permissions } = useUserPermissions();
  const { data: user } = useGetAppUser();
  const { data: syncStatus, isLoading: isLoadingSync } = useGetUserSyncStatus(userId);
  // Um grupo aberto por vez: abrir os três empurraria os atalhos finais para fora da dobra,
  // que é justamente o que este reagrupamento veio resolver.
  const [openGroup, setOpenGroup] = useState<DashboardGroup | null>(null);

  function toggleGroup(group: DashboardGroup) {
    setOpenGroup((current) => (current === group ? null : group));
  }

  const firstName = user?.name?.split(' ')[0] || '';

  const syncState = getSyncState(syncStatus, isLoadingSync);
  const syncInfo = getSyncStateInfo(syncState);
  const badgeStatus = syncState && syncState !== 'synchronized' && syncInfo ? syncInfo.statusIndicator : undefined;

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>
          <img src="/images/logo.png" alt="Gesec Logo" className="h-12 w-auto object-contain" />
        </CardTitle>
        <CardAction>
          <UserAvatarMenu badgeStatus={badgeStatus} />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ItemGroup className="items-center">
          <ItemContent className="items-center">
            <ItemTitle className="font-semibold text-4xl">Bem vindo, {firstName}</ItemTitle>
            <div className="mt-1 flex items-baseline gap-2">
              <StatusIndicator status="info" />
              <div className="flex items-baseline gap-1">
                <ItemTitle>Entidade:</ItemTitle>
                <ItemDescription className="text-lg">Fazenda Boa Vista</ItemDescription>
              </div>
            </div>
            {syncState !== null && ['loading', 'queued', 'pending', 'rejected'].includes(syncState) && (
              <RegistrationStatusAlert syncStatus={syncStatus} isLoading={isLoadingSync} linkTo="/access-user" />
            )}
          </ItemContent>
        </ItemGroup>

        <div className="grid grid-cols-2 gap-4">
          {permissions.canEditOwnProfile && <DashboardLinkCard to="/access-user" title="Meu cadastro" icon="/images/icon-user.png" alt="Editar cadastro" />}

          {permissions.canManageVisitors && (
            <>
              <DashboardGroupCard title="Visitantes" icon="/images/icon-visitors.png" alt="Visitantes" open={openGroup === 'visitors'} onToggle={() => toggleGroup('visitors')} />
              {openGroup === 'visitors' && (
                <DashboardGroupPanel>
                  <DashboardSubCard to="/visitors" title="Meus Visitantes" />
                  <DashboardSubCard to="/visitors/add" title="Incluir Visitante" />
                </DashboardGroupPanel>
              )}
            </>
          )}

          {permissions.canManageDependents && (
            <>
              <DashboardGroupCard
                title="Dependentes"
                icon="/images/icon-dependents.png"
                alt="Dependentes"
                open={openGroup === 'dependents'}
                onToggle={() => toggleGroup('dependents')}
              />
              {openGroup === 'dependents' && (
                <DashboardGroupPanel>
                  <DashboardSubCard to="/dependents" title="Meus Dependentes" />
                  <DashboardSubCard to="/dependents/add" title="Incluir Dependente" />
                </DashboardGroupPanel>
              )}
            </>
          )}

          {permissions.canManageServiceProviders && (
            <>
              <DashboardGroupCard
                title="Prestadores"
                icon="/images/icon-service-providers.png"
                alt="Prestadores"
                open={openGroup === 'service-providers'}
                onToggle={() => toggleGroup('service-providers')}
              />
              {openGroup === 'service-providers' && (
                <DashboardGroupPanel>
                  <DashboardSubCard to="/service-providers" title="Meus Prestadores" />
                  <DashboardSubCard to="/service-providers/add" title="Incluir Prestador" />
                </DashboardGroupPanel>
              )}
            </>
          )}

          {permissions.canManageReservations && <DashboardLinkCard to="/reservations" title="Reservas de Locais" icon="/images/icon-reservations.png" alt="Reservas de locais" />}

          {permissions.canViewUnits && <DashboardLinkCard to="/units" title="Unidades" icon="/images/icon-units.png" alt="Unidades" />}

          {permissions.canViewSyncStatus && <DashboardLinkCard to="/sync-status" title="Sincronizações" icon="/images/icon-sync.png" alt="Status de sincronização" />}
        </div>
      </CardContent>

      <CardFooter>
        <TreeNavigation hideMenu showLogout />
      </CardFooter>
    </Card>
  );
}
