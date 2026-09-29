import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImagePreview from '@/components/ui/image-preview';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import { applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import type { CreateGuestProps, GuestProps, UserType } from '@/routes/_private/access-user/@interface/access-user.interface';
import { type NewUserFormData, newUserFormSchema } from '../@interface/new-user.interface';

interface NewUserFormProps {
  initialData: Partial<GuestProps> & { parentId?: string };
  guestId: string | null;
  onSubmit: (data: CreateGuestProps & { id?: string }) => void;
  isLoading?: boolean;
}

const USER_TYPE_LABEL: Record<UserType, string> = {
  visitante: 'visitante',
  dependente: 'dependente',
  prestador_de_servico: 'prestador de serviço',
};

export function NewUserForm({ initialData, guestId, onSubmit, isLoading }: NewUserFormProps) {
  const userType = (initialData.user_type as UserType) || 'visitante';
  const userTypeLabel = USER_TYPE_LABEL[userType] || 'usuário';
  const form = useForm<NewUserFormData>({
    resolver: zodResolver(newUserFormSchema),
    defaultValues: {
      name: '',
      document: '',
      birthDate: '',
      email: '',
      primaryPhone: '',
      secondaryPhone: '',
      url_image: [],
    },
  });

  const urlImages = form.watch('url_image');

  useEffect(() => {
    if (initialData) {
      const telephones = initialData.telephones || [];
      const birthDateFormatted = initialData.birthday ? new Date(initialData.birthday).toLocaleDateString('pt-BR') : '';

      form.reset({
        name: initialData.name || '',
        document: applyCpfMask(initialData.document || ''),
        birthDate: birthDateFormatted,
        email: initialData.email || '',
        primaryPhone: telephones[0] ? applyPhoneMask(telephones[0]) : '',
        secondaryPhone: telephones[1] ? applyPhoneMask(telephones[1]) : '',
        url_image: initialData.url_image || [],
      });
    }
  }, [initialData, form]);

  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
    } catch {
      return '';
    }
  }

  function handleFormSubmit(data: NewUserFormData) {
    const telephones: string[] = [];
    if (data.primaryPhone?.trim()) telephones.push(data.primaryPhone.replace(/\D/g, ''));
    if (data.secondaryPhone?.trim()) telephones.push(data.secondaryPhone.replace(/\D/g, ''));

    const payload: CreateGuestProps & { id?: string } = {
      parentId: initialData.parentId || '',
      user_type: userType,
    };

    if (guestId) {
      payload.id = guestId;

      const originalImages = JSON.stringify(initialData?.url_image || []);
      const currentImages = JSON.stringify(data.url_image || []);
      if (currentImages !== originalImages && data.url_image && data.url_image.length > 0) {
        payload.url_image = data.url_image;
      }

      if (data.name !== (initialData?.name || '')) payload.name = data.name;

      const cpfClean = data.document?.replace(/\D/g, '');
      if (cpfClean) payload.document = cpfClean;

      const isoDate = formatDateToISO(data.birthDate);
      if (isoDate !== (initialData?.birthday || '')) payload.birthday = isoDate;
      if (data.email !== (initialData?.email || '')) payload.email = data.email;

      const originalPhones = JSON.stringify(initialData?.telephones || []);
      const currentPhones = JSON.stringify(telephones);
      if (currentPhones !== originalPhones && telephones.length > 0) {
        payload.telephones = telephones.map((p) => p.replace(/\D/g, ''));
      }
    } else {
      if (data.name) payload.name = data.name;
      const cpfClean = data.document?.replace(/\D/g, '');
      if (cpfClean) payload.document = cpfClean;
      const isoDate = formatDateToISO(data.birthDate);
      if (isoDate) payload.birthday = isoDate;
      if (data.email) payload.email = data.email;
      if (telephones.length > 0) {
        payload.telephones = telephones.map((p) => p.replace(/\D/g, ''));
      }
      if (data.url_image && data.url_image.length > 0) {
        payload.url_image = data.url_image;
      }
    }

    onSubmit(payload);
  }

  function handleImageChange(image: string | undefined) {
    form.setValue('url_image', image ? [image] : [], { shouldValidate: true });
  }

  const sections: FormSection[] = [
    {
      title: 'Identificação',
      description: 'Dados pessoais para finalizar o cadastro.',
      fields: [
        <FormField
          key="name"
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="birthDate"
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="DD/MM/AAAA" onChange={(e) => form.setValue('birthDate', applyDateMask(e.target.value))} maxLength={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Telefones',
      description: 'Telefones para contato.',
      fields: [
        <FormField
          key="primaryPhone"
          control={form.control}
          name="primaryPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Primário</FormLabel>
              <FormControl>
                <Input {...field} onChange={(e) => form.setValue('primaryPhone', applyPhoneMask(e.target.value))} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="secondaryPhone"
          control={form.control}
          name="secondaryPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Secundário</FormLabel>
              <FormControl>
                <Input {...field} onChange={(e) => form.setValue('secondaryPhone', applyPhoneMask(e.target.value))} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Acesso',
      description: 'Dados para identificação e contato.',
      fields: [
        <FormField
          key="document"
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input {...field} onChange={(e) => form.setValue('document', applyCpfMask(e.target.value))} maxLength={14} disabled={!!initialData?.document} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="email"
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Foto',
      description: `Imagem para identificação do ${userTypeLabel}.`,
      layout: 'vertical',
      fields: [
        <FormField
          key="url_image"
          control={form.control}
          name="url_image"
          render={({ fieldState }) => (
            <ItemContent className="gap-3">
              <ImagePreview value={urlImages[0]} onChange={handleImageChange} height={200} />
              {fieldState.error?.message && <FormMessage>{fieldState.error.message}</FormMessage>}
            </ItemContent>
          )}
        />,
      ],
    },
  ];

  return (
    <ItemGroup className="gap-4">
      <ItemHeader>
        <ItemTitle className="text-lg">Finalizar Cadastro</ItemTitle>
      </ItemHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <DefaultFormLayout sections={sections} />
          <ItemActions className="justify-end py-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {!isLoading && <Save className="size-4" />}
              Salvar
            </Button>
          </ItemActions>
        </form>
      </Form>
    </ItemGroup>
  );
}
