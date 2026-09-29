import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { CreateGuestProps, GuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';

export function useGetGuestByInviteId(id: string | null) {
  return useQuery({
    queryKey: ['app-guest-invite', id],
    queryFn: async () => {
      const response = await api.get<{ data: GuestInviteData; statusCode: number }>(`/app/guests/invite-by-id/${id}`);
      return response.data.data;
    },
    enabled: !!id && typeof id === 'string',
    retry: false,
  });
}

export function useFinalizeGuestInvite() {
  return useMutation({
    mutationFn: async ({ guestId, data }: FinalizeGuestInviteParams) => {
      await api.put(`/app/guests/${guestId}/invite`, data);
    },
  });
}

interface GuestInviteData extends Partial<GuestProps> {
  id?: string;
  parentId?: string;
}

interface FinalizeGuestInviteParams {
  guestId: string;
  data: CreateGuestProps & { id?: string };
}
