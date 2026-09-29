import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { applyCnpjMask, applyCpfMask } from '@/lib/masks';
import { useResetPassword, useValidateRecoveryToken } from '../@hooks/use-app-login';
import { type ResetPasswordFormData, resetPasswordSchema } from '../@interface/app-auth.interface';

type ResetPasswordError = {
  response?: {
    data?: {
      originalError?: { message?: string };
      message?: string;
    };
  };
};

function getResetPasswordErrorMessage(err: unknown) {
  const data = (err as ResetPasswordError)?.response?.data;
  return data?.originalError?.message || data?.message || 'Erro ao redefinir a senha.';
}

export const Route = createFileRoute('/_public/app-auth/reset-password/$token')({
  component: ResetPasswordPage,
  staticData: {
    title: 'Redefinir Senha',
    description: 'Crie uma nova senha para acessar sua conta',
  },
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: user, isLoading: isVerifying, isError: verifyError } = useValidateRecoveryToken(token);
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(data: ResetPasswordFormData) {
    resetPassword.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast.success('Senha redefinida com sucesso! Redirecionando...');
          setTimeout(() => {
            navigate({ to: '/app-auth' });
          }, 3000);
        },
        onError: (err: unknown) => {
          toast.error(getResetPasswordErrorMessage(err));
        },
      },
    );
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <DefaultLoading />
      </div>
    );
  }

  if (verifyError || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md! justify-center">
          <CardContent className="flex flex-col gap-6">
            <img src="/images/logo.png" alt="Logo" className="h-26 w-auto object-contain" />
            <ItemGroup className="gap-6!">
              <ItemContent>
                <ItemTitle className="text-2xl text-destructive">Link Inválido</ItemTitle>
                <ItemDescription>Este link de recuperação expirou ou já foi utilizado. Por favor, solicite a recuperação de senha novamente.</ItemDescription>
              </ItemContent>
              <Button variant="ghost" onClick={() => navigate({ to: '/app-auth' })} type="button">
                <ArrowLeft className="size-4" />
                Voltar ao Login
              </Button>
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md! justify-center">
        <CardContent className="flex flex-col gap-6">
          <img src="/images/logo.png" alt="Logo" className="h-26 w-auto object-contain" />

          <ItemGroup className="gap-6!">
            <ItemContent>
              <ItemTitle className="text-2xl">Criar Nova Senha</ItemTitle>
              {user.name && (
                <ItemDescription>
                  Olá, <strong>{user.name}</strong>
                </ItemDescription>
              )}
              {user.document && (
                <ItemDescription>
                  {user.is_legal_person ? 'CNPJ' : 'CPF'}: <strong>{user.is_legal_person ? applyCnpjMask(user.document) : applyCpfMask(user.document)}</strong>
                </ItemDescription>
              )}
            </ItemContent>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input className="h-12!" placeholder="Digite a nova senha" type={showPassword ? 'text' : 'password'} {...field} />
                          <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} type="button">
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input className="h-12!" placeholder="Confirme a nova senha" type={showConfirmPassword ? 'text' : 'password'} {...field} />
                          <button
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            type="button"
                          >
                            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button variant="blue" className="h-12! w-full text-base" disabled={resetPassword.isPending || resetPassword.isSuccess} type="submit">
                  {resetPassword.isPending && <Loader2 className="size-4 animate-spin" />}
                  Redefinir Senha
                </Button>

                <Button
                  className="w-full"
                  variant="ghost"
                  disabled={resetPassword.isPending || resetPassword.isSuccess}
                  onClick={() => navigate({ to: '/app-auth' })}
                  type="button"
                >
                  <ArrowLeft className="size-4" />
                  Voltar ao Login
                </Button>
              </form>
            </Form>
          </ItemGroup>
        </CardContent>
      </Card>
    </div>
  );
}
