import { z } from 'zod';

export const forgotPasswordSearchSchema = z.object({
  email: z.string().optional(),
});

export type ForgotPasswordSearch = z.infer<typeof forgotPasswordSearchSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
