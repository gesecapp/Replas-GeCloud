import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AuthArea } from './@components/auth-area';
import { GuestArea } from './@components/guest-area';

export const Route = createFileRoute('/_public/app-auth/')({
  component: AppAuthPage,
});

function AppAuthPage() {
  const [isGuestMode, setIsGuestMode] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="max-w-md! justify-center">
        <CardContent className="flex flex-col gap-6">
          <img src="/images/logo.png" alt="Logo" className="h-26 w-auto object-contain" />
          {isGuestMode ? <GuestArea onClose={() => setIsGuestMode(false)} /> : <AuthArea onGuestMode={() => setIsGuestMode(true)} />}
        </CardContent>
      </Card>
    </div>
  );
}
