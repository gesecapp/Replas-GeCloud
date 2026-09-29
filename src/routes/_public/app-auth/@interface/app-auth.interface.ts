import { z } from 'zod';
import type { AppUserType } from '@/lib/permissions';

export const appAuthDocumentSchema = z.object({
  document: z.string().min(11, 'Documento inválido'),
});

export type AppAuthDocumentFormData = z.infer<typeof appAuthDocumentSchema>;

export const appAuthPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type AppAuthPasswordFormData = z.infer<typeof appAuthPasswordSchema>;

export const appAuthConfirmEmailSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

export type AppAuthConfirmEmailFormData = z.infer<typeof appAuthConfirmEmailSchema>;

export const appAuthSchema = z.object({
  document: z.string().min(11, 'Documento inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export type AppAuthFormData = z.infer<typeof appAuthSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface AppLoginResponse {
  data: { token: string; id: string; userType: AppUserType };
  statusCode: number;
  message: string;
}

export interface ValidateTokenResponse {
  name?: string;
  document?: string;
  is_legal_person?: boolean;
}

/** Guest fields returned by GET /guests/search/document when `found` is true */
export interface GuestByDocumentLookupFields {
  id?: string;
  _id?: string;
  name?: string;
  document?: string;
  is_legal_person?: boolean;
  url_image?: string[];
  email_confirmed?: boolean;
  has_password?: boolean;
}

export interface GuestByDocumentSearchResponse {
  found: boolean;
  guest: GuestByDocumentLookupFields | null;
}
