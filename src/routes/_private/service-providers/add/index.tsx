import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Copy, Home, MessageSquareShare } from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ItemDescription } from '@/components/ui/item';
import { useAccessUserApi } from '@/hooks/use-access-user-api';
import { useAppAuth } from '@/hooks/use-app-auth';
import { getUserPermissions } from '@/lib/permissions';
import type { CreateGuestProps } from '../../access-user/@interface/access-user.interface';
import { INVITATION_URL_BASE } from '../../visitors/add/@consts/add-visitor.consts';
import { ServiceProviderForm } from './@components/service-provider-form';
import { WHATSAPP_MESSAGE_PREFIX } from './@consts/add-service-provider.consts';
import { addServiceProviderSearchSchema } from './@interface/add-service-provider.schema';

type ApiError = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
};

function getApiErrorMessage(err: unknown, fallback: string) {
  const message = (err as ApiError).response?.data?.message;
  return typeof message === 'string' ? message : fallback;
}

export const Route = createFileRoute('/_private/service-providers/add/')({
  validateSearch: addServiceProviderSearchSchema,
  beforeLoad: () => {
    const { isAuthenticated, userType } = useAppAuth.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: '/app-auth',
      });
    }

    if (!getUserPermissions(userType).canManageServiceProviders) {
      throw redirect({ to: '/' });
    }
  },
  component: AddServiceProviderPage,
  staticData: { title: 'Prestador de Serviço' },
});

function AddServiceProviderPage() {
  const { guestId } = Route.useSearch();
  const { userId } = useAppAuth();
  const { createGuest, updateGuest } = useAccessUserApi();

  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');

  function handleBack() {
    navigate({ to: '/service-providers' });
  }

  function handleSubmit(data: CreateGuestProps & { id?: string }) {
    const payload = { ...data, user_type: 'prestador_de_servico' as const };
    const hasPhoto = payload.url_image && payload.url_image.length > 0 && !!payload.url_image[0];

    if (data.id) {
      const { id, parentId, user_type, ...guestData } = payload;
      updateGuest.mutate(
        { id: data.id, guestData },
        {
          onSuccess: () => {
            toast.success('Prestador atualizado! As alterações podem levar alguns instantes para refletirem no sistema.');
            handleBack();
          },
          onError: (err: unknown) => {
            toast.error(getApiErrorMessage(err, 'Erro ao atualizar prestador.'));
          },
        },
      );
    } else {
      createGuest.mutate(payload, {
        onSuccess: (responseData) => {
          if (hasPhoto) {
            toast.success('Prestador cadastrado! Os dados podem levar alguns instantes para refletirem no sistema.');
            handleBack();
          } else if (responseData.id) {
            const url = `${INVITATION_URL_BASE}/${responseData.id}`;
            setInvitationLink(url);
            setShowInviteModal(true);
          }
        },
        onError: (err: unknown) => {
          toast.error(getApiErrorMessage(err, 'Erro ao cadastrar prestador.'));
        },
      });
    }
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(invitationLink);
    toast.success('Link copiado!');
    setShowInviteModal(false);
    handleBack();
  }

  function handleShareWhatsApp() {
    const message = encodeURIComponent(`${WHATSAPP_MESSAGE_PREFIX}${invitationLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowInviteModal(false);
    handleBack();
  }

  function handleInviteModalChange(open: boolean) {
    setShowInviteModal(open);
    if (!open) {
      handleBack();
    }
  }

  return (
    <>
      <Card className="min-h-screen rounded-none border-none">
        <CardHeader>
          <CardTitle>{guestId ? 'Editar Prestador' : 'Novo Prestador'}</CardTitle>
          <CardAction>
            <Button size={'sm'} onClick={handleBack}>
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
            <Button size={'sm'} onClick={() => navigate({ to: '/' })}>
              <Home className="size-4" />
            </Button>
            <UserAvatarMenu />
          </CardAction>
        </CardHeader>

        <CardContent>
          <ServiceProviderForm parentId={userId || ''} guestId={guestId} onSubmit={handleSubmit} onCancel={handleBack} isLoading={createGuest.isPending || updateGuest.isPending} />
        </CardContent>

        <CardFooter>
          <TreeNavigation />
        </CardFooter>
      </Card>

      <Dialog open={showInviteModal} onOpenChange={handleInviteModalChange}>
        <DialogContent className="max-w-92 text-center">
          <DialogHeader>
            <DialogTitle>Pré-cadastro realizado com sucesso!</DialogTitle>
          </DialogHeader>
          <ItemDescription>Compartilhe o link abaixo para o prestador finalizar o cadastro e inserir a foto.</ItemDescription>
          <div className="mx-auto my-2 flex justify-center rounded-lg border border-slate-200 bg-white p-4">
            <QRCode value={invitationLink} size={160} />
          </div>
          <Input value={invitationLink} readOnly />
          <div className="flex justify-center gap-2">
            <Button onClick={handleCopyUrl} variant="default">
              <Copy className="size-4" />
              Copiar Link
            </Button>
            <Button onClick={handleShareWhatsApp} variant="green">
              <MessageSquareShare className="size-4" />
              WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
