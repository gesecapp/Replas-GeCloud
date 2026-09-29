import type { LucideIcon } from 'lucide-react';
import type { AppUserType } from '@/lib/permissions';
import type { FileRoutesByTo } from '@/routeTree.gen';

// Mapeamento de icones por segmento de rota
export const ROUTE_ICONS: Record<string, LucideIcon> = {};

// Icones para sub-rotas especificas
export const SUB_ROUTE_ICONS: Record<string, LucideIcon> = {};

// Labels de exibição para cada segmento de rota
export const ROUTE_LABELS: Record<string, string> = {
  'access-user': 'Meu Cadastro',
  'sync-status': 'Status de Sincronização',
  visitors: 'Meus Visitantes',
  dependents: 'Meus Dependentes',
  reservations: 'Reservas de Locais',
  add: 'Adicionar',
};

// Rotas privadas de navegação, validadas contra o routeTree.gen.ts.
// Sem `allowedUserTypes` = visível para todos os tipos autenticados.
const NAV_ROUTES: readonly NavRouteConfig[] = [
  { path: '/access-user' },
  { path: '/sync-status' },
  { path: '/visitors', allowedUserTypes: ['morador'] },
  { path: '/visitors/add', allowedUserTypes: ['morador'] },
  { path: '/dependents', allowedUserTypes: ['morador'] },
  { path: '/dependents/add', allowedUserTypes: ['morador'] },
  { path: '/reservations', allowedUserTypes: ['morador', 'colaborador'] },
  { path: '/reservations/add', allowedUserTypes: ['morador', 'colaborador'] },
];

function isAllowed(route: NavRouteConfig, userType: AppUserType | null): boolean {
  if (!route.allowedUserTypes) return true;
  if (!userType) return false;
  return route.allowedUserTypes.includes(userType);
}

function groupBySection(routes: readonly NavRouteConfig[]): Record<string, NavPath[]> {
  const groups: Record<string, NavPath[]> = {};
  for (const route of routes) {
    const section = route.path.split('/').filter(Boolean)[0];
    if (!groups[section]) groups[section] = [];
    groups[section].push(route.path);
  }
  return groups;
}

export function buildNavRoutes(userType: AppUserType | null = null): SidebarRoute[] {
  const visible = NAV_ROUTES.filter((route) => isAllowed(route, userType));
  const grouped = groupBySection(visible);
  const routes: SidebarRoute[] = [];

  for (const [section, paths] of Object.entries(grouped)) {
    if (paths.length === 1 && paths[0] === `/${section}`) {
      routes.push({
        id: section,
        path: paths[0],
        labelKey: ROUTE_LABELS[section] ?? section,
        icon: ROUTE_ICONS[section],
      });
      continue;
    }

    const children: SidebarRoute[] = paths.map((path) => {
      const segments = path.split('/').filter(Boolean);
      const childName = segments[1] ?? section;
      return {
        id: `${section}-${childName}`,
        path,
        labelKey: ROUTE_LABELS[childName] ?? childName,
        icon: SUB_ROUTE_ICONS[childName],
      };
    });

    routes.push({
      id: section,
      path: `/${section}`,
      labelKey: ROUTE_LABELS[section] ?? section,
      icon: ROUTE_ICONS[section],
      children,
    });
  }

  return routes;
}

export interface SidebarRoute {
  id: string;
  path: string;
  labelKey: string;
  icon?: LucideIcon;
  children?: SidebarRoute[];
}

type NavPath = keyof FileRoutesByTo;

interface NavRouteConfig {
  path: NavPath;
  allowedUserTypes?: readonly AppUserType[];
}
