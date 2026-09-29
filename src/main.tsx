import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster, toast } from 'sonner';

import { routeTree } from './routeTree.gen';

import './styles.css';

function extractErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: unknown }; message?: string };
  const raw = err?.response?.data;
  const data = (
    typeof raw === 'string'
      ? (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return {};
          }
        })()
      : raw
  ) as
    | {
        originalError?: { message?: string };
        message?: string;
        error?: unknown;
        conflicts?: { message?: string }[];
      }
    | undefined;

  // As rotas de reserva não usam o envelope do ErrorHelper: elas respondem { error, conflicts? },
  // com o motivo real em pt-BR. Sem ler esses dois campos, todo 400/409 de reserva virava
  // "Ocorreu um erro inesperado".
  const conflicts = Array.isArray(data?.conflicts)
    ? data.conflicts
        .map((conflict) => conflict?.message)
        .filter(Boolean)
        .join(' · ')
    : '';

  return data?.originalError?.message || data?.message || conflicts || (typeof data?.error === 'string' ? data.error : '') || err?.message || 'Ocorreu um erro inesperado';
}

// Create QueryClient instance
// TODO: no futuro ajustar o back-end para ter um retorno padrão de erro e sucesso
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// App component with all providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange themes={['light', 'dark', 'ocean-blue', 'sunset']}>
        <RouterProvider router={router} />
        <Toaster position="bottom-left" expand={false} richColors closeButton />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Disable zooming
document.addEventListener('DOMContentLoaded', () => {
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'viewport');
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover');
  document.getElementsByTagName('head')[0].appendChild(meta);
});

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
