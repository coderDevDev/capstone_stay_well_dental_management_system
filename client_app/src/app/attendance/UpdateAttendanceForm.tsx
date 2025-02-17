'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { employeeService, type Employee } from '@/services/api';

const attendanceSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.string().min(1, 'Status is required')
});

interface UpdateAttendanceFormProps {
  onUpdate: (data: Partial<Attendance>) => Promise<void>;
  onAdd: (data: Omit<Attendance, 'id'>) => Promise<void>;
  attendance: Attendance | null;
  onClose?: () => void;
}

export default function UpdateAttendanceForm({
  onUpdate,
  onAdd,
  attendance,
  onClose
}: UpdateAttendanceFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  console.log({ attendance });
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: attendance
      ? {
          employee_id: attendance.employee_id,
          date: attendance.date,
          status: attendance.status
        }
      : {
          employee_id: '',
          date: '',
          status: ''
        }
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getAll();
        console.log({ data });
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees');
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (attendance) {
      setValue('employee_id', attendance.employee_id.toString());
      setValue('status', attendance.status);
      trigger(['employee_id', 'status']);
    }
  }, [attendance, setValue, trigger]);

  const onSubmit = async (data: any) => {
    try {
      if (attendance) {
        await onUpdate({
          ...data,
          id: attendance.id,
          employee_id: data.employee_id
        });
      } else {
        await onAdd({
          ...data,
          employee_id: data.employee_id
        });
      }
      reset();
      onClose?.();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save attendance record');
    }
  };

  return (
    <Card className="max-h-[85vh] overflow-hidden w-full">
      <CardHeader className="pb-4">
        <CardTitle>
          {attendance ? 'Update Attendance' : 'Add New Attendance'}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto pb-6 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee</Label>
              <Select
                onValueChange={value => setValue('employee_id', value)}
                value={attendance?.employee_id}
                defaultValue={attendance?.employee_id}>
                <SelectTrigger
                  className={errors.employee_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee_id && (
                <p className="text-xs font-medium text-red-500">
                  {errors.employee_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                max={new Date().toISOString().split('T')[0]}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-xs font-medium text-red-500">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={value => {
                  setValue('status', value);
                  if (errors.status) {
                    setValue('status', value, { shouldValidate: true });
                  }
                }}
                defaultValue={attendance?.status || 'Present'}>
                <SelectTrigger
                  className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs font-medium text-red-500">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              className="font-bold shadow-2xl"
              type="button"
              variant="outline"
              onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-2xl">
              {attendance ? 'Update Attendance' : 'Add Attendance'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
