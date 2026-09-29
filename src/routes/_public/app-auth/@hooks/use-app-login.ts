import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { AppLoginResponse, GuestByDocumentSearchResponse, ValidateTokenResponse } from '../@interface/app-auth.interface';

export function useAppLogin() {
  const { setAuth } = useAppAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ document, password }: { document: string; password: string }) => {
      const response = await api.post<AppLoginResponse>('/app/login', {
        document: document.replace(/\D/g, ''),
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.data) {
        setAuth(data.data.token, data.data.id, '', data.data.userType);
        toast.success('Login realizado com sucesso!');
        navigate({ to: '/', replace: true });
      }
    },
  });
}

export function useGuestByDocument() {
  return useMutation({
    mutationFn: async (document: string) => {
      const response = await api.get<{ data: GuestByDocumentSearchResponse; statusCode: number }>('/app/guests/search/document', {
        params: { document },
      });
      return response.data.data;
    },
  });
}

export function useUpdateGuestImage() {
  return useMutation({
    mutationFn: async ({ id, url_image }: { id: string; url_image: string[] }) => {
      const response = await api.put<{ data: any; statusCode: number }>(`/app/guests/${id}/image`, {
        url_image,
      });
      return response.data.data;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email, document }: { email: string; document?: string }) => {
      await api.post('/app/auth/forgot-password', document ? { email, document } : { email });
    },
  });
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

export function useValidateRecoveryToken(token: string) {
  return useQuery({
    queryKey: ['validateRecoveryToken', token],
    queryFn: async () => {
      const response = await api.get<{ data: ValidateTokenResponse; statusCode: number; message: string }>(`/app/auth/reset-password/${token}`);
      return response.data.data;
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      await api.post('/app/auth/reset-password', { token, password });
    },
  });
}
