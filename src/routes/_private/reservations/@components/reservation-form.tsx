import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import DefaultFormLayout, { type FormSection } from '@/components/default-form-layout';
import { Button } from '@/components/ui/button';
import { DataMultiSelect } from '@/components/ui/data-multi-select';
import { DataSelect } from '@/components/ui/data-select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ItemActions, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Textarea } from '@/components/ui/textarea';
import { useGetAppUser, useGetGuestsByParent } from '@/hooks/use-access-user-api';
import { applyCpfMask } from '@/lib/masks';
import { reservationTypeLabel } from '../@consts/reservation.consts';
import { useGetAvailability, useGetLocationSummary, useGetReservableLocations } from '../@hooks/use-reservations-api';
import { type ReservationFormData, reservationFormSchema } from '../@interface/reservation.schema';
import { AvailabilityPanel } from './availability-panel';
import { DateField } from './date-field';
import { LocationSummaryCard } from './location-summary-card';
import { TimeSlotPicker } from './time-slot-picker';

const PARTICIPANT_LIMIT = 100;

// Reserva comum de local. Fluxo "local-first", igual ao do painel: o LOCAL é escolhido primeiro
// porque é ele que dita os tipos aceitos, o horário de funcionamento e a capacidade — com o
// local em branco, os demais campos não têm o que oferecer.
//
// O titular não é campo: o back-end força ownerId = usuário logado e ignora qualquer coisa que
// venha no body. Exibir como seleção seria mentir sobre o que é escolhível.
export function ReservationForm({ onSubmit, onCancel, isLoading }: ReservationFormProps) {
  const { data: user } = useGetAppUser();
  // O DataSelect consome o UseQueryResult inteiro, então o hook é chamado uma vez e a lista sai
  // do mesmo objeto.
  const locationsQuery = useGetReservableLocations();
  const locations = locationsQuery.data;
  // Visitante não pode ser participante interno (o back-end recusa) — a lista é de dependentes.
  const participantsQuery = useGetGuestsByParent('dependente', PARTICIPANT_LIMIT);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      locationId: '',
      reservationType: '',
      participantIds: [],
      date: '',
      startTime: '',
      endTime: '',
      quantityPeople: '1',
      notes: '',
    },
  });

  const locationId = form.watch('locationId');
  const date = form.watch('date');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');

  const { data: summary, isLoading: isLoadingSummary } = useGetLocationSummary(locationId || null);
  const { data: availability, isLoading: isLoadingAvailability } = useGetAvailability(locationId || null, date || null);

  const selectedLocation = useMemo(() => locations?.find((l) => l.id === locationId), [locations, locationId]);

  // Trocar de local invalida o que dependia dele: o tipo (cada local aceita os seus), a data e o
  // horário (dependem do funcionamento e da agenda daquele local). Fica no handler, e não num
  // efeito sobre `locationId`, para não disparar na montagem nem depender de sincronia do render.
  function handleLocationChange(value: string) {
    form.setValue('locationId', value, { shouldValidate: true });
    form.setValue('reservationType', '');
    form.setValue('date', '');
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  }

  // Trocar a data invalida o horário — os blocos livres são outros.
  function handleDateChange(value: string) {
    form.setValue('date', value, { shouldValidate: true });
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  }

  const typeOptions = useMemo(
    () =>
      (selectedLocation?.reservationTypes ?? []).map((type) => ({
        value: type,
        label: reservationTypeLabel(type),
      })),
    [selectedLocation],
  );

  const holderLabel = user?.name ? `${user.name}${user.document ? ` — ${applyCpfMask(user.document)}` : ''}${user.user_type ? ` (${user.user_type})` : ''}` : 'Carregando...';

  const afterLocation = !!locationId;

  function handleFormSubmit(data: ReservationFormData) {
    onSubmit({
      locationId: data.locationId,
      reservationType: data.reservationType,
      participantIds: data.participantIds,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      quantityPeople: Number.parseInt(data.quantityPeople, 10),
      notes: data.notes || undefined,
    });
  }

  const sections: FormSection[] = [
    {
      title: 'Efetuar Reserva',
      description: 'Escolha o local — ele define os tipos de reserva, o horário e a capacidade.',
      fields: [
        <ItemGroup key="holder" className="gap-1">
          <ItemTitle className="font-medium text-sm">Titular da reserva</ItemTitle>
          <ItemDescription>{holderLabel}</ItemDescription>
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
                  noOptionsMessage="Nenhum local disponível para reservas."
                  noResultsMessage="Nenhum local encontrado."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
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
                  onChange={(value) => field.onChange(value ? String(value) : '')}
                  options={typeOptions}
                  placeholder="Selecione o tipo"
                  searchPlaceholder="Buscar tipo..."
                  noOptionsMessage="Este local não declarou tipos de reserva."
                  noResultsMessage="Nenhum tipo encontrado."
                  disabled={!afterLocation}
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
              <FormLabel>Participantes</FormLabel>
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
                  disabled={!afterLocation}
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
                <DateField value={field.value} operatingHours={summary?.operatingHours ?? selectedLocation?.operatingHours} disabled={!afterLocation} onChange={handleDateChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="quantityPeople"
          control={form.control}
          name="quantityPeople"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade estimada de pessoas *</FormLabel>
              <FormControl>
                <Input {...field} type="number" inputMode="numeric" min={1} max={summary?.maxPeoplePerReservation ?? 99999} placeholder="Ex: 10" disabled={!afterLocation} />
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
                <Textarea {...field} rows={3} placeholder="Opcional" disabled={!afterLocation} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
      ],
    },
    {
      title: 'Horário',
      description: 'Os blocos abaixo já descontam reservas existentes e períodos bloqueados.',
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
      {locationId && <LocationSummaryCard summary={summary} isLoading={isLoadingSummary} />}

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

export interface ReservationFormSubmit {
  locationId: string;
  reservationType: string;
  participantIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  quantityPeople: number;
  notes?: string;
}

interface ReservationFormProps {
  onSubmit: (data: ReservationFormSubmit) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
