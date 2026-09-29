import { useMemo } from 'react';
import { useAppAuth } from '@/hooks/use-app-auth';
import type { AppUserType, UserPermissions } from '@/lib/permissions';
import { getUserPermissions } from '@/lib/permissions';

export function useUserPermissions(): UseUserPermissionsResult {
  const userType = useAppAuth((state) => state.userType);

  return useMemo(
    () => ({
      userType,
      permissions: getUserPermissions(userType),
    }),
    [userType],
  );
}

export interface UseUserPermissionsResult {
  userType: AppUserType | null;
  permissions: UserPermissions;
}
