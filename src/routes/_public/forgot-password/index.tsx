import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { ForgotPasswordForm } from './@components/forgot-password-form';
import { forgotPasswordSearchSchema } from './@interface/forgot-password.schema';

export const Route = createFileRoute('/_public/forgot-password/')({
  component: ForgotPasswordPage,
  validateSearch: forgotPasswordSearchSchema,
  staticData: {
    title: 'Recuperar Senha',
    description: 'Recupere o acesso à sua conta',
  },
});

function ForgotPasswordPage() {
  const { email } = Route.useSearch();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md! justify-center">
        <CardContent className="flex flex-col gap-6">
          <img src="/images/logo.png" alt="Logo" className="h-26 w-auto object-contain" />
          <ForgotPasswordForm initialEmail={email} />
        </CardContent>
      </Card>
    </div>
  );
}
