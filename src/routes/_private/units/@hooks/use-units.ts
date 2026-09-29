import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { Unit } from '@/routes/_private/units/@interface/unit.interface';

const unitsKeys = {
  all: ['app', 'unities'] as const,
  current: () => [...unitsKeys.all, 'current'] as const,
};

export function useUnits() {
  const { userId } = useAppAuth();

  const query = useQuery({
    queryKey: unitsKeys.current(),
    queryFn: async () => {
      const response = await api.get<{ data: Unit[]; statusCode: number }>(`/app/unities/user/${userId}`);
      return response.data.data;
    },
    enabled: !!userId,
  });

  const units = query.data ?? [];

  return {
    units,
    currentUnit: units[0],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useLinkSelfToUnit() {
  const { userId } = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unitId: string) => {
      const response = await api.post<{ data: Unit[]; statusCode: number }>(`/app/unities/${unitId}/link-self/${userId}`, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitsKeys.current() });
    },
  });
}
