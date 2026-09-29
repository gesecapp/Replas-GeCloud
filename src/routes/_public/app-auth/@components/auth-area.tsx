import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, ChevronRight, Eye, EyeOff, Loader2, LockKeyhole, SquareUser, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FontSizeSwitcher } from '@/components/nav-actions/font-size-switcher';
import { ThemeSwitcher } from '@/components/nav-actions/switch-theme';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemSeparator, ItemTitle } from '@/components/ui/item';
import { applyCnpjMask, applyCpfMask } from '@/lib/masks';
import { useAppLogin, useCheckDocument, useForgotPassword } from '../@hooks/use-app-login';
import {
  type AppAuthConfirmEmailFormData,
  type AppAuthDocumentFormData,
  type AppAuthPasswordFormData,
  appAuthConfirmEmailSchema,
  appAuthDocumentSchema,
  appAuthPasswordSchema,
} from '../@interface/app-auth.interface';

interface AuthAreaProps {
  onGuestMode: () => void;
}

type Step = 'document' | 'password' | 'confirm-email';

type AppAuthError = {
  response?: {
    data?: {
      originalError?: { message?: string };
      message?: string;
    };
  };
};

function getAppAuthErrorMessage(err: unknown, fallback: string) {
  const data = (err as AppAuthError)?.response?.data;
  return data?.originalError?.message || data?.message || fallback;
}

export function AuthArea({ onGuestMode }: AuthAreaProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('document');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const [storedDocument, setStoredDocument] = useState('');
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = useAppLogin();
  const checkDocument = useCheckDocument();
  const forgotPassword = useForgotPassword();

  const documentForm = useForm<AppAuthDocumentFormData>({
    resolver: zodResolver(appAuthDocumentSchema),
    defaultValues: { document: '' },
  });

  const passwordForm = useForm<AppAuthPasswordFormData>({
    resolver: zodResolver(appAuthPasswordSchema),
    defaultValues: { password: '' },
  });

  const confirmEmailForm = useForm<AppAuthConfirmEmailFormData>({
    resolver: zodResolver(appAuthConfirmEmailSchema),
    defaultValues: { email: '' },
  });

  function applyDocumentMask(value: string, type = documentType) {
    return type === 'cpf' ? applyCpfMask(value) : applyCnpjMask(value);
  }

  function handleDocumentChange(value: string) {
    documentForm.setValue('document', applyDocumentMask(value), { shouldValidate: true });
  }

  function onDocumentSubmit(data: AppAuthDocumentFormData) {
    const digits = data.document.replace(/\D/g, '');
    const expected = documentType === 'cpf' ? 11 : 14;

    if (digits.length !== expected) {
      documentForm.setError('document', { message: `${documentType.toUpperCase()} inválido` });
      return;
    }

    checkDocument.mutate(digits, {
      onSuccess: (result) => {
        if (!result.found || !result.guest) {
          toast.warning('Documento não cadastrado. Redirecionando para novo cadastro...');
          setTimeout(() => navigate({ to: '/new-access' }), 3000);
          return;
        }
        const guest = result.guest;
        setStoredDocument(digits);
        if (guest.email_confirmed) {
          setStep('password');
        } else {
          setStep('confirm-email');
        }
      },
      onError: () => {
        toast.error('Não foi possível verificar o documento. Tente novamente.');
      },
    });
  }

  function onPasswordSubmit(data: AppAuthPasswordFormData) {
    login.mutate({ document: storedDocument, password: data.password });
  }

  function onConfirmEmailSubmit(data: AppAuthConfirmEmailFormData) {
    forgotPassword.mutate(
      { email: data.email, document: storedDocument },
      {
        onSuccess: () => {
          toast.success('E-mail enviado. Verifique sua caixa de entrada para concluir.');
          setConfirmEmailSent(true);
        },
        onError: (err: unknown) => {
          const msg = getAppAuthErrorMessage(err, 'Erro ao enviar e-mail.');
          toast.error(msg);
        },
      },
    );
  }

  function backToDocument() {
    setStep('document');
    setStoredDocument('');
    setConfirmEmailSent(false);
    passwordForm.reset();
    confirmEmailForm.reset();
  }

  const secondaryActions = [
    {
      label: 'Novo cadastro',
      icon: <UserPlus className="size-6 stroke-blue-500" />,
      onClick: () => navigate({ to: '/new-access' }),
    },
    {
      label: 'Visitante? Clique para atualizar sua imagem',
      icon: <SquareUser className="size-6 stroke-green-500" />,
      onClick: onGuestMode,
    },
    {
      label: 'Esqueci minha senha',
      icon: <LockKeyhole className="size-6 stroke-purple-500" />,
      onClick: () => navigate({ to: '/forgot-password' }),
    },
  ];

  return (
    <ItemGroup className="gap-6!">
      <ItemContent>
        <ItemHeader className="w-full">
          <ItemTitle className="text-2xl">Acesso do Usuário</ItemTitle>
          <ItemActions>
            <FontSizeSwitcher />
            <ThemeSwitcher />
          </ItemActions>
        </ItemHeader>
        <ItemDescription>
          {step === 'document' && 'Digite seu CPF ou CNPJ para continuar'}
          {step === 'password' && 'Digite sua senha para acessar'}
          {step === 'confirm-email' && !confirmEmailSent && 'Confirme seu e-mail para concluir o cadastro'}
          {step === 'confirm-email' && confirmEmailSent && 'Verifique sua caixa de entrada para concluir o cadastro'}
        </ItemDescription>
      </ItemContent>

      {step === 'document' && (
        <Form {...documentForm}>
          <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <ButtonGroup className="w-full sm:order-2 sm:w-fit">
                {(['cpf', 'cnpj'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={documentType === type ? 'default' : 'outline'}
                    className="h-12! flex-1 sm:flex-none"
                    aria-pressed={documentType === type}
                    onClick={() => {
                      setDocumentType(type);
                      documentForm.setValue('document', '');
                    }}
                  >
                    {type.toUpperCase()}
                  </Button>
                ))}
              </ButtonGroup>

              <FormField
                control={documentForm.control}
                name="document"
                render={({ field }) => (
                  <FormItem className="flex-1 sm:order-1">
                    <FormLabel>{documentType === 'cpf' ? 'CPF' : 'CNPJ'} *</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        className="h-12!"
                        maxLength={documentType === 'cpf' ? 14 : 18}
                        placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                        {...field}
                        onChange={(e) => handleDocumentChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button variant="blue" className="h-12! text-base" disabled={checkDocument.isPending} type="submit">
              {checkDocument.isPending && <Loader2 className="size-4 animate-spin" />}
              Continuar
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </Form>
      )}

      {step === 'password' && (
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input autoFocus className="h-12!" placeholder="Digite sua senha" type={showPassword ? 'text' : 'password'} {...field} />
                      <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} type="button">
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="h-12! w-full" disabled={login.isPending} type="submit">
              {login.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Entrar
            </Button>

            <Button className="w-full" variant="ghost" type="button" onClick={backToDocument}>
              <ArrowLeft className="mr-2 size-4" />
              Voltar
            </Button>

            <button className="w-full" onClick={() => navigate({ to: '/forgot-password' })} type="button">
              <ItemDescription className="text-muted-foreground underline decoration-dashed underline-offset-4 hover:text-foreground">Esqueceu a senha?</ItemDescription>
            </button>
          </form>
        </Form>
      )}

      {step === 'confirm-email' && !confirmEmailSent && (
        <Form {...confirmEmailForm}>
          <form onSubmit={confirmEmailForm.handleSubmit(onConfirmEmailSubmit)} className="flex flex-col gap-4">
            <ItemDescription>Identificamos que seu e-mail ainda não foi confirmado. Informe seu e-mail para receber o link de confirmação.</ItemDescription>

            <FormField
              control={confirmEmailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input autoFocus className="h-12!" placeholder="seu@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="h-12! w-full" disabled={forgotPassword.isPending} type="submit">
              {forgotPassword.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Enviar E-mail
            </Button>

            <Button className="w-full" variant="ghost" type="button" onClick={backToDocument}>
              <ArrowLeft className="mr-2 size-4" />
              Voltar
            </Button>
          </form>
        </Form>
      )}

      {step === 'confirm-email' && confirmEmailSent && (
        <Button className="h-12! w-full" onClick={backToDocument}>
          Voltar ao início
        </Button>
      )}

      {step === 'document' && (
        <ItemGroup className="gap-0">
          <div className="flex items-center gap-4 py-2 text-muted-foreground text-sm">
            <ItemSeparator className="flex-1" />
            <ItemDescription>ou continue com</ItemDescription>
            <ItemSeparator className="flex-1" />
          </div>

          {secondaryActions.map((action) => (
            <button key={action.label} type="button" onClick={action.onClick} className="flex min-h-14 w-full cursor-pointer items-center gap-3 p-2 text-left hover:bg-secondary">
              <div className="flex size-10 shrink-0 items-center justify-center">{action.icon}</div>
              <ItemDescription className="flex-1">{action.label}</ItemDescription>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </ItemGroup>
      )}
    </ItemGroup>
  );
}
