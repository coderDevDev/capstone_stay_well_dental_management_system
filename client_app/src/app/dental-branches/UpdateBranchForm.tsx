'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Phone, MapPin, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().min(1, 'Address is required'),
  contact_number: z.string().min(1, 'Contact number is required'),
  manager: z.string().min(1, 'Manager name is required'),
  operating_hours: z.string().min(1, 'Operating hours are required'),
  status: z.enum(['Active', 'Inactive'])
});

interface UpdateBranchFormProps {
  onUpdate: (data: Partial<Branch>) => Promise<void>;
  onAdd: (data: Omit<Branch, 'id'>) => Promise<void>;
  branch: Branch | null;
  onClose?: () => void;
}

export default function UpdateBranchForm({
  onUpdate,
  onAdd,
  branch,
  onClose
}: UpdateBranchFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: branch || {
      status: 'Active'
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (branch) {
        await onUpdate({ ...data, id: branch.id });
      } else {
        await onAdd(data);
      }
      onClose?.();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card className="max-h-[85vh] overflow-hidden w-full">
      <CardHeader className="pb-4">
        <CardTitle>{branch ? 'Update Branch' : 'Add New Branch'}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto pb-6 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  {...register('name')}
                  className={cn(
                    'pl-9',
                    errors.name && 'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  {...register('contact_number')}
                  className={cn(
                    'pl-9',
                    errors.contact_number &&
                      'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.contact_number && (
                <p className="text-xs font-medium text-red-500">
                  {errors.contact_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  {...register('address')}
                  className={cn(
                    'pl-9',
                    errors.address &&
                      'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.address && (
                <p className="text-xs font-medium text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Branch Manager</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  {...register('manager')}
                  className={cn(
                    'pl-9',
                    errors.manager &&
                      'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.manager && (
                <p className="text-xs font-medium text-red-500">
                  {errors.manager.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Operating Hours</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  {...register('operating_hours')}
                  placeholder="e.g., Mon-Fri 9:00 AM - 6:00 PM"
                  className={cn(
                    'pl-9',
                    errors.operating_hours &&
                      'border-red-500 focus-visible:ring-red-500'
                  )}
                />
              </div>
              {errors.operating_hours && (
                <p className="text-xs font-medium text-red-500">
                  {errors.operating_hours.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                onValueChange={value =>
                  setValue('status', value as 'Active' | 'Inactive')
                }
                defaultValue={branch?.status || 'Active'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700">
              {branch ? 'Update Branch' : 'Add Branch'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
