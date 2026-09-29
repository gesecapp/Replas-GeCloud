import { z } from 'zod';

// ─── Search params das rotas ────────────────────────────────────────────────

export const reservationsSearchSchema = z.object({
  // `local` = reserva comum do morador; `profissional` = aula/treinamento com professor.
  mode: z.enum(['local', 'profissional']).optional(),
});

export type ReservationsSearch = z.infer<typeof reservationsSearchSchema>;

export const reservationDetailsSearchSchema = z.object({
  id: z.string(),
});

export type ReservationDetailsSearch = z.infer<typeof reservationDetailsSearchSchema>;

// ─── Formulários ────────────────────────────────────────────────────────────
// Datas em 'YYYY-MM-DD' e horas em 'HH:mm' — o mesmo formato que o back-end espera, para não
// haver conversão no meio do caminho.

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeRangeFields = {
  date: z.string().min(1, 'Escolha uma data'),
  startTime: z.string().regex(timeRegex, 'Escolha um horário'),
  endTime: z.string().regex(timeRegex, 'Escolha um horário'),
};

// Como as horas são 'HH:mm' zero-padded, a comparação lexicográfica basta — é a mesma que o
// back-end faz no seu próprio refine.
const isValidRange = (data: { startTime: string; endTime: string }) => data.endTime > data.startTime;
const rangeError = { message: 'O fim deve ser depois do início', path: ['endTime'] };

export const reservationFormSchema = z
  .object({
    locationId: z.string().min(1, 'Escolha o local'),
    reservationType: z.string().min(1, 'Escolha o tipo de reserva'),
    participantIds: z.array(z.string()),
    quantityPeople: z.string().refine((v) => {
      const n = Number.parseInt(v, 10);
      return Number.isFinite(n) && n >= 1 && n <= 99999;
    }, 'Informe um valor entre 1 e 99999'),
    notes: z.string().max(500, 'Máximo de 500 caracteres'),
    ...timeRangeFields,
  })
  .refine(isValidRange, rangeError);

export type ReservationFormData = z.infer<typeof reservationFormSchema>;

export const professionalReservationFormSchema = z
  .object({
    reservationType: z.string().min(1, 'Escolha o tipo de reserva'),
    professionalId: z.string().min(1, 'Escolha o profissional'),
    locationId: z.string().min(1, 'Escolha o local'),
    participantIds: z.array(z.string()),
    notes: z.string().max(500, 'Máximo de 500 caracteres'),
    ...timeRangeFields,
  })
  .refine(isValidRange, rangeError);

export type ProfessionalReservationFormData = z.infer<typeof professionalReservationFormSchema>;

// ─── Payloads da API ────────────────────────────────────────────────────────

export interface TimeSlot {
  start: string;
  end: string;
}

export interface OccupiedSlot extends TimeSlot {
  source: 'reservation' | 'access-rule' | 'professional';
  refId?: string;
}

export interface AvailabilityResponse {
  operatingHours: TimeSlot[];
  occupied: OccupiedSlot[];
  free: TimeSlot[];
  // Só na disponibilidade do profissional.
  professionalSchedules?: TimeSlot[];
  professionalUnavailable?: boolean;
  unavailabilityReason?: string;
}

export interface OperatingHour {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface ReservableLocation {
  id: string;
  name: string;
  reservationTypes?: string[];
  operatingHours?: OperatingHour[];
}

export interface LocationSummary {
  id: string;
  name: string;
  confirmationMode: 'automatic' | 'moderated';
  approvalWindowHours: number;
  operatingHours: OperatingHour[];
  maxPeoplePerReservation: number | null;
  maxSimultaneousReservations: number;
  reservationTypes: string[];
  allowsThirdParty: boolean;
}

export interface AppProfessional {
  id: string;
  name: string;
  professionalCategory?: string;
  specialties: string[];
  url_image: string[];
}

export interface ReservationParty {
  id: string;
  name: string;
  user_type?: string;
}

export interface Reservation {
  id: string;
  locationId: string;
  location?: { id: string; name: string };
  reservationType: string;
  ownerId: string;
  owner?: ReservationParty;
  participantIds?: string[];
  participants?: ReservationParty[];
  professionalId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  quantityPeople?: number;
  notes?: string;
  status: string;
  phase: string;
  createdAt?: string;
}
