import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAppAuth } from '@/hooks/use-app-auth';
import { useIdleLogout } from '@/hooks/use-idle-logout';

/**
 * Layout route para rotas privadas (com autenticação)
 * Redireciona para /app-auth se não estiver autenticado
 */

function PrivateLayout() {
  useIdleLogout();

  return (
    <main className="bg-card">
      <Outlet />
    </main>
  );
}

export const Route = createFileRoute('/_private')({
  beforeLoad: async () => {
    const authStore = useAppAuth.getState();

    if (!authStore.isAuthenticated || !authStore.checkTokenValidity()) {
      throw redirect({
        to: '/app-auth',
      });
    }
  },
  component: PrivateLayout,
});
