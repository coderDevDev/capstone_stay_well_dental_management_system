'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { AddTreatmentForm } from './AddTreatmentForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Treatment, TreatmentFormValues } from '@/services/api';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';
import { appointmentService } from '@/services/api';
import { STATUS_COLORS } from '@/lib/constants';

interface Prescription {
  medicineName: string;
  quantity: number;
}

interface TreatmentHistoryProps {
  treatments: Treatment[];
  onEdit: (treatment: Treatment) => void;
  onDelete: (treatmentId: string) => void;
  onAdd: (treatment: Treatment) => void;
  selectedTeeth: Set<string>;
  activeTab: 'medical' | 'cosmetic';
  patientId: string;
}

export function TreatmentHistory({
  treatments,
  onEdit,
  onDelete,
  onAdd,
  selectedTeeth,
  activeTab,
  patientId
}: TreatmentHistoryProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(
    null
  );
  const [deletingTreatmentId, setDeletingTreatmentId] = useState<string | null>(
    null
  );
  const [treatmentsState, setTreatments] = useState<Treatment[]>(treatments);

  // Sync with parent treatments prop
  useEffect(() => {
    setTreatments(treatments);
  }, [treatments]);

  const handleTreatmentClick = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setSelectedTreatment(null);
  };

  const handleSubmit = async (data: TreatmentFormValues) => {
    try {
      if (selectedTreatment) {
        const updatedTreatment = {
          ...selectedTreatment,
          dentist_id: data.dentist,
          notes: data.notes,
          toothTreatments: data.toothTreatments,
          type: data.type || activeTab
        };
        await onEdit(updatedTreatment);

        // Update local state immediately
        setTreatments(current =>
          current.map(t =>
            t.id === updatedTreatment.id ? updatedTreatment : t
          )
        );
      } else {
        const newTreatment = {
          ...data,
          type: activeTab,
          patientId,
          date: new Date(),
          id: '', // Will be set by server
          dentist_name: '' // Will be set by server
        };
        await onAdd(newTreatment);
      }
      handleModalClose();
    } catch (error: any) {
      console.error('Error saving treatment:', error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${selectedTreatment ? 'update' : 'save'} treatment`
      );
    }
  };

  const handleDeleteClick = (treatmentId: string) => {
    setDeletingTreatmentId(treatmentId);
  };

  const handleDeleteConfirm = async () => {
    if (deletingTreatmentId) {
      await onDelete(deletingTreatmentId);
      // Update local state immediately
      setTreatments(current =>
        current.filter(t => t.id !== deletingTreatmentId)
      );
      setDeletingTreatmentId(null);
    }
  };

  // Socket event handlers
  useEffect(() => {
    const handleTreatmentCreated = (data: {
      patientId: string;
      treatment: Treatment;
    }) => {
      if (data.patientId === patientId) {
        setTreatments(current => [...current, data.treatment]);
      }
    };

    const handleTreatmentUpdated = (data: {
      patientId: string;
      treatment: Treatment;
    }) => {
      if (data.patientId === patientId) {
        setTreatments(current =>
          current.map(t => (t.id === data.treatment.id ? data.treatment : t))
        );
      }
    };

    const handleTreatmentDeleted = (data: {
      patientId: string;
      treatmentId: string;
    }) => {
      if (data.patientId === patientId) {
        setTreatments(current =>
          current.filter(t => t.id !== data.treatmentId)
        );
      }
    };

    socket.on('treatmentCreated', handleTreatmentCreated);
    socket.on('treatmentUpdated', handleTreatmentUpdated);
    socket.on('treatmentDeleted', handleTreatmentDeleted);

    return () => {
      socket.off('treatmentCreated', handleTreatmentCreated);
      socket.off('treatmentUpdated', handleTreatmentUpdated);
      socket.off('treatmentDeleted', handleTreatmentDeleted);
    };
  }, [patientId]);

  if (!treatments || treatments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
        <div className="text-lg font-medium">No treatments found</div>
        <div className="text-sm text-gray-400">
          Select teeth and add a treatment to get started
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {treatmentsState.map(treatment => (
        <div
          key={treatment.id}
          onClick={() => handleTreatmentClick(treatment)}
          className="group relative overflow-hidden border rounded-lg p-5 hover:bg-gray-50 cursor-pointer transition-all duration-200">
          {/* Status indicator line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  {format(new Date(treatment.date), 'MMM d, yyyy')}
                </h3>
                <Badge variant="outline" className="capitalize">
                  {treatment.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                Dentist: {treatment.dentist_name}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={e => {
                e.stopPropagation();
                handleDeleteClick(treatment.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {treatment.toothTreatments.map((tooth, index) => (
                <Badge
                  key={`${tooth.toothNumber}-${index}`}
                  variant="secondary"
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors',
                    STATUS_COLORS[tooth.status].bg,
                    STATUS_COLORS[tooth.status].text
                  )}>
                  <span className="font-medium">#{tooth.toothNumber}</span>
                  <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                  <span>{tooth.treatment}</span>
                  <span className="text-xs opacity-75">({tooth.status})</span>
                </Badge>
              ))}
            </div>
          </div>

          {treatment.notes && (
            <div className="mt-3 text-sm text-gray-500 border-t pt-3">
              <p className="line-clamp-2">{treatment.notes}</p>
            </div>
          )}
        </div>
      ))}

      <Dialog open={isAddModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Treatment Details</DialogTitle>
          </DialogHeader>
          <AddTreatmentForm
            patientId={patientId}
            selectedTeeth={selectedTeeth}
            onSubmit={handleSubmit}
            onCancel={handleModalClose}
            activeTab={activeTab}
            editData={selectedTreatment || undefined}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingTreatmentId}
        onOpenChange={() => setDeletingTreatmentId(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Treatment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this treatment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
