import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Home, RefreshCw, ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react';
import EmptyData from '@/components/default-empty-data';
import DefaultLoading from '@/components/default-loading';
import { UserAvatarMenu } from '@/components/nav-actions/user-avatar-menu';
import { TreeNavigation } from '@/components/tree-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useGetUserSyncStatusManual } from '@/routes/_private/sync-status/@hooks/use-sync-status-manual';

export const Route = createFileRoute('/_private/sync-status/')({
  component: SyncStatusPage,
});

function SyncStatusPage() {
  const navigate = useNavigate();
  const { userId } = useAppAuth();
  const { data: syncStatus, isLoading, isFetching, refetch } = useGetUserSyncStatusManual(userId);

  const sensors = syncStatus?.sync_status?.sensors ?? [];

  return (
    <Card className="min-h-screen rounded-none border-none">
      <CardHeader>
        <CardTitle>Status de Sincronização</CardTitle>
        <CardAction>
          <Button size={'sm'} onClick={() => window.history.back()}>
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
        {isLoading ? (
          <DefaultLoading />
        ) : sensors.length === 0 ? (
          <EmptyData />
        ) : (
          <ItemGroup className="w-full gap-4">
            <div className="flex w-full justify-end">
              <Button onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            {sensors.map((sensor) => {
              const isRegistered = sensor.registered;
              const isImageAccepted = sensor.image_accepted === true;
              const lastSync = sensor.last_sync_at ? format(new Date(sensor.last_sync_at), 'dd MM yyyy HH:mm', { locale: ptBR }) : null;

              return (
                <Item key={sensor.sensorId} variant="default" className="items-start">
                  <ItemMedia variant="icon" className="size-12 rounded-md bg-muted">
                    {isRegistered ? <UserCheck className="size-5 text-emerald-400" /> : <UserX className="size-5 text-red-400" />}
                  </ItemMedia>

                  <ItemContent>
                    <ItemTitle className="font-medium text-lg">{sensor.sensorName}</ItemTitle>
                    <ItemGroup className="flex-row">
                      <Badge variant={isRegistered ? 'success' : 'error'} className="p-2">
                        {isRegistered ? <UserCheck className="size-3" /> : <UserX className="size-3" />}
                        {isRegistered ? 'Cadastrado' : 'Não cadastrado'}
                      </Badge>

                      <Badge variant={isImageAccepted ? 'success' : sensor.image_accepted === false ? 'error' : 'neutral'} className="p-2">
                        {isImageAccepted ? <ShieldCheck className="size-3" /> : <ShieldOff className="size-3" />}
                        {isImageAccepted ? 'Imagem aceita' : sensor.image_accepted === false ? 'Imagem rejeitada' : 'Imagem pendente'}
                      </Badge>
                    </ItemGroup>
                  </ItemContent>

                  <ItemContent>
                    {lastSync && (
                      <div className="flex flex-col items-end">
                        <ItemDescription className="text-sm">Última sincronização</ItemDescription>
                        <ItemTitle className="text-xs">{lastSync}</ItemTitle>
                      </div>
                    )}
                  </ItemContent>
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </CardContent>

      <CardFooter>
        <TreeNavigation />
      </CardFooter>
    </Card>
  );
}
