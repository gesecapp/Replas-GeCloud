import { z } from 'zod';

export const addServiceProviderSearchSchema = z.object({
  guestId: z.string().optional(),
});

export type AddServiceProviderSearch = z.infer<typeof addServiceProviderSearchSchema>;

export const serviceProviderFormSchema = z
  .object({
    name: z.string().min(1, 'Campo obrigatório'),
    document: z.string().optional(),
    birthDate: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    telephones: z.array(z.string()),
    url_image: z.array(z.string()),
  })
  .refine(
    (data) => {
      const hasImage = data.url_image && data.url_image.length > 0;
      if (hasImage) {
        const cpfClean = data.document?.replace(/\D/g, '');
        return !!cpfClean && cpfClean.length === 11;
      }
      return true;
    },
    {
      message: 'CPF é obrigatório ao inserir uma foto',
      path: ['document'],
    },
  );

export type ServiceProviderFormData = z.infer<typeof serviceProviderFormSchema>;
