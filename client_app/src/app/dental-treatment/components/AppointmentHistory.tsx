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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit } from 'lucide-react';
import { appointmentService } from '@/services/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { AppointmentForm } from '@/components/AppointmentForm';

interface Appointment {
  id: string;
  patientId: string;
  serviceId: string;
  date: string;
  start: string;
  end: string;
  status: string;
  service_name: string;
  service_fee: number;
  hasTreatment?: boolean;
}

interface AppointmentHistoryProps {
  patientId: string;
  onViewTreatment: (appointmentId: string) => void;
  selectedAppointmentId?: string;
}

interface AppointmentFormProps {
  initialData?: Appointment;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  editMode?: boolean;
  disabledFields?: string[];
  getAppointmentList?: any;
}

export function AppointmentHistory({
  patientId,
  onViewTreatment,
  selectedAppointmentId
}: AppointmentHistoryProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await appointmentService.getByPatientId(patientId);
        if (response.success) {
          setAppointments(response.data);

          // Only set latest confirmed appointment if none is selected
          if (!selectedAppointmentId) {
            const latestConfirmed = response.data
              .filter(app => app.status.toLowerCase() === 'confirmed')
              .sort(
                (a, b) =>
                  new Date(b.start).getTime() - new Date(a.start).getTime()
              )[0];

            if (latestConfirmed) {
              onViewTreatment(latestConfirmed.id);
            }
          }
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [patientId, selectedAppointmentId, onViewTreatment]);

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    try {
      // Only allow updating status and service fee
      const updateData = {
        status: data.status,
        service_fee: data.serviceFee
      };

      await appointmentService.update(selectedAppointment!.id, updateData);
      const response = await appointmentService.getByPatientId(patientId);
      setAppointments(response.data);
      setIsEditModalOpen(false);
      toast.success('Appointment updated successfully');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading appointments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map(appointment => (
              <TableRow
                key={appointment.id}
                className={cn(
                  'transition-colors duration-200',
                  appointment.id === selectedAppointmentId &&
                    'bg-blue-50 border-l-4 border-blue-500',
                  appointment.hasTreatment &&
                    'bg-green-50 border-l-4 border-green-500'
                )}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(appointment.start), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{appointment.service_name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    onClick={() => onViewTreatment(appointment.id)}
                    className={cn(
                      'bg-gray-50 hover:bg-gray-100 text-gray-600',
                      appointment.id === selectedAppointmentId && 'bg-blue-100'
                    )}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleEdit(appointment)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentForm
              initialData={selectedAppointment}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditModalOpen(false)}
              editMode={true}
              disabledFields={['date', 'time', 'service']}
              getAppointmentList={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
