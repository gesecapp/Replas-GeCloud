import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import type { GuestByDocumentSearchResponse } from '../../app-auth/@interface/app-auth.interface';

export interface NewAccessPayload {
  document: string;
  is_legal_person: boolean;
  email: string;
}

export function useCheckDocument() {
  return useMutation({
    mutationFn: async (document: string) => {
      const response = await api.get<{ data: GuestByDocumentSearchResponse; statusCode: number }>('/app/guests/search/document', {
        params: { document: document.replace(/\D/g, '') },
      });
      return response.data.data;
    },
  });
}

export function useCreateNewAccess() {
  return useMutation({
    mutationFn: async (payload: NewAccessPayload) => {
      const response = await api.post<{ data: { id: string }; statusCode: number }>('/app/new-access', payload);
      return response.data.data;
    },
  });
}
