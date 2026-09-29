export const APP_USER_TYPES: readonly AppUserType[] = ['morador', 'visitante', 'colaborador', 'prestador_de_servico', 'dependente'] as const;

const NO_PERMISSIONS: UserPermissions = {
  canEditOwnProfile: true,
  canViewSyncStatus: true,
  canViewUnits: false,
  canManageDependents: false,
  canManageVisitors: false,
  canInviteVisitors: false,
  canManageServiceProviders: false,
  canManageReservations: false,
};

const PERMISSIONS_BY_TYPE: Record<AppUserType, UserPermissions> = {
  morador: {
    canEditOwnProfile: true,
    canViewSyncStatus: true,
    canViewUnits: true,
    canManageDependents: true,
    canManageVisitors: true,
    canInviteVisitors: true,
    canManageServiceProviders: true,
    canManageReservations: true,
  },
  colaborador: {
    canEditOwnProfile: true,
    canViewSyncStatus: true,
    canViewUnits: false,
    canManageDependents: false,
    canManageVisitors: false,
    canInviteVisitors: false,
    canManageServiceProviders: true,
    canManageReservations: true,
  },
  visitante: NO_PERMISSIONS,
  prestador_de_servico: NO_PERMISSIONS,
  dependente: {
    ...NO_PERMISSIONS,
    canViewUnits: true,
  },
};

export function isAppUserType(value: string | null | undefined): value is AppUserType {
  return !!value && (APP_USER_TYPES as readonly string[]).includes(value);
}

export function getUserPermissions(userType: string | null | undefined): UserPermissions {
  return isAppUserType(userType) ? PERMISSIONS_BY_TYPE[userType] : NO_PERMISSIONS;
}

export interface UserPermissions {
  canEditOwnProfile: boolean;
  canViewSyncStatus: boolean;
  canViewUnits: boolean;
  canManageDependents: boolean;
  canManageVisitors: boolean;
  canInviteVisitors: boolean;
  canManageServiceProviders: boolean;
  canManageReservations: boolean;
}

export type AppUserType = 'morador' | 'visitante' | 'colaborador' | 'prestador_de_servico' | 'dependente';
