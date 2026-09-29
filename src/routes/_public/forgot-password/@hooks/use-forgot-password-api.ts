import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email, document }: { email: string; document?: string }) => {
      await api.post('/app/auth/forgot-password', document ? { email, document } : { email });
    },
  });
}
