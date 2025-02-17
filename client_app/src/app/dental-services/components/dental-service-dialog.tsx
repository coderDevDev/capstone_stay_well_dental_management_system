'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { DentalService } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  price: z.string().min(1, 'Price is required'),
  unit: z.string().min(1, 'Unit is required')
});

interface DentalServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: DentalService | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function DentalServiceDialog({
  open,
  onOpenChange,
  service,
  onClose,
  onSubmit
}: DentalServiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      price: '',
      unit: ''
    }
  });

  // Use useEffect to update form values when the service changes
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        price: service.price,
        unit: service.unit
      });
    }
  }, [service, form]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log({ service });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {service ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter service name"
                      {...field}
                      className={cn(fieldState.error && 'border-red-500')}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage className="text-red-500 text-sm">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Price (PHP)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter price"
                      {...field}
                      className={cn(fieldState.error && 'border-red-500')}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage className="text-red-500 text-sm">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter unit"
                      {...field}
                      className={cn(fieldState.error && 'border-red-500')}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage className="text-red-500 text-sm">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                type="submit"
                disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : service
                  ? 'Update Service'
                  : 'Add Service'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
