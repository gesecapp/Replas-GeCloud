import { z } from 'zod';

export const newUserFormSchema = z
  .object({
    name: z.string().min(1, 'Campo obrigatório'),
    document: z.string().optional(),
    birthDate: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    primaryPhone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    url_image: z.array(z.string()),
  })
  .refine((data) => (data.document?.replace(/\D/g, '') || '').length === 11, {
    message: 'CPF válido é obrigatório para concluir o cadastro',
    path: ['document'],
  })
  .refine((data) => Array.isArray(data.url_image) && data.url_image.length > 0 && !!data.url_image[0], {
    message: 'A foto é obrigatória para concluir o cadastro',
    path: ['url_image'],
  });

export type NewUserFormData = z.infer<typeof newUserFormSchema>;
