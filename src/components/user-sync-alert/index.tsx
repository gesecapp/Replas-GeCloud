import { Link } from '@tanstack/react-router';
import { AlertCircle, CheckCircle2, ChevronRight, Clock, Info, Loader2, X } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import type { StatusVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserSyncStatus } from '@/routes/_private/access-user/@interface/access-user.interface';
import { ItemDescription, ItemTitle } from '../ui/item';

interface RegistrationStatusAlertProps {
  syncStatus?: UserSyncStatus;
  isLoading?: boolean;
  linkTo?: string;
}

type SyncState = 'loading' | 'queued' | 'rejected' | 'synchronized' | 'pending' | null;

interface SyncStateInfo {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  className?: string;
  statusIndicator: StatusVariant;
}

export function getSyncState(syncStatus?: UserSyncStatus, isLoading?: boolean): SyncState {
  if (isLoading) return 'loading';
  if (!syncStatus) return null;

  const syncData = syncStatus.sync_status;

  if (!syncData) return 'queued';

  const sensors = syncData.sensors || [];
  const hasAnySensor = sensors.length > 0;
  const rejectedSensors = sensors.filter((s) => s.image_accepted === false);
  if (rejectedSensors.length > 0) return 'rejected';

  if (!hasAnySensor) return 'pending';

  const allRegistered = sensors.every((s) => s.registered);
  const allImagesAccepted = sensors.every((s) => s.image_accepted !== false);

  if (allRegistered && allImagesAccepted && syncStatus.synchronized) return 'synchronized';

  return 'pending';
}

export function getSyncStateInfo(state: SyncState): SyncStateInfo | null {
  switch (state) {
    case 'loading':
      return {
        icon: <Loader2 className="size-4 animate-spin" />,
        title: 'Verificando Status de Integração...',
        description: 'Consultando o status atual da imagem nos sensores de segurança.',
        statusIndicator: 'pending',
      };
    case 'queued':
      return {
        icon: <Info className="size-4" />,
        title: 'Integração em Fila',
        description: 'Este cadastro foi recebido e aguarda processamento automático para ser enviado aos sensores.',
        statusIndicator: 'info',
      };
    case 'rejected':
      return {
        icon: <AlertCircle className="size-4" />,
        title: 'Ação Necessária',
        description: 'A imagem enviada não se enquadra nos parâmetros aceitos para autenticação nas catracas, por favor envie uma nova imagem.',
        variant: 'destructive',
        statusIndicator: 'error',
      };
    case 'synchronized':
      return {
        icon: <CheckCircle2 className="size-4" />,
        title: 'Imagem Sincronizada com Sucesso',
        description: 'A integração da imagem e os dados do usuário estão 100% operacionais em todos os sensores da unidade.',
        className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
        statusIndicator: 'success',
      };
    case 'pending':
      return {
        icon: <Clock className="size-4" />,
        title: 'Sincronização em Andamento',
        description: 'O cadastro está sendo enviado para os sensores da unidade. Aguarde a finalização do processo.',
        statusIndicator: 'pending',
      };
    default:
      return null;
  }
}

export function RegistrationStatusAlert({ syncStatus, isLoading, linkTo }: RegistrationStatusAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  const state = getSyncState(syncStatus, isLoading);
  const info = getSyncStateInfo(state);

  if (!info) return null;

  const isDismissable = state !== 'rejected';

  if (dismissed && isDismissable) return null;

  const alertContent = (
    <Alert variant={info.variant} className={info.className}>
      {info.icon}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <ItemTitle>{info.title}</ItemTitle>
          <ItemDescription>{info.description}</ItemDescription>
        </div>
        {isDismissable && !linkTo && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              setDismissed(true);
            }}
          >
            <X className="size-4" />
          </Button>
        )}
        {linkTo && <ChevronRight className="size-5 shrink-0 text-muted-foreground" />}
      </div>
    </Alert>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block no-underline">
        {alertContent}
      </Link>
    );
  }

  return alertContent;
}
