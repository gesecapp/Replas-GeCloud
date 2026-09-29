import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { toast } from 'sonner';
import DefaultLoading from '@/components/default-loading';
import { Card, CardContent } from '@/components/ui/card';
import { ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import type { CreateGuestProps } from '@/routes/_private/access-user/@interface/access-user.interface';
import { NewUserForm } from './@components/new-user-form';
import { useFinalizeGuestInvite, useGetGuestByInviteId } from './@hooks/use-new-user-api';

type InviteError = {
  response?: {
    data?: {
      originalError?: {
        message?: unknown;
      };
      message?: unknown;
    };
  };
};

export const Route = createFileRoute('/_public/new-user/$id')({
  component: NewUserPage,
});

function getInviteErrorMessage(err: unknown) {
  const responseData = (err as InviteError).response?.data;
  const message = responseData?.originalError?.message ?? responseData?.message;

  return typeof message === 'string' ? message : 'Erro ao finalizar cadastro.';
}

function NewUserPage() {
  const { id } = Route.useParams();
  const [success, setSuccess] = useState(false);

  const { data: guestData, isLoading, isError } = useGetGuestByInviteId(id);
  const finalizeInvite = useFinalizeGuestInvite();

  const guestId = guestData?.id || null;

  function handleSubmit(data: CreateGuestProps & { id?: string }) {
    const idToUpdate = guestId ?? data.id;

    if (!idToUpdate) {
      toast.error('Não foi possível identificar o cadastro. Recarregue a página ou use o link novamente.');
      return;
    }

    finalizeInvite.mutate(
      { guestId: idToUpdate, data },
      {
        onSuccess: () => {
          setSuccess(true);
          toast.success('Cadastro finalizado! Os dados podem levar alguns instantes para refletirem no sistema.');
        },
        onError: (err: unknown) => {
          toast.error(getInviteErrorMessage(err));
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-2 md:p-4">
        <DefaultLoading />
      </div>
    );
  }

  if (isError || !id) {
    return (
      <div className="flex min-h-screen items-center justify-center p-2 md:p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <ItemTitle className="text-destructive text-xl">{!id ? 'Link não encontrado.' : 'Link inválido ou expirado.'}</ItemTitle>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-2 md:p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <ItemTitle className="text-emerald-600 text-xl">Cadastro Finalizado!</ItemTitle>
            <ItemDescription className="text-center">Seus dados foram atualizados com sucesso.</ItemDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card>
        <CardContent>
          {guestData ? (
            <NewUserForm initialData={guestData} guestId={guestId} onSubmit={handleSubmit} isLoading={finalizeInvite.isPending} />
          ) : (
            <ItemContent>
              <ItemDescription className="text-destructive">Não foi possível carregar os dados. Link inválido.</ItemDescription>
            </ItemContent>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
