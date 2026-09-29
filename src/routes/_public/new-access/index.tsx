import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { NewAccessForm } from './@components/new-access-form';

export const Route = createFileRoute('/_public/new-access/')({
  component: NewAccessPage,
  staticData: {
    title: 'Novo Cadastro',
    description: 'Inicie seu cadastro no sistema GESEC',
  },
});

function NewAccessPage() {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md! justify-center">
        <CardContent className="flex flex-col gap-6">
          <img src="/images/logo.png" alt="Logo" className="h-26 w-auto object-contain" />
          {emailSent ? (
            <ItemGroup className="gap-6!">
              <ItemContent className="items-center">
                <ItemTitle className="text-2xl">Verifique seu E-mail</ItemTitle>
                <ItemDescription className="text-center">Enviamos um link de confirmação para o e-mail informado. Acesse o link para concluir o cadastro.</ItemDescription>
              </ItemContent>
              <Button variant="ghost" onClick={() => navigate({ to: '/app-auth' })} type="button">
                <ArrowLeft className="size-4" />
                Voltar ao Login
              </Button>
            </ItemGroup>
          ) : (
            <NewAccessForm onSuccess={() => setEmailSent(true)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
