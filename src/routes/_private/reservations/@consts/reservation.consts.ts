// Rótulos e valores do domínio de reservas. Não há i18n no projeto — o padrão da casa é um
// Record local por rota. Os textos espelham os do painel (gesec-webclient
// src/constants/accesscontrol-constants.ts) de propósito: morador e porteiro precisam ler o
// mesmo nome para a mesma coisa.

export const RESERVATION_TYPE_LABELS: Record<string, string> = {
  aniversario: 'Aniversário',
  atividade_esportiva: 'Atividade Esportiva',
  atividade_recreativa: 'Atividade Recreativa / Lazer',
  aula: 'Aula',
  churrasco: 'Churrasco',
  comemoracao: 'Comemoração',
  curso_workshop: 'Curso / Workshop',
  evento_coletivo: 'Evento Coletivo',
  evento_pessoal: 'Evento Pessoal',
  festa_infantil: 'Festa Infantil',
  manutencao: 'Manutenção (bloqueio)',
  mudanca: 'Mudança',
  palestra: 'Palestra',
  reuniao: 'Reunião',
  reuniao_condominio: 'Reunião de Condomínio (com Síndico)',
  treinamento: 'Treinamento',
  outro: 'Outro',
};

// Tipos conduzidos por um profissional: nesses o titular é o PROFISSIONAL e quem solicita entra
// como aluno. Espelha PROFESSIONAL_RESERVATION_TYPES do back-end.
export const PROFESSIONAL_RESERVATION_TYPES = ['aula', 'treinamento'] as const;

export type ProfessionalReservationType = (typeof PROFESSIONAL_RESERVATION_TYPES)[number];

// `phase` é derivada no back-end e é ela que a tela usa — desdobra `confirmed` em agendada,
// em andamento e concluída. O status persistido nunca aparece para o morador.
export const RESERVATION_PHASE_LABELS: Record<string, string> = {
  pending: 'Aguardando aprovação',
  awaiting_confirmation: 'Aguardando confirmação',
  scheduled: 'Agendada',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  cancelled_before_start: 'Cancelada',
  cancelled_in_progress: 'Cancelada em andamento',
  refused_by_titular: 'Recusada',
  rejected: 'Reprovada',
  expired: 'Expirada',
};

// Variantes do Badge (@/components/ui/badge), que já vêm resolvidas para tema claro e escuro.
export const RESERVATION_PHASE_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'active'> = {
  pending: 'warning',
  awaiting_confirmation: 'warning',
  scheduled: 'success',
  in_progress: 'active',
  completed: 'info',
  cancelled: 'neutral',
  cancelled_before_start: 'neutral',
  cancelled_in_progress: 'neutral',
  refused_by_titular: 'error',
  rejected: 'error',
  expired: 'neutral',
};

// Fases em que ainda cabe cancelar. Espelha `canCancel` do domínio: reserva em execução também
// pode ser cancelada; `awaiting_confirmation` não — a saída dela é aceitar ou recusar.
export const CANCELABLE_PHASES = ['pending', 'scheduled', 'in_progress'];

// Granularidade dos blocos oferecidos em "Selecione o horário".
export const SLOT_GRANULARITY_MINUTES = 30;

export function reservationTypeLabel(type: string): string {
  return RESERVATION_TYPE_LABELS[type] ?? type;
}

export function phaseLabel(phase: string): string {
  return RESERVATION_PHASE_LABELS[phase] ?? phase;
}
