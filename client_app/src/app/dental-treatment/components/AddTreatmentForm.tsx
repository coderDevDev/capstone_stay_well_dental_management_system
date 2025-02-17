'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooth } from './ToothChart';
import { toast } from 'sonner';
import {
  employeeService,
  Treatment,
  ToothTreatment,
  TreatmentFormValues,
  treatmentService,
  Appointment,
  InventoryUpdate
} from '@/services/api';
import { useEffect, useState } from 'react';
import { inventoryService } from '@/services/api';
import { CookingPot, Plus, Trash } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { error } from 'console';
import { cn } from '@/lib/utils';

// Define treatment options based on type
const medicalTreatments = [
  'Fillings',
  'Crowns',
  'Root Canal Treatment',
  'Tooth Extraction',
  'Veneers',
  'Dental Implants',
  'Bonding'
] as const;

const cosmeticTreatments = [
  'Teeth Cleaning',
  'Fluoride Treatment',
  'Braces/Invisalign',
  'Teeth Whitening',
  'Scaling and Root Planing',
  'Gum Surgery'
] as const;

interface ToothStatus {
  number: string;
  status: 'Pending' | 'Ongoing' | 'Done';
}

interface Medication {
  id: string;
  name: string;
  quantity: number;
}

interface ToothTreatment {
  toothNumber: string;
  treatment: string;
  status: 'Pending' | 'Ongoing' | 'Done';
}

interface AddTreatmentFormProps {
  selectedTeeth: Set<string>;
  onSubmit: (data: TreatmentFormValues) => Promise<void>;
  onCancel: () => void;
  activeTab: 'medical' | 'cosmetic';
  editData?: Treatment;
  patientId: string;
  appointments: Appointment[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentsHistory: Appointment[];
}

const treatmentFormSchema = z.object({
  toothTreatments: z.array(
    z.object({
      toothNumber: z.string(),
      treatment: z.string(),
      status: z.enum(['Pending', 'Ongoing', 'Done'])
    })
  ),
  dentist: z.string().min(1, 'Dentist is required'),
  notes: z.string().optional(),
  type: z.enum(['medical', 'cosmetic']),
  appointmentId: z.string().min(1, 'Appointment is required').optional(),
  medications: z
    .array(
      z.object({
        id: z.string().min(1, 'Medication is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1')
      })
    )
    .optional()
});

type FormValues = z.infer<typeof treatmentFormSchema>;

// Updated tooth mapping with common names
const toothMap: Record<string, { label: string; commonName: string }> = {
  '1': { label: 'Third Molar', commonName: 'Upper Right Wisdom Tooth' },
  '2': { label: 'Second Molar', commonName: 'Upper Right 12-Year Molar' },
  '3': { label: 'First Molar', commonName: 'Upper Right 6-Year Molar' }
  // ... add all teeth mappings
};

export function AddTreatmentForm({
  selectedTeeth,
  onSubmit,
  onCancel,
  activeTab,
  editData,
  patientId,
  appointments,
  isOpen,
  onOpenChange,
  treatmentsHistory
}: AddTreatmentFormProps) {
  const [dentists, setDentists] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [medications, setMedications] = useState<
    Array<{ id: string; name: string; stock: number }>
  >([]);
  const [showMedication, setShowMedication] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: {
      toothTreatments:
        editData?.toothTreatments ||
        Array.from(selectedTeeth).map(tooth => ({
          toothNumber: tooth,
          treatment: '',
          status: 'Ongoing'
        })),
      dentist: editData?.dentist_id || '',
      notes: editData?.notes || '',
      type: editData?.type || activeTab,
      appointmentId: editData?.appointmentId || '',
      medications: editData?.medications || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medications'
  });

  const { errors } = form.formState;

  const toothTreatments = form.watch('toothTreatments');

  // Load dentists
  useEffect(() => {
    const loadDentists = async () => {
      try {
        const response = await employeeService.getDentists();
        setDentists(
          response.data.map((dentist: any) => ({
            id: dentist.id.toString(),
            name: dentist.full_name
          }))
        );
      } catch (error) {
        console.error('Error loading dentists:', error);
        toast.error('Failed to load dentists');
      }
    };
    loadDentists();
  }, []);

  // Handle edit data
  useEffect(() => {
    if (editData) {
      const formattedTreatments =
        editData.toothTreatments ||
        (editData.tooth_numbers && editData.tooth_treatments
          ? editData.tooth_numbers.split(',').map((number, index) => ({
              toothNumber: number,
              treatment: editData.tooth_treatments?.split(',')[index] || '',
              status: 'Pending'
            }))
          : []);

      form.reset({
        toothTreatments: formattedTreatments,
        dentist: editData.dentist_id,
        notes: editData.notes || '',
        type: editData.type
      });
    }
  }, [editData, form]);

  // Load medications from inventory
  useEffect(() => {
    const loadMedications = async () => {
      try {
        const response = await inventoryService.getAll();
        setMedications(
          response.map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
            stock: item.quantity
          }))
        );
      } catch (error) {
        console.error('Error loading medications:', error);
        toast.error('Failed to load medications');
      }
    };
    loadMedications();
  }, []);

  const handleSubmit = async (data: FormValues) => {
    // Only check for existing treatments in create mode
    if (!editData) {
      const selectedAppointment = appointments.find(
        app => app.id === data.appointmentId
      );

      if (selectedAppointment?.treatments?.length) {
        toast.error('This appointment already has a treatment.');
        return;
      }
    }

    try {
      // Check if all treatments are done and we have medications in edit mode
      if (editData && data.toothTreatments.every(t => t.status === 'Done')) {
        const medications = data.medications;
        if (medications?.length > 0) {
          try {
            await inventoryService.updateInventoryQuantities(
              medications.map(med => ({
                id: med.id,
                quantity: med.quantity
              }))
            );
            toast.success('Inventory updated successfully');
          } catch (error) {
            console.error('Error updating inventory:', error);
            toast.error('Failed to update inventory');
            return;
          }
        }
      }

      // Submit the treatment update
      await onSubmit({
        ...data,
        patientId,
        appointmentId: editData ? editData.appointmentId : data.appointmentId
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting treatment:', error);
      toast.error(
        error.response?.data?.message || 'Failed to submit treatment'
      );
    }
  };

  // Simplified checkAllDone - only handles showing medication fields
  const checkAllDone = () => {
    if (Array.isArray(toothTreatments)) {
      const allDone = toothTreatments.every(tt => tt.status === 'Done');
      setShowMedication(allDone);

      // Reset medication fields if not all done
      if (!allDone) {
        form.setValue('medications', []);
      }
    }
  };

  useEffect(() => {
    checkAllDone();
  }, [toothTreatments]);

  const treatments =
    activeTab === 'medical' ? medicalTreatments : cosmeticTreatments;

  // Reset form when selectedTeeth changes
  useEffect(() => {
    if (!editData) {
      form.setValue(
        'toothTreatments',
        Array.from(selectedTeeth).map(tooth => ({
          toothNumber: tooth,
          treatment: '',
          status: 'Ongoing'
        }))
      );
    }
  }, [selectedTeeth, editData, form]);

  console.log({ appointments });
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Update Treatment' : 'Add Treatment'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6">
            {!editData && (
              <FormField
                control={form.control}
                name="appointmentId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Appointments</FormLabel>
                    <Select
                      onValueChange={value => {
                        const selectedAppointment = treatmentsHistory.find(
                          app => app.appointmentId === value
                        );

                        if (selectedAppointment?.appointmentId) {
                          toast.error(
                            'This appointment already has treatments. Please select another appointment.'
                          );
                          field.onChange(''); // Reset the selection
                        } else {
                          field.onChange(value.toString());
                        }
                      }}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={cn(fieldState.error && 'border-red-500')}>
                          <SelectValue placeholder="Select appointment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointments.map(appointment => (
                          <SelectItem
                            key={appointment.id}
                            value={appointment.id.toString()}>
                            {format(
                              new Date(appointment.start),
                              'MMM d, yyyy h:mm a'
                            )}{' '}
                            ( {appointment.service_name} -{' '}
                            {appointment.number_of_teeth} teeth )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FormMessage className="text-red-500 text-sm">
                        {fieldState.error.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />
            )}

            {toothTreatments && toothTreatments.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Treatment Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium text-sm text-gray-500">
                    Tooth Number
                  </div>
                  <div className="font-medium text-sm text-gray-500">
                    Treatment
                  </div>
                  <div className="font-medium text-sm text-gray-500">
                    Status
                  </div>

                  {toothTreatments.map((treatment, index) => (
                    <React.Fragment key={treatment.toothNumber}>
                      <div className="text-sm">#{treatment.toothNumber}</div>
                      <FormField
                        control={form.control}
                        name={`toothTreatments.${index}.treatment`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select treatment" />
                            </SelectTrigger>
                            <SelectContent>
                              {treatments.map(t => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`toothTreatments.${index}.status`}
                        render={({ field }) => (
                          <Select
                            onValueChange={async value => {
                              field.onChange(value);
                              if (editData) {
                                await checkAllDone();
                              }
                            }}
                            defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ongoing">Ongoing</SelectItem>
                              <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="dentist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dentist</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dentist" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dentists.map(dentist => (
                        <SelectItem key={dentist.id} value={dentist.id}>
                          {dentist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional notes"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {editData && showMedication && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">
                  Prescribed Medications
                </h3>
                <div className="space-y-4">
                  {fields.map((medication, index) => {
                    const selectedMedication = medications.find(
                      med =>
                        med.id === form.getValues(`medications.${index}.id`)
                    );
                    const maxQuantity = selectedMedication
                      ? selectedMedication.stock
                      : Infinity;

                    return (
                      <div
                        key={medication.id}
                        className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-center">
                        <FormField
                          control={form.control}
                          name={`medications.${index}.id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medication</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select medication" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {medications.map(med => (
                                    <SelectItem key={med.id} value={med.id}>
                                      {med.name} (Stock: {med.stock})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max={maxQuantity}
                                  {...field}
                                  onChange={e => {
                                    const value = Number(e.target.value);
                                    if (value > maxQuantity) {
                                      form.setError(
                                        `medications.${index}.quantity`,
                                        {
                                          type: 'manual',
                                          message: `Quantity exceeds available stock of ${maxQuantity}`
                                        }
                                      );
                                    } else {
                                      form.clearErrors(
                                        `medications.${index}.quantity`
                                      );
                                      field.onChange(value);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => remove(index)}
                          className="flex items-center space-x-2 mt-2">
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}

                  <Button
                    type="button"
                    onClick={() => append({ id: '', quantity: 1 })}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4" />
                    <span>Add Medication</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white"
                disabled={Object.keys(errors).length > 0}>
                {editData ? 'Update Treatment' : 'Add Treatment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
