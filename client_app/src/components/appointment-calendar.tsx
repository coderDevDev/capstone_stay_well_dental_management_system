'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { mockAppointments, dentalServices } from '@/lib/mock-data';

export function AppointmentCalendar({ userId }: { userId: number }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const userAppointments = mockAppointments.filter(
    appointment => appointment.patientId === userId
  );

  const filteredAppointments = userAppointments.filter(
    appointment =>
      selectedDate &&
      appointment.date.toString() === selectedDate.toDateString()
  );

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Your Appointments</h2>
      <div className="flex space-x-8">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Service</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map(appointment => {
                const service = dentalServices.find(
                  s => s.id === appointment.serviceId
                );
                return (
                  <TableRow key={appointment.id}>
                    <TableCell>{format(appointment.date, 'HH:mm')}</TableCell>
                    <TableCell>{service?.name}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
