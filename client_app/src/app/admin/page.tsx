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
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { mockAppointments, dentalServices, mockUsers } from '@/lib/mock-data';

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const filteredAppointments = mockAppointments.filter(
    appointment =>
      selectedDate &&
      appointment.date.toDateString() === selectedDate.toDateString()
  );

  const handleCancelAppointment = (id: number) => {
    // In a real application, you would update the database here
    toast({
      title: 'Appointment Cancelled',
      description: `Appointment ${id} has been cancelled.`
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="flex space-x-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Date</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">Appointments</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map(appointment => {
                const user = mockUsers.find(u => u.id === appointment.userId);
                const service = dentalServices.find(
                  s => s.id === appointment.serviceId
                );
                return (
                  <TableRow key={appointment.id}>
                    <TableCell>{format(appointment.date, 'HH:mm')}</TableCell>
                    <TableCell>{user?.name}</TableCell>
                    <TableCell>{service?.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}>
                        Cancel
                      </Button>
                    </TableCell>
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
