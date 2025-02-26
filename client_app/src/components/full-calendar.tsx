'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, type SlotInfo } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  mockAppointments,
  dentalServices,
  mockPatients
} from '@/lib/mock-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { appointmentService, branchService } from '@/services/api';
import { AppointmentForm } from '@/components/appointment-form';
import { AppointmentList } from '@/components/appointment-list';
import { TableView } from '@/components/table-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, List } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface FullCalendarProps {
  isAdmin?: boolean;
  selectedBranchId?: string | null;
}

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

export function FullCalendar({
  isAdmin = false,
  selectedBranchId
}: FullCalendarProps) {
  console.log({ isAdmin });
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [servicesDental, setServices] = useState([]);

  const fetchAppointments = async () => {
    try {
      let res = await axios.get('appointment/list', {
        params: {
          branchId: selectedBranchId
        }
      });
      let list = res.data.data.map(other => {
        // const phDateStart = addHours(parseISO(other.start), 8);
        // const phDateEnd = addHours(parseISO(other.end), 8);

        // let options = { timeZone: 'Asia/Manila', timeZoneName: 'long' };

        return {
          ...other,
          serviceId: other.service_id,
          patientId: other.patient_id,
          start: new Date(other.start),
          end: new Date(other.end)
        };
      });
      console.log({ list });
      setAppointments(list);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    }
  };

  const fetchPatients = async () => {
    let res = await axios.get('user/patients/all', {
      // customerId: userId,
      // type: orderType
    });

    let patients = res.data.data.map(u => {
      return {
        id: u.patient_id,
        name:
          u.patient_first_name + ' ' + u.patient_last_name + ' - ' + u.email,
        emai: u.email
      };
    });

    setPatients(patients);
  };

  const fetchServices = async () => {
    let res = await axios.get('services/list', {
      // customerId: userId,
      // type: orderType
    });

    let services = res.data.data;

    setServices(services);
  };

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        fetchAppointments(),
        fetchPatients(),
        fetchServices()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchAppointments();
  }, [selectedBranchId]);

  const [isNewAppointment, setIsNewAppointment] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [activeView, setActiveView] = useState<'calendar' | 'table'>(
    'calendar'
  );

  const events = appointments.map(appointment => {
    const service = servicesDental.find(s => s.id === appointment.serviceId);
    const patient = patients.find(p => p.id === appointment.patientId);
    return {
      ...appointment,
      date: new Date(appointment.date),
      start: new Date(appointment.start),
      end: new Date(appointment.end),
      title: `${patient?.name} - ${service?.name}`
    };
  });

  console.log({ events });

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setIsNewAppointment(true);
    setSelectedAppointment(null);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedAppointment(event);
    setIsNewAppointment(false);
    setSelectedSlot(null);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      // The save is already handled in the form
      // Just refresh the data
      await fetchData();
      setSelectedSlot(null);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    try {
      await appointmentService.delete(id);
      toast.success('Appointment deleted successfully');
      await fetchData();
      setSelectedSlot(null);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  console.log({ appointments });
  const appointmentData = [
    {
      status: 'Scheduled',
      count: appointments.filter(a => a.status === 'Confirmed').length,
      color: 'bg-blue-500'
    },
    {
      status: 'Pending',
      count: appointments.filter(a => a.status === 'Pending').length,
      color: 'bg-yellow-500'
    },
    {
      status: 'Completed',
      count: appointments.filter(a => a.status === 'Completed').length,
      color: 'bg-green-500'
    },
    {
      status: 'Cancelled',
      count: appointments.filter(a => a.status === 'Cancelled').length,
      color: 'bg-red-500'
    }
  ];
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-4 gap-4">
        {appointmentData.map(item => (
          <div key={item.status} className="flex items-center space-x-2">
            <div className={`h-4 w-4 rounded-full ${item.color}`} />
            <div>
              <p className="text-sm font-medium">{item.status}</p>
              <p className="text-2xl font-bold">{item.count}</p>
            </div>
          </div>
        ))}
      </div>
      <hr className="mb-4 mt-4" />
      <Tabs
        value={activeView}
        onValueChange={value => setActiveView(value as 'calendar' | 'table')}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendar" className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            Table View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            onDrillDown={handleDayClick}
            views={['month', 'week', 'day']}
            defaultView="month"
            eventPropGetter={event => ({
              style: {
                backgroundColor:
                  event.status === 'Confirmed'
                    ? '#3B82F6'
                    : event.status === 'Pending'
                    ? '#F59E0B'
                    : event.status === 'Cancelled'
                    ? '#EF4444'
                    : event.status === 'Completed'
                    ? '#22C55E'
                    : event.status === 'Rescheduled'
                    ? '#3B82F6'
                    : '#6B7280',
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
              }
            })}
          />
        </TabsContent>
        <TabsContent value="table">
          <TableView
            appointments={appointments}
            onEdit={handleSelectEvent}
            onDelete={handleDeleteAppointment}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
      <Dialog
        open={!!selectedSlot || !!selectedAppointment}
        onOpenChange={open => {
          if (!open) {
            setSelectedSlot(null);
            setSelectedAppointment(null);
          }
        }}>
        <DialogContent
          className="max-w-3xl w-[95vw] max-h-[90vh] p-6"
          onPointerDownOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {isNewAppointment ? 'Book an Appointment' : 'Edit Appointment'}
            </DialogTitle>
          </DialogHeader>
          <AppointmentForm
            appointments={appointments}
            initialDate={selectedSlot?.start || selectedAppointment?.start}
            initialAppointment={selectedAppointment}
            onSave={appointmentData => {
              handleSaveAppointment(appointmentData);
              setSelectedSlot(null);
              setSelectedAppointment(null);
            }}
            onDelete={handleDeleteAppointment}
            isAdmin={isAdmin}
            patients={patients}
            servicesDental={servicesDental}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Appointments for {selectedDate?.toDateString()}
            </DialogTitle>
          </DialogHeader>
          <AppointmentList
            date={selectedDate}
            appointments={appointments}
            onEdit={handleSelectEvent}
            onDelete={handleDeleteAppointment}
            isAdmin={isAdmin}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
