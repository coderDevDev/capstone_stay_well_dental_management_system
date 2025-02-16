'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { employees, calculatePayroll } from '@/lib/mock-data';
import {
  CalendarIcon,
  User,
  DollarSign,
  Printer,
  LayoutGrid,
  LayoutList,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { employeeService, payrollService } from '@/services/api';
import { toast } from 'sonner';
import PayslipModal from './PayslipModal';

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const itemsPerPage = 10;
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getAll();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees');
      }
    };

    fetchEmployees();
  }, []);

  // Load default data on mount
  useEffect(() => {
    const loadDefaultData = async () => {
      const currentDate = new Date();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');

      try {
        const calculatedPayroll = await payrollService.calculate(
          null,
          `${currentDate.getFullYear()}-${currentMonth}-01`,
          `${currentDate.getFullYear()}-${currentMonth}-${new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).getDate()}`
        );
        setPayrollData(calculatedPayroll);
        setSelectedMonth(currentMonth);
      } catch (error: any) {
        console.error('Error loading default payroll:', error);
        toast.error(error.message || 'Failed to load default payroll');
      }
    };

    if (payrollData.length === 0) {
      loadDefaultData();
    }
  }, [payrollData.length]);

  const processPayroll = async () => {
    if (!selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    try {
      const year = new Date().getFullYear();
      const startDate = `${year}-${selectedMonth}-01`;
      const endDate = `${year}-${selectedMonth}-${new Date(
        year,
        Number.parseInt(selectedMonth),
        0
      ).getDate()}`;

      const employeeId = selectedEmployee === '0' ? null : selectedEmployee;
      const calculatedPayroll = await payrollService.calculate(
        employeeId,
        startDate,
        endDate
      );
      setPayrollData(calculatedPayroll);
    } catch (error: any) {
      console.error('Error processing payroll:', error);
      toast.error(error.message || 'Failed to process payroll');
    }
  };

  const filteredPayroll = payrollData.filter(data =>
    data.employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedPayroll = filteredPayroll.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayroll.length / itemsPerPage);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll Management</CardTitle>
              <CardDescription>
                Process and manage employee payroll
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[250px]">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select employee (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">January</SelectItem>
                <SelectItem value="02">February</SelectItem>
                <SelectItem value="03">March</SelectItem>
                <SelectItem value="04">April</SelectItem>
                <SelectItem value="05">May</SelectItem>
                <SelectItem value="06">June</SelectItem>
                <SelectItem value="07">July</SelectItem>
                <SelectItem value="08">August</SelectItem>
                <SelectItem value="09">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={processPayroll}
              className="hover:bg-blue-700 font-bold text-white bg-blue-700 shadow-2xl">
              Process Payroll
            </Button>
          </div>

          {payrollData.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Total Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayroll.map(data => (
                    <TableRow key={data.employee.id}>
                      <TableCell className="font-medium">
                        {data.employee.name}
                      </TableCell>
                      <TableCell>{data.employee.role_name}</TableCell>
                      <TableCell>₱{data.grossPay.toLocaleString()}</TableCell>
                      <TableCell>
                        ₱{data.totalDeductions.toLocaleString()}
                      </TableCell>
                      <TableCell>₱{data.netPay.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                          onClick={() => setSelectedPayslip(data)}>
                          <Printer className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    p => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => setPage(p)}
                          isActive={page === p}>
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPayslip && (
        <PayslipModal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          payrollData={selectedPayslip}
          selectedMonth={selectedMonth}
        />
      )}
    </div>
  );
}
