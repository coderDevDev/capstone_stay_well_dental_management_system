'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Phone, User } from 'lucide-react';

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contact: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required')
});

interface AddSupplierFormProps {
  onAdd: (data: Omit<Supplier, 'id'>) => void;
  onUpdate?: (data: Supplier) => void;
  mode?: 'add' | 'update';
  initialData?: Supplier | null;
}

export default function AddSupplierForm({
  onAdd,
  onUpdate,
  mode = 'add',
  initialData
}: AddSupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData || {}
  });

  const onSubmit = (data: any) => {
    if (mode === 'add') {
      onAdd(data);
    } else if (onUpdate && initialData) {
      onUpdate({ ...data, id: initialData.id });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'add' ? 'Add New Supplier' : 'Update Supplier'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('name')}
                placeholder="Enter company name"
                className={`pl-8 ${errors.name ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Contact Email</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('contact')}
                type="email"
                placeholder="Enter contact email"
                className={`pl-8 ${errors.contact ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.contact && (
              <p className="text-red-500 text-xs">{errors.contact.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('phone')}
                placeholder="Enter phone number"
                className={`pl-8 ${errors.phone ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <div className="relative">
              <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('address')}
                placeholder="Enter address"
                className={`pl-8 ${errors.address ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-600 text-white">
            {mode === 'add' ? 'Add Supplier' : 'Update Supplier'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
