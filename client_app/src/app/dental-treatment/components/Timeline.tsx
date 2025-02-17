'use client';

import { format } from 'date-fns';
import { Treatment, TreatmentFormValues } from '@/services/api';
import { STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AddTreatmentForm } from './AddTreatmentForm';
import { useState } from 'react';
import { toast } from 'sonner';

interface TimelineProps {
  treatments: Treatment[];
  showAppointmentInfo?: boolean;
  onEdit?: (treatment: Treatment) => void;
  onDelete?: (treatmentId: string) => void;
  appointments: Appointment[];
}

type StatusType = 'Done' | 'Ongoing';

const getStatusStyle = (status: string) => {
  const normalizedStatus = (status || 'Ongoing') as StatusType;
  return {
    bg: STATUS_COLORS[normalizedStatus]?.bg || STATUS_COLORS.Pending.bg,
    text: STATUS_COLORS[normalizedStatus]?.text || STATUS_COLORS.Pending.text
  };
};

export function Timeline({
  treatments = [],
  showAppointmentInfo = false,
  onEdit,
  onDelete,
  appointments
}: TimelineProps) {
  console.log({ treatments });
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(
    null
  );

  const handleEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment);
  };

  const handleEditSubmit = async (data: TreatmentFormValues) => {
    if (editingTreatment && onEdit) {
      try {
        await onEdit({
          ...editingTreatment,
          ...data,
          id: editingTreatment.id,
          dentist_id: data.dentist,
          toothTreatments: data.toothTreatments,
          medications: data.medications,
          patientId: editingTreatment.patientId,
          appointmentId: editingTreatment.appointmentId,
          date: editingTreatment.date
        });
        setEditingTreatment(null);
      } catch (error) {
        console.error('Error updating treatment:', error);
        toast.error('Failed to update treatment');
      }
    }
  };

  const sortedTreatments = Array.isArray(treatments)
    ? [...treatments].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  // Helper function to get formatted tooth treatments
  const getFormattedToothTreatments = (treatment: Treatment) => {
    // If treatment has toothTreatments array, use it directly
    if (treatment.toothTreatments && Array.isArray(treatment.toothTreatments)) {
      return treatment.toothTreatments;
    }

    // If treatment has old format with tooth_numbers and tooth_treatments
    if (treatment.tooth_numbers && treatment.tooth_treatments) {
      const numbers = treatment.tooth_numbers.split(',');
      const treatments = treatment.tooth_treatments.split(',');

      return numbers.map((number, index) => ({
        toothNumber: number,
        treatment: treatments[index] || '',
        status: 'Pending' // Default status
      }));
    }

    // Return empty array if no treatments found
    return [];
  };

  console.log({ sortedTreatments });
  return (
    <div className="space-y-8">
      {sortedTreatments.length > 0 ? (
        sortedTreatments.map((treatment, index) => (
          <div
            key={treatment.id}
            className="relative timeline-item  hover:scale-105 transition duration-300 ease-in-out p-4 rounded-md">
            {/* Vertical line connecting timeline items */}
            {index !== sortedTreatments.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
            )}

            <div className="flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
              </div>

              {/* Treatment card with updated design */}
              <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      Treatment on{' '}
                      {format(new Date(treatment.date), 'MMM d, yyyy')}
                      {showAppointmentInfo && (
                        <Badge variant="secondary" className="ml-2">
                          {treatment.appointmentId ? 'Scheduled' : 'Walk-in'}
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      By Dr. {treatment.dentist_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {treatment.type}
                    </Badge>
                    {onEdit && onDelete && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(treatment)}
                          className="h-8 w-8 p-0 hover:bg-blue-50">
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(treatment.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tooth treatments */}
                <div className="mt-4 space-y-2">
                  {getFormattedToothTreatments(treatment).map((tooth, idx) => (
                    <div
                      key={`${tooth.toothNumber}-${idx}`}
                      className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'flex items-center gap-1.5',
                          getStatusStyle(tooth.status).bg,
                          getStatusStyle(tooth.status).text
                        )}>
                        <span className="font-medium">
                          #{tooth.toothNumber}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                        <span>{tooth.treatment}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ({tooth.status || 'Pending'})
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notes with updated design */}
                {treatment.notes && (
                  <div className="mt-3 text-sm text-gray-500 border-t pt-3">
                    <p className="font-medium text-gray-600 mb-1">Notes:</p>
                    <p className="italic">{treatment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          No treatments found
        </div>
      )}

      {/* Edit Treatment Modal */}
      <Dialog
        open={!!editingTreatment}
        onOpenChange={open => !open && setEditingTreatment(null)}>
        <DialogContent className="max-w-2xl">
          {editingTreatment && (
            <AddTreatmentForm
              editData={editingTreatment}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingTreatment(null)}
              activeTab={editingTreatment.type}
              selectedTeeth={
                new Set(
                  editingTreatment.toothTreatments?.map(t => t.toothNumber) ||
                    []
                )
              }
              patientId={editingTreatment.patientId}
              appointments={appointments}
              isOpen={!!editingTreatment}
              onOpenChange={open => !open && setEditingTreatment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
