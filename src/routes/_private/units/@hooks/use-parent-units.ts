import { useQuery } from '@tanstack/react-query';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { Unit } from '@/routes/_private/units/@interface/unit.interface';

export function useParentUnits(enabled: boolean) {
  const { userId } = useAppAuth();

  const query = useQuery({
    queryKey: ['app', 'unities', 'parent', userId],
    queryFn: async () => {
      const response = await api.get<{ data: Unit[]; statusCode: number }>(`/app/unities/user/${userId}/parent`);
      return response.data.data ?? [];
    },
    enabled: !!userId && enabled,
  });

  return {
    results: query.data ?? [],
    isLoading: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
