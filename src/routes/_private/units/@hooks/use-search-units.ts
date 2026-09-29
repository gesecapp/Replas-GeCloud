import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface UnitSearchResult {
  id: string;
  identifier: string;
  block?: string;
}

export function useSearchUnits(term: string) {
  const trimmed = term.trim();

  const query = useQuery({
    queryKey: ['app', 'unities', 'search', trimmed],
    queryFn: async () => {
      const response = await api.get<{ data: UnitSearchResult[]; statusCode: number }>('/app/unities/search', {
        params: { q: trimmed },
      });
      return response.data.data ?? [];
    },
    enabled: trimmed.length > 0,
  });

  return {
    results: query.data ?? [],
    isLoading: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
