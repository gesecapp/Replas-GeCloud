import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { applyCnpjMask, applyCpfMask } from '@/lib/masks';
import { useCheckDocument, useCreateNewAccess } from '../@hooks/use-new-access-api';
import { type NewAccessFormData, newAccessSchema } from '../@interface/new-access.schema';

export function NewAccessForm({ onSuccess }: NewAccessFormProps) {
  const navigate = useNavigate();
  const checkDocument = useCheckDocument();
  const createNewAccess = useCreateNewAccess();

  const form = useForm<NewAccessFormData>({
    resolver: zodResolver(newAccessSchema),
    defaultValues: {
      documentType: 'cpf',
      document: '',
      documentChecked: false,
      documentExists: false,
      email: '',
    },
  });

  const documentType = form.watch('documentType');
  const documentChecked = form.watch('documentChecked');
  const documentExists = form.watch('documentExists');
  const canSubmit = documentChecked && !documentExists;

  function applyDocumentMask(value: string, type = documentType) {
    return type === 'cpf' ? applyCpfMask(value) : applyCnpjMask(value);
  }

  function resetCheckState() {
    form.setValue('documentChecked', false);
    form.setValue('documentExists', false);
  }

  function handleDocumentTypeChange(type: 'cpf' | 'cnpj') {
    form.setValue('documentType', type, { shouldValidate: true });
    form.setValue('document', '', { shouldValidate: true });
    resetCheckState();
  }

  function handleDocumentChange(value: string) {
    form.setValue('document', applyDocumentMask(value), { shouldValidate: true });
    resetCheckState();
  }

  function handleCheck() {
    const document = form.getValues('document');
    const digits = document.replace(/\D/g, '');
    const expected = documentType === 'cpf' ? 11 : 14;

    if (digits.length !== expected) {
      form.setError('document', { message: `${documentType.toUpperCase()} inválido` });
      return;
    }

    checkDocument.mutate(digits, {
      onSuccess: (result) => {
        form.setValue('documentChecked', true);
        if (result.found && result.guest) {
          form.setValue('documentExists', true);
          toast.warning('Você já tem cadastro. Redirecionando para login...');
          setTimeout(() => navigate({ to: '/app-auth' }), 3000);
          return;
        }
        form.setValue('documentExists', false);
        form.clearErrors('document');
        toast.success('Documento liberado para cadastro.');
      },
      onError: () => {
        toast.error('Não foi possível verificar o documento. Tente novamente.');
      },
    });
  }

  function onSubmit(data: NewAccessFormData) {
    if (!canSubmit) return;
    const email = (data.email ?? '').trim();
    createNewAccess.mutate(
      {
        document: data.document.replace(/\D/g, ''),
        is_legal_person: data.documentType === 'cnpj',
        email,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.originalError?.message || err?.response?.data?.message || 'Erro ao iniciar cadastro.';
          if (typeof msg === 'string' && /e-?mail.*j[aá].*cadastrad/i.test(msg)) {
            toast.warning('E-mail já cadastrado. Redirecionando para recuperação de senha...');
            setTimeout(() => navigate({ to: '/forgot-password', search: { email } }), 2000);
            return;
          }
          toast.error(msg);
        },
      },
    );
  }

  return (
    <ItemGroup className="gap-6!">
      <ItemContent>
        <ItemTitle className="text-2xl">Novo Cadastro</ItemTitle>
        <ItemDescription>Informe seu documento para iniciar o cadastro.</ItemDescription>
      </ItemContent>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de documento</FormLabel>
                <ButtonGroup className="w-full sm:w-fit">
                  {(['cpf', 'cnpj'] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      size="sm"
                      variant={field.value === type ? 'default' : 'outline'}
                      className="min-w-24 flex-1 sm:flex-none"
                      aria-pressed={field.value === type}
                      onClick={() => handleDocumentTypeChange(type)}
                      disabled={documentChecked && documentExists}
                    >
                      {type.toUpperCase()}
                    </Button>
                  ))}
                </ButtonGroup>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{documentType === 'cpf' ? 'CPF' : 'CNPJ'} *</FormLabel>
                <div className="flex gap-3">
                  <FormControl>
                    <Input
                      autoFocus
                      className="h-12!"
                      maxLength={documentType === 'cpf' ? 14 : 18}
                      placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      {...field}
                      onChange={(e) => handleDocumentChange(e.target.value)}
                      disabled={documentChecked && !documentExists}
                    />
                  </FormControl>
                  {!documentChecked && (
                    <Button type="button" className="h-12!" variant="primary" onClick={handleCheck} disabled={checkDocument.isPending || !field.value?.trim()}>
                      {checkDocument.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                      Continuar
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {canSubmit && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input className="h-12!" placeholder="seu@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {canSubmit && (
            <Button variant="blue" className="h-12! w-full text-base" disabled={createNewAccess.isPending} type="submit">
              {createNewAccess.isPending && <Loader2 className="size-4 animate-spin" />}
              Pré-cadastrar
            </Button>
          )}
        </form>
      </Form>

      <Button variant="ghost" onClick={() => navigate({ to: '/app-auth' })} type="button">
        <ArrowLeft className="size-4" />
        Voltar ao login
      </Button>
    </ItemGroup>
  );
}

interface NewAccessFormProps {
  onSuccess: () => void;
}
