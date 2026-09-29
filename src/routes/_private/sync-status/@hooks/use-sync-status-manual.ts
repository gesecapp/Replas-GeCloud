import { useQuery } from '@tanstack/react-query';
import { accessUserKeys } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { UserSyncStatus } from '@/routes/_private/access-user/@interface/access-user.interface';

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeUserSyncStatus(userId: string, raw: any): UserSyncStatus {
  if (!raw || 'message' in raw) {
    return {
      user: { id: userId, name: '', document: '' },
      sync_status: null,
      synchronized: false,
      all_sensors_sync_users: false,
      all_sensors_sync_images: null,
      is_processing: false,
    };
  }

  const syncStatusData = raw.sync_status || raw;
  const user = raw.user || { id: userId, name: '', document: '' };

  const rawSensors = syncStatusData.sensors || {};
  const sensorsArray = Array.isArray(rawSensors) ? rawSensors : Object.entries(rawSensors).map(([id, s]: [string, any]) => ({ ...s, sensorId: id }));

  const sensors = (sensorsArray || []).map((s: any) => {
    const imageStatus = s.image_status as { accepted?: boolean; reason?: string; rejected?: boolean } | undefined;
    return {
      sensorId: s.sensorId,
      sensorName: s.sensorName,
      registered: s.registered,
      image_accepted: s.image_accepted ?? imageStatus?.accepted,
      image_rejected_reason: s.image_rejected_reason ?? imageStatus?.reason ?? (imageStatus?.rejected ? 'Rejected' : undefined),
      last_sync_at: s.last_sync_at,
    };
  });

  const synchronized = raw.synchronized ?? syncStatusData.synchronized ?? (sensors.length > 0 && sensors.every((s: any) => s.registered && s.image_accepted !== false));

  return {
    user,
    sync_status: { ...syncStatusData, sensors, synchronized },
    synchronized,
    all_sensors_sync_users: raw.all_sensors_sync_users ?? false,
    all_sensors_sync_images: raw.all_sensors_sync_images ?? null,
    is_processing: raw.is_processing ?? false,
  };
}

/**
 * Versão manual (sem polling) de useGetUserSyncStatus.
 * Utiliza a mesma queryKey para compartilhar cache com o hook global,
 * mas sem refetchInterval — o refresh é feito pelo usuário via botão.
 */
export function useGetUserSyncStatusManual(userId: string | null | undefined) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: accessUserKeys.syncStatus(userId || ''),
    queryFn: async () => {
      const response = await api.get<{ data: any; statusCode: number }>(`/app/user/${userId}/sync-status`, {
        headers: authHeaders(token),
      });
      return normalizeUserSyncStatus(userId as string, response.data.data);
    },
    enabled: !!token && !!userId,
    // Sem refetchInterval — atualização feita manualmente pelo usuário
  });
}
