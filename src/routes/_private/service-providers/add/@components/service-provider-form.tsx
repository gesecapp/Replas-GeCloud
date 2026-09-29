import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Share2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImagePreview from '@/components/ui/image-preview';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemDescription, ItemGroup } from '@/components/ui/item';
import { getSyncState, RegistrationStatusAlert } from '@/components/user-sync-alert';
import { useGetGuestById, useGetUserSyncStatus } from '@/hooks/use-access-user-api';
import { applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import type { CreateGuestProps, GuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';
import { type ServiceProviderFormData, serviceProviderFormSchema } from '../@interface/add-service-provider.schema';

export function ServiceProviderForm({ parentId, guestId, initialData, onSubmit, onCancel, isLoading, requireCpfAndImage = false }: ServiceProviderFormProps) {
  const { data: fetchedGuest, isLoading: isLoadingGuest } = useGetGuestById(guestId || null);
  const { data: syncStatus, isLoading: isLoadingSync } = useGetUserSyncStatus(guestId);
  const syncState = getSyncState(syncStatus, isLoadingSync);
  const [phoneInput, setPhoneInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const guestData = fetchedGuest || initialData;

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const form = useForm<ServiceProviderFormData>({
    resolver: zodResolver(serviceProviderFormSchema),
    defaultValues: {
      name: '',
      document: '',
      birthDate: '',
      email: '',
      telephones: [],
      url_image: [],
    },
  });

  const urlImages = form.watch('url_image');
  const telephones = form.watch('telephones') || [];
  const isPartialRegistration = !guestId && (!urlImages || urlImages.length === 0);

  useEffect(() => {
    if (guestData) {
      form.reset({
        name: guestData.name || '',
        document: applyCpfMask(guestData.document || ''),
        birthDate: guestData.birthday
          ? (() => {
              const d = new Date(guestData.birthday);
              return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            })()
          : '',
        email: guestData.email || '',
        telephones: guestData.telephones || [],
        url_image: guestData.url_image || [],
      });
    }
  }, [guestData, form]);

  function formatDateToISO(dateString: string | undefined): string {
    if (!dateString || dateString.length < 10) return '';
    try {
      const [day, month, year] = dateString.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
    } catch {
      return '';
    }
  }

  function handleAddPhone() {
    if (phoneInput.trim()) {
      form.setValue('telephones', [...telephones, phoneInput.trim()], { shouldValidate: true });
      setPhoneInput('');
    }
  }

  function handleRemovePhone(index: number) {
    form.setValue(
      'telephones',
      telephones.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  function handleFormSubmit(data: ServiceProviderFormData) {
    if (cooldown > 0) return;

    if (requireCpfAndImage) {
      const cpfClean = data.document?.replace(/\D/g, '');
      if (cpfClean?.length !== 11) {
        form.setError('document', { type: 'manual', message: 'CPF é obrigatório e deve ter 11 dígitos' });
        return;
      }
      if (!data.url_image || data.url_image.length === 0) {
        form.setError('url_image', { type: 'manual', message: 'Pelo menos uma foto é obrigatória' });
        return;
      }
    }

    const isoDate = formatDateToISO(data.birthDate);

    const payload: CreateGuestProps & { id?: string } = {
      parentId,
      user_type: 'prestador_de_servico',
    };

    if (guestId) {
      payload.id = guestId;

      const originalImages = JSON.stringify(guestData?.url_image || []);
      const currentImages = JSON.stringify(data.url_image || []);
      if (currentImages !== originalImages && data.url_image && data.url_image.length > 0) {
        payload.url_image = data.url_image;
      }

      if (data.name !== (guestData?.name || '')) payload.name = data.name;

      const cpfClean = data.document?.replace(/\D/g, '');
      if (cpfClean !== (guestData?.document || '')) payload.document = cpfClean;

      if (isoDate !== (guestData?.birthday || '')) payload.birthday = isoDate;
      if (data.email !== (guestData?.email || '')) payload.email = data.email;

      const originalPhones = JSON.stringify(guestData?.telephones || []);
      const currentPhones = JSON.stringify(data.telephones || []);
      if (currentPhones !== originalPhones && data.telephones && data.telephones.length > 0) {
        payload.telephones = data.telephones.map((p) => p.replace(/\D/g, ''));
      }
    } else {
      if (data.name) payload.name = data.name;

      const cpfClean = data.document?.replace(/\D/g, '');
      if (cpfClean) payload.document = cpfClean;

      if (isoDate) payload.birthday = isoDate;
      if (data.email) payload.email = data.email;

      if (data.telephones && data.telephones.length > 0) {
        payload.telephones = data.telephones.map((p) => p.replace(/\D/g, ''));
      }

      if (data.url_image && data.url_image.length > 0) {
        payload.url_image = data.url_image;
      }
    }

    setCooldown(5);
    onSubmit(payload);
  }

  function handleImageChange(image: string | undefined) {
    form.setValue('url_image', image ? [image] : [], { shouldValidate: true });
  }

  if (isLoadingGuest) return <DefaultLoading />;

  const sections: FormSection[] = [
    {
      title: 'Identificação',
      description: 'Dados do prestador de serviço.',
      fields: [
        <FormField
          key="name"
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: João da Silva" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="document"
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF{requireCpfAndImage || (urlImages && urlImages.length > 0) ? ' *' : ''}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="000.000.000-00"
                  onChange={(e) => form.setValue('document', applyCpfMask(e.target.value))}
                  maxLength={14}
                  disabled={!!guestData?.document}
                />
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
        <FormField
          key="email"
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="email@exemplo.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Telefones',
      description: 'Telefones para contato do prestador.',
      fields: [
        <ItemContent key="phones" className="gap-3">
          <div className="flex gap-2">
            <Input value={phoneInput} onChange={(e) => setPhoneInput(applyPhoneMask(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} className="flex-1" />
            <Button type="button" variant="outline" onClick={handleAddPhone} disabled={!phoneInput.trim()}>
              <Plus className="mr-1 size-4" />
              Adicionar
            </Button>
          </div>
          {telephones.length > 0 ? (
            <ItemContent className="gap-1">
              {telephones.map((phone, index) => (
                <div key={phone} className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemovePhone(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                  <ItemDescription>{applyPhoneMask(phone)}</ItemDescription>
                </div>
              ))}
            </ItemContent>
          ) : (
            <ItemDescription>Nenhum telefone adicionado</ItemDescription>
          )}
        </ItemContent>,
      ],
    },
    {
      title: 'Foto',
      description: 'Imagem de identificação do prestador.',
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
    <ItemGroup className="gap-6">
      {syncState !== null && syncState !== 'synchronized' && <RegistrationStatusAlert syncStatus={syncStatus} isLoading={isLoadingSync} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <DefaultFormLayout sections={sections} />

          <ItemActions className="flex justify-end py-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || cooldown > 0} className={isPartialRegistration ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {!isLoading && isPartialRegistration && <Share2 className="size-4" />}
              {cooldown > 0 ? `Aguarde ${cooldown}s` : isPartialRegistration ? 'Salvar e Compartilhar Link' : 'Salvar'}
            </Button>
          </ItemActions>
        </form>
      </Form>
    </ItemGroup>
  );
}

interface ServiceProviderFormProps {
  parentId: string;
  guestId?: string | null;
  initialData?: Partial<GuestProps>;
  onSubmit: (data: CreateGuestProps & { id?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  requireCpfAndImage?: boolean;
}
