'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Search,
  PlusCircle,
  Download,
  FileText,
  Edit2,
  Eye,
  Calculator,
  Calendar,
  DollarSign,
  Printer
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay
} from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import { cn } from '@/lib/utils';

interface PayrollRecord {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  rate_per_hour: number;
  hours_worked: number;
  overtime_hours: number;
  overtime_pay: number;
  allowances: number;
  deductions: number;
  sss_contribution: number;
  philhealth_contribution: number;
  pagibig_contribution: number;
  tax: number;
  net_pay: number;
  status: string;
  created_at: string;
}

interface PayrollManagementProps {
  employees: any[];
  branches: any[];
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
}

export default function PayrollManagement({
  employees,
  branches,
  selectedBranchId,
  setSelectedBranchId
}: PayrollManagementProps) {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(
    null
  );
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [payrollTab, setPayrollTab] = useState<string>('salary');
  const [payslipData, setPayslipData] = useState<any>(null);

  // States for payroll generation
  const [payPeriodStart, setPayPeriodStart] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [payPeriodEnd, setPayPeriodEnd] = useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  // For rate editing
  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);
  const [employeeRateData, setEmployeeRateData] = useState({
    employee_id: '',
    rate_per_hour: 0,
    working_hours: 0
  });

  const [payrollFormData, setPayrollFormData] = useState({
    employee_id: '',
    pay_period_start: '',
    pay_period_end: '',
    overtime_hours: 0,
    overtime_pay: 0,
    allowances: 0,
    status: 'Pending'
  });

  useEffect(() => {
    fetchPayrollRecords();
    fetchAttendanceRecords();
  }, [selectedBranchId]);

  const fetchPayrollRecords = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/payroll');
      setPayrollRecords(response.data);
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      toast.error('Failed to load payroll records');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get('/attendance');
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const fetchPayroll = async () => {
    try {
      setIsLoading(true);

      // Fetch all payroll records
      const response = await axios.get('/payroll');
      setPayrollRecords(response.data);

      // If employee is selected, also fetch their specific records
      if (selectedEmployee) {
        const employeePayrollResponse = await axios.get(
          `/payroll/employee/${selectedEmployee}`
        );
        // You could set these to a separate state if needed
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      toast.error('Failed to fetch payroll records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedEmployee]);

  const generatePayroll = async () => {
    try {
      if (
        !payrollFormData.employee_id ||
        !payrollFormData.pay_period_start ||
        !payrollFormData.pay_period_end
      ) {
        toast.error('Please fill all required fields');
        return;
      }

      setIsLoading(true);

      // First, we need to calculate the payroll details
      const employee = employees.find(
        e => e.id.toString() === payrollFormData.employee_id
      );
      if (!employee) {
        toast.error('Employee not found');
        return;
      }

      // 1. Get attendance records for the period to calculate hours worked
      const attendanceResponse = await axios.get('/attendance', {
        params: {
          employee_id: payrollFormData.employee_id,
          start_date: payrollFormData.pay_period_start,
          end_date: payrollFormData.pay_period_end
        }
      });

      const attendanceRecords = attendanceResponse.data;

      // 2. Calculate hours worked based on attendance
      const presentDays = attendanceRecords.filter(
        r => r.status === 'Present'
      ).length;
      const halfDays = attendanceRecords.filter(
        r => r.status === 'Half Day'
      ).length;
      const lateDays = attendanceRecords.filter(
        r => r.status === 'Late'
      ).length;

      // Calculate total hours based on present days (assume 8 hours per day)
      const totalWorkDays = presentDays + halfDays * 0.5 + lateDays * 0.9;
      const hoursWorked = totalWorkDays * 8;

      // 3. Get the employee's rate per hour
      const ratePerHour =
        employee.rate_per_hour ||
        employee.salary / (employee.working_hours * 4);

      // 4. Calculate basic salary
      const basicSalary = ratePerHour * hoursWorked;

      // 5. Calculate contributions
      const sssContribution = calculateSSS(basicSalary);
      const philhealthContribution = calculatePhilhealth(basicSalary);
      const pagibigContribution = calculatePagibig(basicSalary);
      const tax = calculateTax(
        basicSalary -
          sssContribution -
          philhealthContribution -
          pagibigContribution
      );

      // 6. Calculate total deductions
      const totalDeductions =
        sssContribution + philhealthContribution + pagibigContribution + tax;

      // 7. Calculate net pay - ensure overtime_pay is properly defined
      const overtimePay =
        payrollFormData.overtime_pay ||
        payrollFormData.overtime_hours * ratePerHour * 1.25;

      const netPay =
        basicSalary +
        overtimePay +
        (payrollFormData.allowances || 0) -
        totalDeductions;

      // Debug the calculated values
      console.log('Calculated values:', {
        basicSalary,
        ratePerHour,
        hoursWorked,
        overtimePay,
        allowances: payrollFormData.allowances,
        totalDeductions,
        netPay
      });

      // 8. Build the complete payload - create a new object instead of spreading
      const completePayrollData = {
        employee_id: payrollFormData.employee_id,
        pay_period_start: payrollFormData.pay_period_start,
        pay_period_end: payrollFormData.pay_period_end,
        status: payrollFormData.status,
        basic_salary: basicSalary,
        rate_per_hour: ratePerHour,
        hours_worked: hoursWorked,
        overtime_hours: payrollFormData.overtime_hours || 0,
        overtime_pay: overtimePay || 0,
        allowances: payrollFormData.allowances || 0,
        sss_contribution: sssContribution,
        philhealth_contribution: philhealthContribution,
        pagibig_contribution: pagibigContribution,
        tax: tax,
        deductions: totalDeductions,
        net_pay: netPay // Ensure this is explicitly set
      };

      // Final check before sending
      if (
        completePayrollData.net_pay === undefined ||
        completePayrollData.net_pay === null
      ) {
        throw new Error('Net pay calculation failed');
      }

      console.log('Sending payload:', completePayrollData);

      // Now send the complete data to the API
      const response = await axios.post('/payroll', completePayrollData);

      if (response.data) {
        toast.success('Payroll record created successfully');
        setIsAddModalOpen(false);

        // Call fetchPayroll to refresh the data
        fetchPayroll();
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast.error(error.response?.data?.error || 'Failed to generate payroll');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for contributions
  const calculateSSS = (salary: number) => Math.min(salary * 0.045, 900); // 4.5% up to a maximum of 900
  const calculatePhilhealth = (salary: number) => Math.min(salary * 0.03, 900); // 3% up to a maximum of 900
  const calculatePagibig = (salary: number) => Math.min(salary * 0.02, 100); // 2% up to a maximum of 100

  // Simplified tax calculation
  const calculateTax = (income: number) => {
    if (income <= 20833) return 0; // No tax for income up to 250k annually
    if (income <= 33332) return (income - 20833) * 0.15; // 15% over 250k
    if (income <= 66666) return 1875 + (income - 33332) * 0.2; // 20% over 400k
    if (income <= 166666) return 8541.8 + (income - 66666) * 0.25; // 25% over 800k
    if (income <= 666666) return 33541.8 + (income - 166666) * 0.3; // 30% over 2M
    return 183541.8 + (income - 666666) * 0.35; // 35% over 8M
  };

  const viewPayslip = (record: PayrollRecord) => {
    setSelectedRecord(record);

    const employee = employees.find(
      e => e.id.toString() === record.employee_id
    );

    setPayslipData({
      ...record,
      employeeName: employee ? employee.name : 'Unknown Employee',
      position: employee ? employee.role_name : 'Unknown Position',
      periodStart: format(new Date(record.pay_period_start), 'MMMM d, yyyy'),
      periodEnd: format(new Date(record.pay_period_end), 'MMMM d, yyyy')
    });

    setIsViewModalOpen(true);
  };

  const printPayslip = () => {
    if (!payslipData) return;

    const employee = employees.find(
      e => e.id.toString() === payslipData.employee_id
    );
    if (!employee) return;

    // Convert numeric values to ensure they're processed correctly
    const basicSalary = Number(payslipData.basic_salary);
    const ratePerHour = Number(payslipData.rate_per_hour);
    const hoursWorked = Number(payslipData.hours_worked);
    const overtimeHours = Number(payslipData.overtime_hours);
    const overtimePay = Number(payslipData.overtime_pay);
    const allowances = Number(payslipData.allowances);
    const sssContribution = Number(payslipData.sss_contribution);
    const philhealthContribution = Number(payslipData.philhealth_contribution);
    const pagibigContribution = Number(payslipData.pagibig_contribution);
    const tax = Number(payslipData.tax);
    const deductions = Number(payslipData.deductions);
    const netPay = Number(payslipData.net_pay);

    // Then use these converted variables in your HTML template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin-bottom: 5px;">PAYSLIP</h1>
          <h3 style="margin-top: 0; color: #666;">Stay Well Dental Management System</h3>
        </div>
        
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 50%;">
                <p><strong>Employee:</strong> ${employee.name}</p>
                <p><strong>Position:</strong> ${
                  employee.position || employee.role_name || 'N/A'
                }</p>
                <p><strong>Employee ID:</strong> ${employee.id}</p>
              </td>
              <td style="width: 50%;">
                <p><strong>Pay Period:</strong> ${payslipData.periodStart} to ${
      payslipData.periodEnd
    }</p>
                <p><strong>Payment Date:</strong> ${format(
                  new Date(),
                  'MMMM dd, yyyy'
                )}</p>
                <p><strong>Payment Method:</strong> Direct Deposit</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="display: flex; margin-bottom: 20px;">
          <div style="flex: 1; margin-right: 10px;">
            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Earnings</h3>
            <table style="width: 100%;">
              <tr>
                <td>Basic Salary</td>
                <td style="text-align: right;">₱${basicSalary.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}</td>
              </tr>
              ${
                overtimePay > 0
                  ? `
                <tr>
                  <td>Overtime Pay</td>
                  <td style="text-align: right;">₱${overtimePay.toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 }
                  )}</td>
                </tr>
              `
                  : ''
              }
              ${
                allowances > 0
                  ? `
                <tr>
                  <td>Allowances</td>
                  <td style="text-align: right;">₱${allowances.toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 }
                  )}</td>
                </tr>
              `
                  : ''
              }
              <tr>
                <td style="border-top: 1px solid #ddd; padding-top: 5px;"><strong>Gross Pay</strong></td>
                <td style="border-top: 1px solid #ddd; padding-top: 5px; text-align: right;"><strong>₱${(
                  basicSalary +
                  overtimePay +
                  allowances
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2
                })}</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="flex: 1; margin-left: 10px;">
            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Deductions</h3>
            <table style="width: 100%;">
              <tr>
                <td>SSS Contribution</td>
                <td style="text-align: right;">₱${sssContribution.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}</td>
              </tr>
              <tr>
                <td>PhilHealth</td>
                <td style="text-align: right;">₱${philhealthContribution.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}</td>
              </tr>
              <tr>
                <td>Pag-IBIG</td>
                <td style="text-align: right;">₱${pagibigContribution.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}</td>
              </tr>
              <tr>
                <td>Withholding Tax</td>
                <td style="text-align: right;">₱${tax.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}</td>
              </tr>
              <tr>
                <td style="border-top: 1px solid #ddd; padding-top: 5px;"><strong>Total Deductions</strong></td>
                <td style="border-top: 1px solid #ddd; padding-top: 5px; text-align: right;"><strong>₱${deductions.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}</strong></td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin-bottom: 20px;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 70%;"><strong>NET PAY</strong></td>
              <td style="width: 30%; text-align: right;"><strong style="font-size: 1.2em;">₱${netPay.toLocaleString(
                undefined,
                { minimumFractionDigits: 2 }
              )}</strong></td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Attendance Summary</h3>
          <table style="width: 100%;">
            <tr>
              <td style="width: 50%;">
                <p><strong>Hours Worked:</strong> ${hoursWorked.toFixed(
                  1
                )} hrs</p>
                <p><strong>Rate per Hour:</strong> ₱${ratePerHour.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}/hr</p>
                ${
                  overtimeHours > 0
                    ? `<p><strong>Overtime Hours:</strong> ${overtimeHours.toFixed(
                        1
                      )} hrs</p>`
                    : ''
                }
              </td>
              <td style="width: 50%;">
                <p>Present Days: ${
                  payslipData.attendance?.presentDays || 'N/A'
                }</p>
                <p>Absent Days: ${
                  payslipData.attendance?.absentDays || 'N/A'
                }</p>
                <p>Late Days: ${payslipData.attendance?.lateDays || 'N/A'}</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; display: flex; justify-content: space-between;">
          <div style="width: 45%;">
            <p style="margin-bottom: 30px;">Prepared by:</p>
            <div style="border-top: 1px solid #000; padding-top: 5px;">
              <p style="margin: 0; text-align: center;">HR Manager</p>
            </div>
          </div>
          
          <div style="width: 45%;">
            <p style="margin-bottom: 30px;">Received by:</p>
            <div style="border-top: 1px solid #000; padding-top: 5px;">
              <p style="margin: 0; text-align: center;">${employee.name}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    html2pdf(element, {
      margin: 10,
      filename: `Payslip_${employee.name}_${format(
        new Date(payslipData.pay_period_end),
        'MMM_yyyy'
      )}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).then(() => {
      document.body.removeChild(element);
    });
  };

  const updateEmployeeRate = async (employeeId, data) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`/employees/${employeeId}/rate`, data);

      if (response.data.success) {
        toast.success('Salary rate updated successfully');
        fetchEmployees(); // Refresh employee data
        setIsEditRateModalOpen(false);
      } else {
        toast.error(response.data.message || 'Failed to update salary rate');
      }
    } catch (error) {
      console.error('Error updating salary rate:', error);
      // toast.error(
      //   error.response?.data?.message || 'Failed to update salary rate'
      // );
    } finally {
      setIsLoading(false);
    }
  };

  const clearPayrollForm = () => {
    setSelectedEmployee('');
    setPayPeriodStart(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setPayPeriodEnd(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  };

  const openEditRateModal = (employee: any) => {
    setEmployeeRateData({
      employee_id: employee.id.toString(),
      rate_per_hour:
        employee.salary_basis === 'Hourly'
          ? employee.salary
          : employee.salary / (employee.workingHours * 4),
      working_hours: employee.workingHours || 40
    });
    setIsEditRateModalOpen(true);
  };

  // Filter employees by branch
  const filteredEmployees = employees.filter(employee => {
    return selectedBranchId ? employee.branch_id === selectedBranchId : true;
  });

  // Filter payroll records by search term
  const filteredPayroll = payrollRecords.filter(record => {
    const employee = employees.find(
      e => e.id.toString() === record.employee_id
    );
    if (!employee) return false;

    const employeeName = employee.name.toLowerCase();
    return employeeName.includes(searchTerm.toLowerCase());
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Management</CardTitle>
        <CardDescription>
          Manage employee salaries, rates, and generate payslips
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={payrollTab} onValueChange={setPayrollTab}>
          <TabsList className="bg-gray-100 p-1 rounded-lg mb-4">
            <TabsTrigger
              value="payroll"
              className={cn(
                'px-4 py-2 rounded-md transition-all',
                payrollTab === 'payroll'
                  ? 'bg-white shadow-sm font-medium text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              )}>
              Payroll Records
            </TabsTrigger>
            <TabsTrigger
              value="salary"
              className={cn(
                'px-4 py-2 rounded-md transition-all',
                payrollTab === 'salary'
                  ? 'bg-white shadow-sm font-medium text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              )}>
              Salary Rates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payroll">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Button
                onClick={() => {
                  clearPayrollForm();
                  setIsAddModalOpen(true);
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Generate Payroll
              </Button>
            </div>

            {/* Payroll Records Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Loading payroll records...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayroll.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        No payroll records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayroll.map(record => {
                      const employee = employees.find(
                        e => e.id.toString() === record.employee_id
                      );
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {employee?.name || 'Unknown Employee'}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(record.pay_period_start),
                              'MMM dd'
                            )}{' '}
                            -{' '}
                            {format(
                              new Date(record.pay_period_end),
                              'MMM dd, yyyy'
                            )}
                          </TableCell>
                          <TableCell>
                            ₱
                            {record.basic_salary.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </TableCell>
                          <TableCell>
                            ₱
                            {record.deductions.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₱
                            {record.net_pay.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </TableCell>
                          <TableCell>
                            <div
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.status === 'Paid'
                                  ? 'bg-green-100 text-green-800'
                                  : record.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                              {record.status}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => viewPayslip(record)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="salary">
            <div className="space-y-4">
              {/* Salary Rates Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Salary Basis</TableHead>
                      <TableHead>Rate/Salary</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map(employee => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            {employee.name}
                          </TableCell>
                          <TableCell>{employee.role_name}</TableCell>
                          <TableCell>{employee.salary_basis}</TableCell>
                          <TableCell>
                            {employee.salary_basis === 'Hourly'
                              ? `₱${employee.salary.toLocaleString()}/hr`
                              : `₱${employee.salary.toLocaleString()}/month`}
                          </TableCell>
                          <TableCell>
                            {employee.workingHours} hrs/week
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                              onClick={() => openEditRateModal(employee)}>
                              <Edit2 className="h-4 w-4 text-blue-600 mr-1" />
                              Edit Rate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Generate Payroll Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate Payroll</DialogTitle>
              <DialogDescription>
                Create a new payroll record for the selected employee
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee" className="text-right">
                  Employee
                </Label>
                <Select
                  value={payrollFormData.employee_id}
                  onValueChange={value =>
                    setPayrollFormData({
                      ...payrollFormData,
                      employee_id: value
                    })
                  }>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select employee" />
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
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={payrollFormData.pay_period_start}
                  onChange={e =>
                    setPayrollFormData({
                      ...payrollFormData,
                      pay_period_start: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={payrollFormData.pay_period_end}
                  onChange={e =>
                    setPayrollFormData({
                      ...payrollFormData,
                      pay_period_end: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="overtime" className="text-right">
                  Overtime Hours
                </Label>
                <Input
                  id="overtime"
                  type="number"
                  min="0"
                  value={payrollFormData.overtime_hours}
                  onChange={e => {
                    const hours = parseFloat(e.target.value) || 0;
                    const employee = employees.find(
                      emp => emp.id.toString() === payrollFormData.employee_id
                    );
                    const ratePerHour =
                      employee?.rate_per_hour ||
                      employee?.salary / (employee?.working_hours * 4) ||
                      0;
                    const overtimePay = hours * ratePerHour * 1.25;

                    setPayrollFormData({
                      ...payrollFormData,
                      overtime_hours: hours,
                      overtime_pay: overtimePay
                    });
                  }}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allowances" className="text-right">
                  Allowances
                </Label>
                <Input
                  id="allowances"
                  type="number"
                  min="0"
                  value={payrollFormData.allowances}
                  onChange={e =>
                    setPayrollFormData({
                      ...payrollFormData,
                      allowances: parseFloat(e.target.value) || 0
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={payrollFormData.status}
                  onValueChange={value =>
                    setPayrollFormData({ ...payrollFormData, status: value })
                  }>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generatePayroll} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Generate Payroll'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Salary Rate Dialog */}
        <Dialog
          open={isEditRateModalOpen}
          onOpenChange={setIsEditRateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Salary Rate</DialogTitle>
              <DialogDescription>
                Update hourly rate and working hours for this employee.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rate-per-hour" className="text-right">
                  Rate per Hour
                </Label>
                <div className="col-span-3 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    ₱
                  </span>
                  <Input
                    id="rate-per-hour"
                    type="number"
                    step="0.01"
                    value={employeeRateData.rate_per_hour}
                    onChange={e =>
                      setEmployeeRateData({
                        ...employeeRateData,
                        rate_per_hour: parseFloat(e.target.value)
                      })
                    }
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="working-hours" className="text-right">
                  Working Hours/Week
                </Label>
                <Input
                  id="working-hours"
                  type="number"
                  value={employeeRateData.working_hours}
                  onChange={e =>
                    setEmployeeRateData({
                      ...employeeRateData,
                      working_hours: parseInt(e.target.value)
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="col-span-4 pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  <p>
                    Calculated Monthly Salary:{' '}
                    <span className="font-medium">
                      ₱
                      {(
                        employeeRateData.rate_per_hour *
                        employeeRateData.working_hours *
                        4
                      ).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Based on 4 weeks per month)
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditRateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  updateEmployeeRate(
                    employeeRateData.employee_id,
                    employeeRateData
                  )
                }
                disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Update Rate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Payslip Dialog */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Employee Payslip</DialogTitle>
              <DialogDescription>
                Payslip details for the selected pay period
              </DialogDescription>
            </DialogHeader>

            {payslipData && (
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold">PAYSLIP</h2>
                  <p>
                    {payslipData.periodStart} to {payslipData.periodEnd}
                  </p>
                </div>

                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Employee Name</p>
                      <p className="font-medium">{payslipData.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium">{payslipData.position}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold border-b pb-2 mb-2">
                        Earnings
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Basic Salary</span>
                          <span>
                            ₱
                            {payslipData.basic_salary.toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 }
                            )}
                          </span>
                        </div>
                        {payslipData.overtime_pay > 0 && (
                          <div className="flex justify-between">
                            <span>Overtime</span>
                            <span>
                              ₱
                              {payslipData.overtime_pay.toLocaleString(
                                undefined,
                                { minimumFractionDigits: 2 }
                              )}
                            </span>
                          </div>
                        )}
                        {payslipData.allowances > 0 && (
                          <div className="flex justify-between">
                            <span>Allowances</span>
                            <span>
                              ₱
                              {payslipData.allowances.toLocaleString(
                                undefined,
                                { minimumFractionDigits: 2 }
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2 font-medium">
                          <span>Gross Pay</span>
                          <span>
                            ₱
                            {(
                              payslipData.basic_salary +
                              payslipData.overtime_pay +
                              payslipData.allowances
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold border-b pb-2 mb-2">
                        Deductions
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>SSS</span>
                          <span>
                            ₱
                            {payslipData.sss_contribution.toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 }
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>PhilHealth</span>
                          <span>
                            ₱
                            {payslipData.philhealth_contribution.toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 }
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pag-IBIG</span>
                          <span>
                            ₱
                            {payslipData.pagibig_contribution.toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 }
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>
                            ₱
                            {payslipData.tax.toLocaleString(undefined, {
                              minimumFractionDigits: 2
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-medium">
                          <span>Total Deductions</span>
                          <span>
                            ₱
                            {payslipData.deductions.toLocaleString(undefined, {
                              minimumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">NET PAY</span>
                    <span className="text-lg font-bold">
                      ₱
                      {payslipData.net_pay.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>

                <div className="p-4 text-xs text-gray-500">
                  <p>
                    Hours Worked: {Number(payslipData.hours_worked).toFixed(1)}{' '}
                    hrs
                  </p>
                  <p>
                    Rate per Hour: ₱
                    {Number(payslipData.rate_per_hour).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2
                      }
                    )}
                    /hr
                  </p>
                  {payslipData.overtime_hours > 0 && (
                    <p>
                      Overtime Hours:{' '}
                      {Number(payslipData.overtime_hours).toFixed(1)} hrs
                    </p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setIsViewModalOpen(false)}
                variant="outline">
                Close
              </Button>
              <Button onClick={printPayslip} className="bg-blue-600 text-white">
                <Printer className="h-4 w-4 mr-2" />
                Print Payslip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
