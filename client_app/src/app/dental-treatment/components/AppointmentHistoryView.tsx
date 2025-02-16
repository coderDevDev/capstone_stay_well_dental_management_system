'use client';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Treatment } from '@/services/api';
import { Timeline } from './Timeline';

interface Appointment {
  id: string;
  start: string;
  end: string;
  service_name: string;
  status: string;
  service_fee: number;
  treatments?: Treatment[];
}

interface AppointmentHistoryViewProps {
  appointments: Appointment[];
  treatments: Treatment[];
}

export function AppointmentHistoryView({
  appointments,
  treatments
}: AppointmentHistoryViewProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  console.log({ treatments, selectedAppointment });
  const getAppointmentTreatments = (appointmentId: string) => {
    return treatments.filter(
      t => parseInt(t.appointmentId) === parseInt(appointmentId)
    );
  };

  console.log({ treatments, appointments, selectedAppointment });
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map(appointment => (
              <TableRow
                key={appointment.id}
                className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium">
                  {format(new Date(appointment.start), 'MMM d, yyyy h:mm a')}
                </TableCell>
                <TableCell>{appointment.service_name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell>₱{appointment.service_fee}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAppointment(appointment)}
                    className="hover:bg-blue-50 text-blue-600">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Treatment Details Modal */}
      {selectedAppointment && (
        <Dialog
          open={!!selectedAppointment}
          onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Treatment Details -{' '}
                {format(
                  new Date(selectedAppointment?.start || ''),
                  'MMM d, yyyy'
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-6">
                {/* Appointment Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">
                      {selectedAppointment.service_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(selectedAppointment.status)}>
                      {selectedAppointment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {format(new Date(selectedAppointment.start), 'h:mm a')} -{' '}
                      {format(new Date(selectedAppointment.end), 'h:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fee</p>
                    <p className="font-medium">
                      ₱{selectedAppointment.service_fee}
                    </p>
                  </div>
                </div>

                {/* Treatment Timeline */}
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Treatment History</h3>
                  <Timeline
                    treatments={getAppointmentTreatments(
                      selectedAppointment.id
                    )}
                    showAppointmentInfo={false}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-50 text-green-700';
    case 'pending':
      return 'bg-yellow-50 text-yellow-700';
    case 'cancelled':
      return 'bg-red-50 text-red-700';
    case 'completed':
      return 'bg-blue-50 text-blue-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
}
