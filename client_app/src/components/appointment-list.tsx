import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { dentalServices, mockPatients } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

interface AppointmentListProps {
  date: Date | null;
  appointments: any[];
  onEdit: (appointment: any) => void;
  onDelete: (id: number) => void;
  isAdmin?: boolean;
}

export function AppointmentList({
  date,
  appointments,
  onEdit,
  onDelete,
  isAdmin = false
}: AppointmentListProps) {
  const filteredAppointments = appointments.filter(apt => {
    return date && new Date(apt.start).toDateString() === date.toDateString();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Canceled':
        return 'bg-red-500';
      case 'Rescheduled':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {filteredAppointments.length === 0 ? (
        <p className="text-center text-gray-500">
          No appointments for this day.
        </p>
      ) : (
        filteredAppointments.map(apt => {
          const service = dentalServices.find(s => s.id === apt.serviceId);
          const patient = mockPatients.find(p => p.id === apt.patientId);
          return (
            <div
              key={apt.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="font-semibold text-blue-600">{service?.name}</p>
                <p className="text-sm text-gray-600">
                  {format(apt.start, 'HH:mm')} - {format(apt.end, 'HH:mm')}
                </p>
                <p className="text-sm text-gray-600">
                  Patient: {patient?.name}
                </p>
                <Badge className={`mt-2 ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </Badge>
              </div>
              <div className="space-x-2">
                <Button onClick={() => onEdit(apt)} variant="outline" size="sm">
                  Edit
                </Button>
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(apt.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
