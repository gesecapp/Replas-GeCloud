import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemDescription, ItemTitle } from '@/components/ui/item';
import { AccomplishAccessForm } from './@components/accomplish-access-form';
import { type AccomplishAccessPayload, useAccomplishAccess, useGetGuestByInviteId } from './@hooks/use-accomplish-access-api';

export const Route = createFileRoute('/_public/accomplish-access/$id/')({
  component: AccomplishAccessPage,
  staticData: {
    title: 'Concluir Cadastro',
    description: 'Conclua seu cadastro no sistema GESEC',
  },
});

function getErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { originalError?: { message?: unknown }; message?: unknown } } }).response?.data;
  const message = data?.originalError?.message ?? data?.message;
  return typeof message === 'string' ? message : 'Erro ao concluir cadastro.';
}

function guestDocumentIsValid(guest: { document?: string; is_legal_person?: boolean }): boolean {
  const digits = (guest.document ?? '').replace(/\D/g, '');
  const expected = guest.is_legal_person ? 14 : 11;
  return digits.length === expected;
}

function AccomplishAccessPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const { data: guest, isLoading, isError } = useGetGuestByInviteId(id);
  const accomplishAccess = useAccomplishAccess();

  function handleSubmit(payload: AccomplishAccessPayload) {
    accomplishAccess.mutate(
      { id, payload },
      {
        onSuccess: () => {
          setSuccess(true);
          toast.success('Cadastro concluído! Redirecionando para o login...');
          setTimeout(() => navigate({ to: '/app-auth', replace: true }), 3000);
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <DefaultLoading />
      </div>
    );
  }

  if (isError || !guest) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <ItemTitle className="text-destructive text-xl">Link inválido ou expirado</ItemTitle>
            <ItemDescription className="text-center">Este link de cadastro expirou ou já foi utilizado. Solicite um novo cadastro.</ItemDescription>
            <Button onClick={() => navigate({ to: '/new-access' })}>Iniciar novo cadastro</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!guestDocumentIsValid(guest)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <ItemTitle className="text-destructive text-xl">Cadastro incompleto</ItemTitle>
            <ItemDescription className="text-center">
              O documento deste convite não está disponível ou é inválido. Conclua sempre a primeira etapa em Novo Cadastro (CPF/CNPJ e e-mail) e use o link enviado por e-mail.
            </ItemDescription>
            <Button onClick={() => navigate({ to: '/new-access' })}>Ir para novo cadastro</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <ItemTitle className="text-emerald-600 text-xl">Cadastro Concluído!</ItemTitle>
            <ItemDescription className="text-center">Você já pode acessar o aplicativo com seu documento e senha.</ItemDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Concluir Cadastro</CardTitle>
          <ItemDescription>Preencha os dados abaixo para concluir seu cadastro.</ItemDescription>
        </CardHeader>
        <CardContent>
          <AccomplishAccessForm inviteId={id} guest={guest} onSubmit={handleSubmit} isLoading={accomplishAccess.isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
