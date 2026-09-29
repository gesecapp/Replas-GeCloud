import { Loader2, Save } from 'lucide-react';

import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImagePreview from '@/components/ui/image-preview';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemGroup } from '@/components/ui/item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSyncState, RegistrationStatusAlert } from '@/components/user-sync-alert';
import { useGetAppUser, useGetUserSyncStatus } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { applyDateMask, applyPhoneMask } from '@/lib/masks';
import { userTypeOptions } from '@/routes/_public/accomplish-access/$id/@interface/accomplish-access.schema';
import { useEditProfileForm } from '../@hooks/use-edit-profile-form';

export function ProfileForm() {
  const { userId } = useAppAuth();
  const { data: user, isLoading, isError } = useGetAppUser();
  const { data: syncStatus, isLoading: isLoadingSync } = useGetUserSyncStatus(userId);
  const syncState = getSyncState(syncStatus, isLoadingSync);
  const { form, onSubmit, isPending } = useEditProfileForm(user);

  const urlImages = form.watch('url_image');

  function handleImageChange(image: string | undefined) {
    form.setValue('url_image', image ? [image] : [], { shouldValidate: true });
  }

  if (isLoading) return <DefaultLoading />;

  const needsUserType = !user?.user_type;

  const sections: FormSection[] = [
    ...(needsUserType
      ? [
          {
            title: 'Tipo de Usuário',
            description: 'Necessário para concluir o cadastro.',
            fields: [
              <FormField
                key="userType"
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Usuário *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o tipo de usuário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />,
            ],
          },
        ]
      : []),
    {
      title: 'Dados Pessoais',
      description: 'Informações de identificação.',
      fields: [
        <FormField
          key="fullName"
          control={form.control}
          name="fullName"
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
          key="document"
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF *</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Acesso',
      description: 'Credenciais de acesso ao sistema.',
      fields: [
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
        <FormField
          key="password"
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Contato',
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
                <Input
                  {...field}
                  placeholder="(00) 00000-0000"
                  onChange={(e) => form.setValue('primaryPhone', applyPhoneMask(e.target.value))}
                  maxLength={15}
                  className={!field.value?.trim() ? 'border-destructive focus-visible:ring-destructive/20' : undefined}
                />
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
                <Input {...field} placeholder="(00) 00000-0000" onChange={(e) => form.setValue('secondaryPhone', applyPhoneMask(e.target.value))} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Foto de Perfil',
      description: 'Imagem de identificação do usuário.',
      layout: 'vertical',
      fields: [
        <ItemContent key="url_image" className="gap-3">
          <ImagePreview value={urlImages[0]} onChange={handleImageChange} height={200} />
        </ItemContent>,
      ],
    },
  ];

  return (
    <ItemGroup className="gap-6">
      {syncState !== null && syncState !== 'synchronized' && <RegistrationStatusAlert syncStatus={syncStatus} isLoading={isLoadingSync} />}

      {isError && <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">Erro ao carregar seus dados.</div>}

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <DefaultFormLayout sections={sections} />

          <ItemActions className="flex justify-end py-6">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {!isLoading && <Save className="size-4"></Save>}
              Salvar
            </Button>
          </ItemActions>
        </form>
      </Form>
    </ItemGroup>
  );
}
