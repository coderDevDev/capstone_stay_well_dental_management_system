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
import { ToastContainer, toast } from 'react-toastify';
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

interface AppointmentFormProps {
  initialDate: Date;
  initialAppointment?: any;
  onSave: (appointmentData: any) => void;
  onDelete: (id: number) => void;
  isAdmin?: boolean;
  appointments: any[];
}

export function AppointmentForm({
  initialDate,
  initialAppointment,
  onSave,
  onDelete,
  isAdmin = false,
  appointments,
  patients = [],
  servicesDental = []
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

  const handleSubmit = e => {
    e.preventDefault();
    if (!service || !startTime || !endTime || !patientId) {
      // toast({
      //   title: 'Error',
      //   description: 'Please fill in all fields',
      //   variant: 'destructive'
      // });

      toast.error('Please fill in all field', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });

      return;
    }

    const start = parse(startTime, 'HH:mm', date);
    const end = parse(endTime, 'HH:mm', date);

    console.log({ dex: isConflicting(start, end), start, end });

    if (isConflicting(start, end)) {
      // toast({
      //   title: 'Error',
      //   description:
      //     'This time slot conflicts with an existing appointment. Please choose another time.',
      //   variant: 'destructive'
      // });

      toast.warning(
        'This time slot conflicts with an existing appointment. Please choose another time.',
        {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        }
      );

      return;
    }

    onSave({
      id: initialAppointment?.id || Date.now(),
      patientId: Number.parseInt(patientId),
      serviceId: Number.parseInt(service),
      start,
      end,
      status,
      serviceFee
    });

    // toast({
    //   title: 'Success',
    //   description: 'Your appointment has been saved successfully!'
    // });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <label htmlFor="service" className="text-sm font-medium text-gray-700">
          Select a service:
        </label>
        <Select
          value={service}
          onValueChange={value => {
            // console.log({ initialAppointment, e });

            let findAmount = servicesDental.find(d => {
              return d.id === parseInt(value);
            });

            setService(value);
            setServiceFee(findAmount.amount);
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

      <div className="space-y-2">
        <label htmlFor="endTime" className="text-sm font-medium text-gray-700">
          Service Fee
        </label>
        <Input type="number" value={serviceFee} className="w-full" readOnly />
      </div>
      <div className="flex justify-between">
        <Button type="submit" className="w-full mr-2 bg-blue-700 text-white">
          <SaveAll className="h-4 w-4 mr-1" />
          {initialAppointment ? 'Update' : 'Book'} Appointment
        </Button>

        <PayPalComponent amount={500} />
        {initialAppointment && (
          <Button
            className="bg-red-600 text-white"
            type="button"
            variant="destructive"
            onClick={() => onDelete(initialAppointment.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
      {initialAppointment &&
        (status === 'In Progress' || status === 'Completed') && (
          <Link to={`/treatment/${initialAppointment.id}`}>
            <Button className="w-full mt-2">Treatment</Button>
          </Link>
        )}
    </form>
  );
}
