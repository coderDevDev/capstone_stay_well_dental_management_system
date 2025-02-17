import { useState, useEffect } from 'react';
import {
  format,
  addMinutes,
  parse,
  isBefore,
  setHours,
  setMinutes
} from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  servicesDental,
  mockAppointments,
  appointmentStatuses,
  mockPatients
} from '@/lib/mock-data';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  SaveAll
} from 'lucide-react';
import axios from 'axios';
import PayPalComponent from '@/components/paypal-button';
import { appointmentService, paymentService } from '@/services/api';
import { toast as sonnerToast } from 'sonner';

interface AppointmentFormProps {
  initialDate: Date;
  initialAppointment?: any;
  onSave: (appointmentData: any) => void;
  onDelete: (id: number) => void;
  isAdmin?: boolean;
  appointments: any[];
  patients: Array<{ id: string; name: string }>;
  servicesDental: Array<{ id: number; name: string; duration: number }>;
}

export function AppointmentForm({
  initialDate,
  initialAppointment,
  onSave,
  onDelete,
  isAdmin = false,
  appointments,
  patients,
  servicesDental
}: AppointmentFormProps) {
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  console.log({ initialAppointment });

  const [date, setDate] = useState(initialDate);
  const [service, setService] = useState(
    initialAppointment?.serviceId?.toString() || ''
  );
  const [startTime, setStartTime] = useState(
    initialAppointment ? format(initialAppointment.start, 'HH:mm') : ''
  );

  const [serviceFee, setServiceFee] = useState(
    initialAppointment?.service_fee || 0
  );

  const [endTime, setEndTime] = useState(
    initialAppointment ? format(initialAppointment.end, 'HH:mm') : ''
  );
  const [status, setStatus] = useState(initialAppointment?.status || 'Pending');
  const [patientId, setPatientId] = useState(
    initialAppointment?.patientId?.toString() ||
      loggedInUser.patient_id?.toString() ||
      ''
  );

  console.log([initialAppointment]);

  const [numberOfTeeth, setNumberOfTeeth] = useState<number>(
    initialAppointment?.number_of_teeth || 1
  );
  const [totalFee, setTotalFee] = useState<number>(0);

  console.log({ patients });
  useEffect(() => {
    if (service && startTime) {
      const selectedService = servicesDental.find(
        s => s.id.toString() === service
      );
      if (selectedService) {
        const start = parse(startTime, 'HH:mm', date);
        const end = addMinutes(start, selectedService.duration);
        setEndTime(format(end, 'HH:mm'));
      }
    }
  }, [service, startTime, date]);

  useEffect(() => {
    const selectedService = servicesDental.find(
      s => s.id.toString() === service
    );
    if (selectedService) {
      setTotalFee(selectedService.price * numberOfTeeth);
    }
  }, [service, numberOfTeeth, servicesDental]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !startTime || !endTime || !patientId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      if (initialAppointment) {
        // Handle Update
        const response = await appointmentService.update(
          initialAppointment.id,
          {
            patientId,
            serviceId: service,
            start: startTime,
            end: endTime,
            status,
            serviceFee: totalFee,
            numberOfTeeth: numberOfTeeth,
            date: date
          }
        );

        if (response.success) {
          toast.success('Appointment updated successfully');
          onSave(response.data);
        }
      } else {
        // Handle Create
        const response = await appointmentService.create({
          patientId,
          serviceId: service,
          start: startTime,
          end: endTime,
          status: 'pending',
          serviceFee: totalFee,
          numberOfTeeth: numberOfTeeth,
          date: date
        });

        if (response.success) {
          setCreatedAppointmentId(response.data.appointment_id);
          toast.success('Appointment created. Please complete the payment.');
        }
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update appointment status after successful payment
      if (createdAppointmentId) {
        // await appointmentService.update(createdAppointmentId, {
        //   status: 'confirmed'
        // });
        // onSave({
        //   id: createdAppointmentId,
        //   patientId,
        //   serviceId: service,
        //   start: startTime,
        //   end: endTime,
        //   status: 'confirmed',
        //   serviceFee
        // });
        toast.success('Appointment booked successfully!');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error updating appointment status');
    }
  };

  const isConflicting = (start: Date, end: Date) => {
    const conflictingStatuses = [
      'Confirmed',
      'In Progress',
      'On Hold',
      'Follow-Up Required'
    ];

    // console.log({ mockAppointments });
    return appointments.some(apt => {
      if (initialAppointment && apt.id === initialAppointment.id) return false;
      if (!conflictingStatuses.includes(apt.status)) return false;
      return (
        (start >= apt.start && start < apt.end) ||
        (end > apt.start && end <= apt.end) ||
        (start <= apt.start && end >= apt.end)
      );
    });
  };

  const isTimeSlotConflicting = (date: Date, time: string) => {
    const selectedDateTime = parse(
      `${format(date, 'yyyy-MM-dd')} ${time}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );
    const selectedService = servicesDental.find(
      s => s.id.toString() === service
    );
    const endDateTime = addMinutes(
      selectedDateTime,
      selectedService ? selectedService.duration : 60
    );

    return appointments.some(apt => {
      if (initialAppointment && apt.id === initialAppointment.id) return false;
      const conflictingStatuses = [
        'Confirmed',
        'In Progress',
        'On Hold',
        'Follow-Up Required'
      ];
      if (!conflictingStatuses.includes(apt.status)) return false;
      return (
        (selectedDateTime >= apt.start && selectedDateTime < apt.end) ||
        (endDateTime > apt.start && endDateTime <= apt.end) ||
        (selectedDateTime <= apt.start && endDateTime >= apt.end)
      );
    });
  };
  const generateTimeSlots = () => {
    const slots = [];
    const startOfDay = setHours(setMinutes(new Date(), 0), 9); // 9:00 AM
    const endOfDay = setHours(setMinutes(new Date(), 0), 17); // 5:00 PM
    let currentSlot = startOfDay;

    while (isBefore(currentSlot, endOfDay)) {
      slots.push(format(currentSlot, 'HH:mm'));
      currentSlot = addMinutes(currentSlot, 30); // 30-minute intervals
    }

    return slots;
  };

  const availableTimeSlots = generateTimeSlots();

  const isConfirmed = initialAppointment?.appointment_status === 'Confirmed';

  const handleNumberOfTeethChange = (value: number) => {
    if (value >= 1 && value <= 5) {
      setNumberOfTeeth(value);
    } else {
      toast.error('Number of teeth must be between 1 and 5');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="service"
            className="text-sm font-medium text-gray-700">
            Select a service:
          </label>
          <Select
            value={service}
            onValueChange={value => {
              let findAmount = servicesDental.find(d => {
                return d.id === parseInt(value);
              });

              setService(value);
              // setServiceFee(findAmount.price);
            }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {servicesDental.map(service => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <label
            htmlFor="numberOfTeeth"
            className="text-sm font-medium text-gray-700">
            Number of teeth:
          </label>
          <Input
            type="number"
            id="numberOfTeeth"
            value={numberOfTeeth}
            onChange={e => handleNumberOfTeethChange(Number(e.target.value))}
            className="w-full"
            min={1}
            max={5}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="totalFee" className="text-sm font-medium text-gray-700">
          Total Fee/Price
        </label>
        <Input type="number" value={totalFee} className="w-full" readOnly />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Date:</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={newDate => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <label htmlFor="patient" className="text-sm font-medium text-gray-700">
          Select a patient:
        </label>
        <Select
          disabled={!isAdmin && loggedInUser.patient_id}
          value={patientId}
          onValueChange={setPatientId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map(patient => (
              <SelectItem key={patient.id} value={patient.id.toString()}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="startTime"
          className="text-sm font-medium text-gray-700">
          Start time:
        </label>
        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a start time" />
          </SelectTrigger>
          <SelectContent position="popper">
            {availableTimeSlots.map(t => (
              <SelectItem
                key={t}
                value={t}
                disabled={isTimeSlotConflicting(date, t)}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="endTime" className="text-sm font-medium text-gray-700">
          End time:
        </label>
        <Input type="time" value={endTime} className="w-full" readOnly />
      </div>
      {isAdmin && (
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Status:
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {appointmentStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
        {initialAppointment ? (
          // Edit Mode
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white"
            disabled={isSubmitting || isConfirmed}>
            {isSubmitting ? 'Updating...' : 'Update Appointment'}
          </Button>
        ) : !createdAppointmentId ? (
          // Create Mode - Initial
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white"
            disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Appointment'}
          </Button>
        ) : (
          // Create Mode - Payment
          <PayPalComponent
            amount={serviceFee}
            appointmentId={createdAppointmentId}
            onSuccess={() => {
              toast.success('Appointment booked successfully!');
              onSave?.({
                id: createdAppointmentId,
                patientId,
                serviceId: service,
                start: startTime,
                end: endTime,
                status: 'confirmed',
                serviceFee
              });
            }}
          />
        )}

        {initialAppointment && (
          <Button
            className="w-full bg-red-600 text-white"
            type="button"
            variant="destructive"
            onClick={() => onDelete(initialAppointment.id)}
            disabled={isConfirmed}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
