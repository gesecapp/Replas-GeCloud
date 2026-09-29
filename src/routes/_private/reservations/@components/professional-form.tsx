import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DataMultiSelect } from '@/components/ui/data-multi-select';
import { DataSelect } from '@/components/ui/data-select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ItemActions, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Textarea } from '@/components/ui/textarea';
import { useGetGuestsByParent } from '@/hooks/use-access-user-api';
import { applyCpfMask } from '@/lib/masks';
import { PROFESSIONAL_RESERVATION_TYPES, reservationTypeLabel } from '../@consts/reservation.consts';
import { useGetProfessionalAvailability, useGetProfessionalLocations, useGetProfessionals } from '../@hooks/use-reservations-api';
import { type ProfessionalReservationFormData, professionalReservationFormSchema } from '../@interface/reservation.schema';
import { AvailabilityPanel } from './availability-panel';
import { DateField } from './date-field';
import { TimeSlotPicker } from './time-slot-picker';

const PARTICIPANT_LIMIT = 100;

const TYPE_OPTIONS = PROFESSIONAL_RESERVATION_TYPES.map((type) => ({
  value: type,
  label: reservationTypeLabel(type),
}));

// Reserva de aula/treinamento. A ordem aqui é outra — tipo, depois profissional, depois local —
// porque quem restringe a lista é o profissional: o tipo filtra os aptos (a especialidade dele é
// um superset dos tipos de reserva) e o profissional escolhido é quem determina em que locais a
// aula pode acontecer.
//
// Titular também não é campo, mas por outro motivo: no domínio, em aula o titular É o
// profissional; quem solicita entra como aluno.
export function ProfessionalForm({ onSubmit, onCancel, isLoading }: ProfessionalFormProps) {
  const participantsQuery = useGetGuestsByParent('dependente', PARTICIPANT_LIMIT);

  const form = useForm<ProfessionalReservationFormData>({
    resolver: zodResolver(professionalReservationFormSchema),
    defaultValues: {
      reservationType: '',
      professionalId: '',
      locationId: '',
      participantIds: [],
      date: '',
      startTime: '',
      endTime: '',
      notes: '',
    },
  });

  const reservationType = form.watch('reservationType');
  const professionalId = form.watch('professionalId');
  const locationId = form.watch('locationId');
  const date = form.watch('date');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');

  const professionalsQuery = useGetProfessionals(reservationType || undefined);
  const locationsQuery = useGetProfessionalLocations(professionalId || null, reservationType || undefined);

  const { data: availability, isLoading: isLoadingAvailability } = useGetProfessionalAvailability(professionalId || null, locationId || null, date || null);

  const selectedProfessional = useMemo(() => professionalsQuery.data?.find((p) => p.id === professionalId), [professionalsQuery.data, professionalId]);
  const selectedLocation = useMemo(() => locationsQuery.data?.find((l) => l.id === locationId), [locationsQuery.data, locationId]);

  function handleTypeChange(value: string) {
    form.setValue('reservationType', value, { shouldValidate: true });
    form.setValue('professionalId', '');
    form.setValue('locationId', '');
    form.setValue('date', '');
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  }

  function handleProfessionalChange(value: string) {
    form.setValue('professionalId', value, { shouldValidate: true });
    form.setValue('locationId', '');
    form.setValue('date', '');
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  }

  function handleLocationChange(value: string) {
    form.setValue('locationId', value, { shouldValidate: true });
    form.setValue('date', '');
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  }

  function handleDateChange(value: string) {
    form.setValue('date', value, { shouldValidate: true });
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  }

  function handleFormSubmit(data: ProfessionalReservationFormData) {
    onSubmit({
      professionalId: data.professionalId,
      locationId: data.locationId,
      reservationType: data.reservationType,
      participantIds: data.participantIds,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes || undefined,
    });
  }

  const sections: FormSection[] = [
    {
      title: 'Reservar com profissional',
      description: 'Escolha o tipo e o profissional — a agenda dele define os horários oferecidos.',
      fields: [
        <FormField
          key="reservationType"
          control={form.control}
          name="reservationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de reserva *</FormLabel>
              <FormControl>
                <DataSelect
                  value={field.value}
                  onChange={(value) => handleTypeChange(value ? String(value) : '')}
                  options={TYPE_OPTIONS}
                  placeholder="Selecione o tipo"
                  searchPlaceholder="Buscar tipo..."
                  noResultsMessage="Nenhum tipo encontrado."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="professionalId"
          control={form.control}
          name="professionalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissional *</FormLabel>
              <FormControl>
                <DataSelect
                  value={field.value}
                  onChange={(value) => handleProfessionalChange(value ? String(value) : '')}
                  query={professionalsQuery}
                  mapToOptions={(list) =>
                    list.map((professional) => ({
                      value: professional.id,
                      label: professional.professionalCategory ? `${professional.name} — ${professional.professionalCategory}` : professional.name,
                      data: professional,
                    }))
                  }
                  placeholder="Selecione o profissional"
                  searchPlaceholder="Buscar profissional..."
                  noOptionsMessage="Nenhum profissional apto a este tipo."
                  noResultsMessage="Nenhum profissional encontrado."
                  disabled={!reservationType}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <ItemGroup key="holder" className="gap-1">
          <ItemTitle className="font-medium text-sm">Titular da reserva</ItemTitle>
          <ItemDescription>
            {selectedProfessional ? `${selectedProfessional.name} (profissional) — você entra como participante` : 'O profissional escolhido será o titular da reserva.'}
          </ItemDescription>
        </ItemGroup>,
        <FormField
          key="locationId"
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local *</FormLabel>
              <FormControl>
                <DataSelect
                  value={field.value}
                  onChange={(value) => handleLocationChange(value ? String(value) : '')}
                  query={locationsQuery}
                  placeholder="Selecione o local"
                  searchPlaceholder="Buscar local..."
                  noOptionsMessage="Nenhum local aceita este profissional para este tipo de reserva."
                  noResultsMessage="Nenhum local encontrado."
                  disabled={!professionalId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="participantIds"
          control={form.control}
          name="participantIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outros participantes</FormLabel>
              <FormControl>
                <DataMultiSelect
                  value={field.value}
                  onChange={(values) => field.onChange(values.map(String))}
                  query={participantsQuery}
                  mapToOptions={(guests) =>
                    guests.map((guest) => ({
                      value: String(guest._id || guest.id),
                      label: guest.document ? `${guest.name} — ${applyCpfMask(guest.document)}` : (guest.name ?? ''),
                      data: guest,
                    }))
                  }
                  placeholder="Selecione os participantes"
                  searchPlaceholder="Buscar participante..."
                  noOptionsMessage="Nenhum dependente cadastrado."
                  noResultsMessage="Nenhum participante encontrado."
                  disabled={!locationId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="date"
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data *</FormLabel>
              <FormControl>
                <DateField value={field.value} operatingHours={selectedLocation?.operatingHours} disabled={!locationId} onChange={handleDateChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="notes"
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} placeholder="Opcional" disabled={!locationId} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Horário',
      description: 'Só aparecem blocos livres no local e dentro da agenda do profissional.',
      layout: 'vertical',
      fields: [
        <TimeSlotPicker
          key="slots"
          free={availability?.free ?? []}
          startTime={startTime}
          endTime={endTime}
          disabled={!date}
          onChange={(start, end) => {
            form.setValue('startTime', start, { shouldValidate: !!end });
            form.setValue('endTime', end, { shouldValidate: !!end });
          }}
        />,
        <AvailabilityPanel key="panel" availability={availability} isLoading={isLoadingAvailability} date={date} />,
      ],
    },
  ];

  return (
    <ItemGroup className="gap-6">
      {/* O profissional só tem acesso às catracas durante a janela da aula, pela portaria e pelo
          local reservado. Sem portaria com catraca cadastrada o back-end recusa com
          gatehouse-conflict — vale avisar antes de o morador preencher tudo. */}
      <Alert>
        <AlertTitle>Reserva sujeita a confirmação</AlertTitle>
        <AlertDescription>A aula é criada em nome do profissional e depende da confirmação dele ou da aprovação da administração.</AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <DefaultFormLayout sections={sections} />

          <ItemActions className="flex justify-end py-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Reservar
            </Button>
          </ItemActions>
        </form>
      </Form>
    </ItemGroup>
  );
}

export interface ProfessionalFormSubmit {
  professionalId: string;
  locationId: string;
  reservationType: string;
  participantIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

interface ProfessionalFormProps {
  onSubmit: (data: ProfessionalFormSubmit) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
