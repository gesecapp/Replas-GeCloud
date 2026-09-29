import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAppAuth } from '@/hooks/use-app-auth';

const DEFAULT_IDLE_TIMEOUT_MS = 60_000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export function useIdleLogout(timeoutMs = DEFAULT_IDLE_TIMEOUT_MS) {
  const navigate = useNavigate();
  const { isAuthenticated, clearAuth } = useAppAuth();
  const timeoutRef = useRef<number | null>(null);

  const clearIdleTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleIdleLogout = useCallback(() => {
    clearAuth();
    toast.info('Sessao encerrada por inatividade.');
    navigate({ to: '/app-auth', replace: true });
  }, [clearAuth, navigate]);

  const resetIdleTimer = useCallback(() => {
    if (!isAuthenticated) return;

    clearIdleTimeout();
    timeoutRef.current = window.setTimeout(handleIdleLogout, timeoutMs);
  }, [clearIdleTimeout, handleIdleLogout, isAuthenticated, timeoutMs]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearIdleTimeout();
      return;
    }

    const onUserActivity = () => {
      resetIdleTimer();
    };

    resetIdleTimer();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, onUserActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, onUserActivity);
      });
      clearIdleTimeout();
    };
  }, [clearIdleTimeout, isAuthenticated, resetIdleTimer]);
}
