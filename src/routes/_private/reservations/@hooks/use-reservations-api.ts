import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppAuth } from '@/hooks/use-app-auth';
import { api } from '@/lib/api/client';
import type { AppProfessional, AvailabilityResponse, LocationSummary, ReservableLocation, Reservation } from '../@interface/reservation.schema';

// O envelope do back-end é { data, statusCode, message } — daí o response.data.data em todo
// queryFn.
type Envelope<T> = { data: T; statusCode: number };

// OBRIGATÓRIO em toda rota de reserva. O client (@/lib/api/client) injeta um header `token`, mas
// o authValidAppMiddleware lê `Authorization` com prefixo `Bearer` e ignora o outro — sem isto,
// tudo volta 401, o client faz clearAuth() e o app desloga sozinho.
//
// Rotas que funcionam sem este header (as de /app/unities, por exemplo) são as que NÃO passam
// pelo middleware de auth; não servem de precedente aqui.
function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const reservationKeys = {
  all: ['reservations'] as const,
  list: () => [...reservationKeys.all, 'list'] as const,
  detail: (id: string) => [...reservationKeys.all, 'detail', id] as const,
  locations: () => [...reservationKeys.all, 'locations'] as const,
  locationSummary: (locationId: string) => [...reservationKeys.all, 'location-summary', locationId] as const,
  availability: (locationId: string, date: string) => [...reservationKeys.all, 'availability', locationId, date] as const,
  professionals: (specialty?: string) => [...reservationKeys.all, 'professionals', specialty ?? ''] as const,
  professionalLocations: (professionalId: string, reservationType?: string) => [...reservationKeys.all, 'professional-locations', professionalId, reservationType ?? ''] as const,
  professionalAvailability: (professionalId: string, locationId: string, date: string) =>
    [...reservationKeys.all, 'professional-availability', professionalId, locationId, date] as const,
};

export function useGetReservations() {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: reservationKeys.list(),
    queryFn: async () => {
      const response = await api.get<Envelope<Reservation[]>>('/app/reservations', { headers: authHeaders(token) });
      return response.data.data ?? [];
    },
    enabled: !!token,
  });
}

export function useGetReservation(id: string | null | undefined) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: reservationKeys.detail(id || ''),
    queryFn: async () => {
      const response = await api.get<Envelope<Reservation>>(`/app/reservations/${id}`, { headers: authHeaders(token) });
      return response.data.data;
    },
    enabled: !!token && !!id,
  });
}

export function useGetReservableLocations() {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: reservationKeys.locations(),
    queryFn: async () => {
      const response = await api.get<Envelope<ReservableLocation[]>>('/app/reservations/locations', { headers: authHeaders(token) });
      return response.data.data ?? [];
    },
    enabled: !!token,
  });
}

export function useGetLocationSummary(locationId: string | null | undefined) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: reservationKeys.locationSummary(locationId || ''),
    queryFn: async () => {
      const response = await api.get<Envelope<LocationSummary>>(`/app/reservations/locations/${locationId}/summary`, { headers: authHeaders(token) });
      return response.data.data;
    },
    enabled: !!token && !!locationId,
  });
}

export function useGetAvailability(locationId: string | null | undefined, date: string | null | undefined) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: reservationKeys.availability(locationId || '', date || ''),
    queryFn: async () => {
      const response = await api.get<Envelope<AvailabilityResponse>>('/app/reservations/availability', {
        params: { locationId, date },
        headers: authHeaders(token),
      });
      return response.data.data;
    },
    enabled: !!token && !!locationId && !!date,
  });
}

export function useGetProfessionals(specialty?: string) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: reservationKeys.professionals(specialty),
    queryFn: async () => {
      const response = await api.get<Envelope<AppProfessional[]>>('/app/professionals', {
        params: specialty ? { specialty } : undefined,
        headers: authHeaders(token),
      });
      return response.data.data ?? [];
    },
    enabled: !!token,
  });
}

export function useGetProfessionalLocations(professionalId: string | null | undefined, reservationType?: string) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: reservationKeys.professionalLocations(professionalId || '', reservationType),
    queryFn: async () => {
      const response = await api.get<Envelope<ReservableLocation[]>>(`/app/professionals/${professionalId}/locations`, {
        params: reservationType ? { reservationType } : undefined,
        headers: authHeaders(token),
      });
      return response.data.data ?? [];
    },
    enabled: !!token && !!professionalId,
  });
}

export function useGetProfessionalAvailability(professionalId: string | null | undefined, locationId: string | null | undefined, date: string | null | undefined) {
  const { token } = useAppAuth();

  return useQuery({
    queryKey: reservationKeys.professionalAvailability(professionalId || '', locationId || '', date || ''),
    queryFn: async () => {
      const response = await api.get<Envelope<AvailabilityResponse>>(`/app/professionals/${professionalId}/availability`, {
        params: { locationId, date },
        headers: authHeaders(token),
      });
      return response.data.data;
    },
    enabled: !!token && !!professionalId && !!locationId && !!date,
  });
}

export interface CreateReservationPayload {
  locationId: string;
  reservationType: string;
  participantIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  quantityPeople?: number;
  notes?: string;
}

export interface CreateProfessionalReservationPayload {
  professionalId: string;
  locationId: string;
  reservationType: string;
  participantIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export function useReservationsApi() {
  const { token } = useAppAuth();
  const queryClient = useQueryClient();

  // Toda ação mexe em listagem, detalhe e disponibilidade ao mesmo tempo — invalidar a raiz é
  // mais barato de manter correto do que enumerar as chaves afetadas.
  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: reservationKeys.all });
  }

  const createReservation = useMutation({
    mutationFn: async (payload: CreateReservationPayload) => {
      const response = await api.post<Envelope<Reservation>>('/app/reservations', payload, { headers: authHeaders(token) });
      return response.data.data;
    },
    onSuccess: invalidateAll,
  });

  const createProfessionalReservation = useMutation({
    mutationFn: async (payload: CreateProfessionalReservationPayload) => {
      const response = await api.post<Envelope<{ reservation: Reservation }>>('/app/reservations/professional', payload, { headers: authHeaders(token) });
      return response.data.data.reservation;
    },
    onSuccess: invalidateAll,
  });

  const cancelReservation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<Envelope<Reservation>>(`/app/reservations/${id}/cancel`, {}, { headers: authHeaders(token) });
      return response.data.data;
    },
    onSuccess: invalidateAll,
  });

  const acceptReservation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<Envelope<Reservation>>(`/app/reservations/${id}/accept`, {}, { headers: authHeaders(token) });
      return response.data.data;
    },
    onSuccess: invalidateAll,
  });

  const refuseReservation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<Envelope<Reservation>>(`/app/reservations/${id}/refuse`, {}, { headers: authHeaders(token) });
      return response.data.data;
    },
    onSuccess: invalidateAll,
  });

  return { createReservation, createProfessionalReservation, cancelReservation, acceptReservation, refuseReservation };
}
