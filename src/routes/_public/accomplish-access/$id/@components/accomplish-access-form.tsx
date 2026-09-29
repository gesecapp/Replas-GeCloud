import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Save, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImagePreview from '@/components/ui/image-preview';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent } from '@/components/ui/item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applyCnpjMask, applyCpfMask, applyDateMask, applyPhoneMask } from '@/lib/masks';
import { cn } from '@/lib/utils';
import type { AccomplishAccessGuestData, AccomplishAccessPayload } from '../@hooks/use-accomplish-access-api';
import { useLookupAccomplishAccessParent } from '../@hooks/use-accomplish-access-api';
import { type AccomplishAccessFormData, accomplishAccessSchema, userTypeOptions, userTypesNeedingResponsible } from '../@interface/accomplish-access.schema';

function getLookupErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { originalError?: { message?: unknown }; message?: unknown } } }).response?.data;
  const message = data?.originalError?.message ?? data?.message;
  return typeof message === 'string' ? message : 'Não foi possível buscar o responsável.';
}

interface AccomplishAccessFormProps {
  inviteId: string;
  guest: AccomplishAccessGuestData;
  onSubmit: (payload: AccomplishAccessPayload) => void;
  isLoading?: boolean;
}

function formatDateInputFromIso(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateToIso(value?: string): string | undefined {
  if (!value || value.length < 10) return undefined;
  const [day, month, year] = value.split('/');
  const iso = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(iso.getTime())) return undefined;
  return iso.toISOString();
}

export function AccomplishAccessForm({ inviteId, guest, onSubmit, isLoading }: AccomplishAccessFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [responsibleCpf, setResponsibleCpf] = useState('');
  const [responsibleLabel, setResponsibleLabel] = useState('');
  const lookupParent = useLookupAccomplishAccessParent(inviteId);

  const form = useForm<AccomplishAccessFormData>({
    resolver: zodResolver(accomplishAccessSchema),
    defaultValues: {
      name: guest.name ?? '',
      birthDate: formatDateInputFromIso(guest.birthday),
      primaryPhone: guest.telephones?.[0] ? applyPhoneMask(guest.telephones[0]) : '',
      secondaryPhone: guest.telephones?.[1] ? applyPhoneMask(guest.telephones[1]) : '',
      password: '',
      confirmPassword: '',
      url_image: guest.url_image ?? [],
      parentId: '',
    },
  });

  const urlImages = form.watch('url_image');
  const userTypeWatch = form.watch('userType');
  const maskedDocument = guest.is_legal_person ? applyCnpjMask(guest.document ?? '') : applyCpfMask(guest.document ?? '');
  const needsResponsible = (userTypesNeedingResponsible as readonly string[]).includes(userTypeWatch);

  function handleLookupResponsible() {
    const digits = responsibleCpf.replace(/\D/g, '');
    if (digits.length !== 11) {
      form.setError('parentId', { message: 'Informe um CPF válido do responsável' });
      return;
    }

    lookupParent.mutate(
      { document: digits, userType: userTypeWatch },
      {
        onSuccess: (res) => {
          if (res.found && res.parent) {
            form.setValue('parentId', res.parent.id, { shouldValidate: true });
            const typeLabel = res.parent.user_type === 'colaborador' ? 'Colaborador' : 'Morador';
            setResponsibleLabel(`${res.parent.name} (${typeLabel})`);
            toast.success('Responsável encontrado.');
          } else {
            form.setValue('parentId', '', { shouldValidate: true });
            setResponsibleLabel('');
            toast.warning('Nenhum responsável encontrado com este CPF na sua instituição.');
          }
        },
        onError: (err) => {
          toast.error(getLookupErrorMessage(err));
        },
      },
    );
  }

  function handleFormSubmit(data: AccomplishAccessFormData) {
    const phones: string[] = [data.primaryPhone.replace(/\D/g, '')];
    if (data.secondaryPhone?.trim()) phones.push(data.secondaryPhone.replace(/\D/g, ''));

    const payload: AccomplishAccessPayload = {
      name: data.name,
      password: data.password,
      is_legal_person: !!guest.is_legal_person,
      user_type: data.userType,
      telephones: phones,
      url_image: data.url_image,
    };

    if ((userTypesNeedingResponsible as readonly string[]).includes(data.userType) && data.parentId?.trim()) {
      payload.parentId = data.parentId.trim();
    }

    const iso = formatDateToIso(data.birthDate);
    if (iso) payload.birthday = iso;

    onSubmit(payload);
  }

  function handleImageChange(image: string | undefined) {
    form.setValue('url_image', image ? [image] : [], { shouldValidate: true });
  }

  const responsibleSection: FormSection | null = needsResponsible
    ? {
        title: 'Morador responsável',
        description:
          userTypeWatch === 'prestador_de_servico'
            ? 'Informe o CPF do morador ou colaborador responsável pelo seu vínculo.'
            : 'Informe o CPF do morador responsável pelo seu cadastro.',
        fields: [
          <FormField
            key="parentId"
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <input type="hidden" {...field} />
                <FormLabel>CPF do responsável *</FormLabel>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <FormControl className="flex-1">
                    <Input
                      placeholder="000.000.000-00"
                      maxLength={14}
                      value={responsibleCpf}
                      onChange={(e) => {
                        setResponsibleCpf(applyCpfMask(e.target.value));
                        field.onChange('');
                        setResponsibleLabel('');
                      }}
                      autoComplete="off"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={handleLookupResponsible}
                    disabled={lookupParent.isPending || responsibleCpf.replace(/\D/g, '').length !== 11}
                  >
                    {lookupParent.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                    Buscar
                  </Button>
                </div>
                {responsibleLabel ? <p className="text-emerald-700 text-sm dark:text-emerald-400">{responsibleLabel}</p> : null}
                <FormMessage />
              </FormItem>
            )}
          />,
        ],
      }
    : null;

  const sections: FormSection[] = [
    {
      title: 'Identificação',
      description: 'Dados do cadastro.',
      fields: [
        <FormItem key="document">
          <FormLabel>{guest.is_legal_person ? 'CNPJ' : 'CPF'}</FormLabel>
          <FormControl>
            <Input value={maskedDocument} disabled />
          </FormControl>
        </FormItem>,
        <FormItem key="email">
          <FormLabel>E-mail</FormLabel>
          <FormControl>
            <Input value={guest.email ?? ''} disabled />
          </FormControl>
        </FormItem>,
        <FormField
          key="userType"
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Usuário *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('parentId', '', { shouldValidate: true });
                  setResponsibleCpf('');
                  setResponsibleLabel('');
                }}
                value={field.value}
              >
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
    ...(responsibleSection ? [responsibleSection] : []),
    {
      title: 'Dados Pessoais',
      description: 'Informações do titular.',
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
          key="birthDate"
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  onChange={(event) => form.setValue('birthDate', applyDateMask(event.target.value), { shouldValidate: true })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Telefones',
      fields: [
        <FormField
          key="primaryPhone"
          control={form.control}
          name="primaryPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Primário *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  onChange={(event) => form.setValue('primaryPhone', applyPhoneMask(event.target.value), { shouldValidate: true })}
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
              <FormLabel>
                Telefone Secundário <span className="font-normal text-muted-foreground">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  onChange={(event) => form.setValue('secondaryPhone', applyPhoneMask(event.target.value), { shouldValidate: true })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Acesso',
      description: 'Defina uma senha para acessar o aplicativo.',
      fields: [
        <FormField
          key="password"
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" />
                  <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} type="button">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="confirmPassword"
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirme a senha" />
                  <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Foto',
      description: 'Imagem de identificação (obrigatória).',
      layout: 'vertical',
      fields: [
        <FormField
          key="url_image"
          control={form.control}
          name="url_image"
          render={({ fieldState }) => (
            <ItemContent className={cn('gap-3')}>
              <ImagePreview value={urlImages?.[0]} onChange={handleImageChange} height={200} />
              {fieldState.error?.message && <FormMessage>{fieldState.error.message}</FormMessage>}
            </ItemContent>
          )}
        />,
      ],
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <DefaultFormLayout sections={sections} />

        <ItemActions className="flex justify-end py-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Concluir cadastro
          </Button>
        </ItemActions>
      </form>
    </Form>
  );
}
