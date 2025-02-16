'use client';

import { useState } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Package, Building2, Hash, FileText } from 'lucide-react';

const orderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.preprocess(
    val => Number(val),
    z.number().min(1, 'Quantity must be at least 1')
  ),
  notes: z.string().optional()
});

interface AddSupplierOrderFormProps {
  onAdd: (order: any, updateImmediately: boolean) => void;
  inventory: InventoryItem[];
  suppliers: Supplier[];
}

export default function AddSupplierOrderForm({
  onAdd,
  inventory,
  suppliers
}: AddSupplierOrderFormProps) {
  const [date, setDate] = useState<Date | null>(new Date());
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(orderSchema)
  });

  const supplierValue = watch('supplierId');
  const itemValue = watch('itemId');

  const handleSupplierChange = (value: string) => {
    setValue('supplierId', value, { shouldValidate: true });
  };

  const handleItemChange = (value: string) => {
    setValue('itemId', value, { shouldValidate: true });
  };

  const onSubmit = (data: any) => {
    onAdd(
      {
        ...data,
        supplierId: parseInt(data.supplierId),
        itemId: parseInt(data.itemId),
        quantity: parseInt(data.quantity),
        date: date?.toISOString().split('T')[0]
      },
      false
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select value={supplierValue} onValueChange={handleSupplierChange}>
              <SelectTrigger
                className={`${errors.supplierId ? 'border-red-500' : ''}`}>
                <div className="flex items-center">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select supplier" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplierId && (
              <p className="text-red-500 text-xs">
                {errors.supplierId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Item</Label>
            <Select value={itemValue} onValueChange={handleItemChange}>
              <SelectTrigger
                className={`${errors.itemId ? 'border-red-500' : ''}`}>
                <div className="flex items-center">
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select item" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {inventory.map(item => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemId && (
              <p className="text-red-500 text-xs">{errors.itemId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="relative">
              <Hash className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                {...register('quantity')}
                className={`pl-8 ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder="Enter quantity"
              />
            </div>
            {errors.quantity && (
              <p className="text-red-500 text-xs">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Order Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal`}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <div className="relative">
              <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('notes')}
                className="pl-8"
                placeholder="Any special instructions or notes"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-600 text-white">
            Add Order
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
