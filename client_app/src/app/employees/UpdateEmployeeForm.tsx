'use client';

import { useEffect, useState } from 'react';
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
import type { Employee } from '@/lib/mock-data';
import {
  User,
  Briefcase,
  PhilippinePeso,
  DollarSign,
  Clock,
  Users,
  Calculator,
  Shield,
  Home,
  Heart,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Employee as ApiEmployee } from '@/services/api';
import { toast } from 'sonner';
import {
  roleService,
  type Role,
  branchService,
  type Branch
} from '@/services/api';

interface ApiEmployee {
  id: number;
  user_id: number;
  name: string;
  position: string | null;
  salary: string;
  salary_basis: string;
  working_hours: number;
  category: string;
  sss_contribution: string;
  pagibig_contribution: string;
  philhealth_contribution: string;
  withholding_tax: string;
  created_at: string;
  updated_at: string;
  branch_id: number;
  email: string;
  role_id: number;
  role_name: string;
  branch_name: string;
}

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  roleId: z.string().min(1, 'Role is required'),
  salary: z.preprocess(
    val => Number(val),
    z.number().min(1, 'Salary must be at least 1')
  ),
  salaryBasis: z.string().min(1, 'Salary basis is required'),
  workingHours: z.preprocess(
    val => Number(val),
    z.number().min(1, 'Working hours must be at least 1')
  ),
  category: z.string().min(1, 'Category is required'),
  sssContribution: z.preprocess(
    val => Number(val),
    z.number().min(0, 'SSS contribution must be valid')
  ),
  pagibigContribution: z.preprocess(
    val => Number(val),
    z.number().min(0, 'Pag-IBIG contribution must be valid')
  ),
  philhealthContribution: z.preprocess(
    val => Number(val),
    z.number().min(0, 'PhilHealth contribution must be valid')
  ),
  withholdingTax: z.preprocess(
    val => Number(val),
    z.number().min(0, 'Withholding tax must be valid')
  ),
  email: z.string().email('Invalid email address'),
  branch_id: z.number().min(1, 'Branch is required')
});

interface UpdateEmployeeFormProps {
  onUpdate: (data: Partial<ApiEmployee>) => Promise<void>;
  onAdd: (data: Omit<ApiEmployee, 'id'>) => Promise<void>;
  employee: ApiEmployee | null;
  onClose?: () => void;
  branches: Branch[];
  selectedBranchId?: string | null;
}

const categories = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' }
];

const salaryBases = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' }
];

export default function UpdateEmployeeForm({
  onUpdate,
  onAdd,
  employee,
  onClose,
  branches,
  selectedBranchId
}: UpdateEmployeeFormProps) {
  console.log({ employee });
  const [roles, setRoles] = useState<Role[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          name: employee.name,
          roleId: employee.role_id.toString(),
          salary: parseFloat(employee.salary),
          salaryBasis: employee.salary_basis,
          workingHours: employee.working_hours,
          category: employee.category,
          sssContribution: parseFloat(employee.sss_contribution),
          pagibigContribution: parseFloat(employee.pagibig_contribution),
          philhealthContribution: parseFloat(employee.philhealth_contribution),
          withholdingTax: parseFloat(employee.withholding_tax),
          email: employee.email,
          branch_id: employee.branch_id
        }
      : {
          name: '',
          roleId: '',
          salary: '',
          salaryBasis: '',
          workingHours: '',
          category: '',
          sssContribution: '',
          pagibigContribution: '',
          philhealthContribution: '',
          withholdingTax: '',
          email: '',
          branch_id: selectedBranchId || ''
        }
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.getAll();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to fetch roles');
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (employee) {
      setValue('name', employee.name);
      setValue('roleId', employee.role_id.toString());
      setValue('salary', parseFloat(employee.salary));
      setValue('salaryBasis', employee.salary_basis);
      setValue('workingHours', employee.working_hours);
      setValue('category', employee.category);
      setValue('sssContribution', parseFloat(employee.sss_contribution));
      setValue(
        'pagibigContribution',
        parseFloat(employee.pagibig_contribution)
      );
      setValue(
        'philhealthContribution',
        parseFloat(employee.philhealth_contribution)
      );
      setValue('withholdingTax', parseFloat(employee.withholding_tax));
      setValue('email', employee.email);
      setValue('branch_id', employee.branch_id);
    }
  }, [employee, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const selectedRole = roles.find(role => role.role_id === data.roleId);
      const payload = {
        ...data,
        position: selectedRole?.role_name
      };

      if (employee) {
        await onUpdate({ ...payload, id: employee.id });
        // toast.success('Employee updated successfully');
      } else {
        try {
          await onAdd(payload);
          //toast.success('Employee added successfully');
        } catch (error) {
          //toast.error('Failed to add employee');
        }
      }
      // reset();
      // onClose?.();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.error || 'Failed to save employee');
    }
  };

  return (
    <Card className="w-full">
      {/* <CardHeader className="">
        <CardTitle>
          {employee ? 'Update Employee' : 'Add New Employee'}
        </CardTitle>
      </CardHeader> */}
      <CardContent className="overflow-y-auto pb-6 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Branch Selection Cards */}
          <div className="space-y-3">
            <Label>Select Branch</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {branches.map(branch => (
                <Card
                  key={branch.id}
                  className={`p-2 cursor-pointer transition-all hover:shadow-md ${
                    watch('branch_id') === branch.id
                      ? 'ring-2 ring-blue-500 shadow-md bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setValue('branch_id', branch.id)}>
                  <div className="flex flex-col space-y-1">
                    <h4 className="font-medium text-sm truncate">
                      {branch.name}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">
                      {branch.address}
                    </p>
                    <span
                      className={`mt-1 text-[10px] px-1.5 py-0.5 rounded-full w-fit ${
                        branch.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                      {branch.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            {errors.branch_id && (
              <p className="text-xs font-medium text-red-500">
                {errors.branch_id.message}
              </p>
            )}
          </div>

          {/* Rest of the form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="name"
                      {...register('name')}
                      className={cn(
                        'pl-9',
                        errors.name &&
                          'border-red-500 focus-visible:ring-red-500'
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
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleId">Role</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                    <Select
                      onValueChange={value => setValue('roleId', value)}
                      value={watch('roleId')}>
                      <SelectTrigger
                        className={cn(
                          'pl-9',
                          errors.roleId &&
                            'border-red-500 focus-visible:ring-red-500'
                        )}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem
                            key={role.role_id}
                            value={role.role_id.toString()}>
                            {role.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.roleId && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.roleId.message}
                    </p>
                  )}
                </div>

                {/* Salary Information */}
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <div className="relative">
                    <PhilippinePeso className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="salary"
                      type="number"
                      {...register('salary')}
                      className={cn(
                        'pl-9',
                        errors.salary &&
                          'border-red-500 focus-visible:ring-red-500'
                      )}
                    />
                  </div>
                  {errors.salary && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.salary.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryBasis">Salary Basis</Label>
                  <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                    <Select
                      onValueChange={value => setValue('salaryBasis', value)}
                      defaultValue={employee?.salary_basis}>
                      <SelectTrigger
                        className={cn(
                          'pl-9',
                          errors.salaryBasis &&
                            'border-red-500 focus-visible:ring-red-500'
                        )}>
                        <SelectValue placeholder="Select salary basis" />
                      </SelectTrigger>
                      <SelectContent>
                        {salaryBases.map(basis => (
                          <SelectItem key={basis.value} value={basis.value}>
                            {basis.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.salaryBasis && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.salaryBasis.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Work Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                    <Select
                      onValueChange={value => setValue('category', value)}
                      defaultValue={employee?.category}>
                      <SelectTrigger
                        className={cn(
                          'pl-9',
                          errors.category &&
                            'border-red-500 focus-visible:ring-red-500'
                        )}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem
                            key={category.value}
                            value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.category && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingHours">Working Hours (per week)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="workingHours"
                      type="number"
                      {...register('workingHours')}
                      className={cn(
                        'pl-9',
                        errors.workingHours &&
                          'border-red-500 focus-visible:ring-red-500'
                      )}
                    />
                  </div>
                  {errors.workingHours && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.workingHours.message}
                    </p>
                  )}
                </div>

                {/* Contributions */}
                <div className="space-y-2">
                  <Label htmlFor="sssContribution">SSS Contribution</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="sssContribution"
                      type="number"
                      step="0.01"
                      {...register('sssContribution')}
                      className={cn(
                        'pl-9',
                        errors.sssContribution &&
                          'border-red-500 focus-visible:ring-red-500'
                      )}
                    />
                  </div>
                  {errors.sssContribution && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.sssContribution.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pagibigContribution">
                    Pag-IBIG Contribution
                  </Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="pagibigContribution"
                      type="number"
                      step="0.01"
                      {...register('pagibigContribution')}
                      className={cn(
                        'pl-9',
                        errors.pagibigContribution &&
                          'border-red-500 focus-visible:ring-red-500'
                      )}
                    />
                  </div>
                  {errors.pagibigContribution && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.pagibigContribution.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="philhealthContribution">
                    PhilHealth Contribution
                  </Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="philhealthContribution"
                      type="number"
                      step="0.01"
                      {...register('philhealthContribution')}
                      className={cn(
                        'pl-9',
                        errors.philhealthContribution &&
                          'border-red-500 focus-visible:ring-red-500'
                      )}
                    />
                  </div>
                  {errors.philhealthContribution && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.philhealthContribution.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withholdingTax">Withholding Tax</Label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="withholdingTax"
                      type="number"
                      step="0.01"
                      {...register('withholdingTax')}
                      className={cn(
                        'pl-9',
                        errors.withholdingTax &&
                          'border-red-500 focus-visible:ring-red-500'
                      )}
                    />
                  </div>
                  {errors.withholdingTax && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.withholdingTax.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              {employee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
