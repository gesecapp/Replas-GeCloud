import { z } from 'zod';

export const newAccessSchema = z
  .object({
    documentType: z.enum(['cpf', 'cnpj']),
    document: z.string().min(1, 'Documento obrigatório'),
    documentChecked: z.boolean(),
    documentExists: z.boolean(),
    email: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const digits = data.document.replace(/\D/g, '');

    if (data.documentType === 'cpf' && digits.length !== 11) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CPF inválido', path: ['document'] });
    }

    if (data.documentType === 'cnpj' && digits.length !== 14) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CNPJ inválido', path: ['document'] });
    }

    if (data.documentChecked && !data.documentExists) {
      const email = data.email?.trim() ?? '';
      if (!email) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'E-mail obrigatório', path: ['email'] });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'E-mail inválido', path: ['email'] });
      }
    }
  });

export type NewAccessFormData = z.infer<typeof newAccessSchema>;
