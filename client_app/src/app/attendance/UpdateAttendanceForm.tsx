'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  const { control, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employee_id: attendance?.employee_id || '',
      date: attendance?.date || '',
      status: attendance?.status || 'Present'
    }
  });

  const employeeId = watch('employee_id');

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
      setValue('date', attendance.date);
      setValue('status', attendance.status);
    }
  }, [attendance, setValue]);

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
              <Controller
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input
                    id="date"
                    type="date"
                    {...field}
                    max={new Date().toISOString().split('T')[0]}
                    className={field.value ? '' : 'border-red-500'}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                      <SelectItem value="Half Day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
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
