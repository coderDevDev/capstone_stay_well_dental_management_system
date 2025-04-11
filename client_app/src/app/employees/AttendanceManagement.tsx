'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  FileText,
  Printer
} from 'lucide-react';
import {
  format,
  startOfToday,
  isWeekend,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import DTRReport from './DTRReport';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  employeeName: string;
  date: string;
  status: string;
  branch_id?: string;
}

interface AttendanceManagementProps {
  employees: any[];
  branches: any[];
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
}

export default function AttendanceManagement({
  employees,
  branches,
  selectedBranchId = null,
  setSelectedBranchId
}: AttendanceManagementProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState<Date>(startOfToday());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [attendanceTab, setAttendanceTab] = useState('records');
  const [isDTRModalOpen, setIsDTRModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [dtrMonth, setDtrMonth] = useState<Date>(new Date());
  const [employeeDTR, setEmployeeDTR] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present'
  });

  // Add these additional state variables for filtering
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  // Add a state to track initial loading
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch attendance records
  useEffect(() => {
    fetchAttendance();
  }, [selectedBranchId]);

  // Update the branch selector to ensure "All Branches" is selected by default
  useEffect(() => {
    // Initialize with "All Branches" selected on component load
    if (selectedBranchId === undefined) {
      setSelectedBranchId(null);
    }
  }, []);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/attendance');
      setAttendance(response.data);
      console.log('Attendance data loaded:', response.data.length, 'records');
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setIsLoading(false);
      setInitialLoading(false); // Mark initial loading as complete
    }
  };

  const handleAddAttendance = async () => {
    try {
      if (!formData.employee_id || !formData.date || !formData.status) {
        toast.error('Please fill all required fields');
        return;
      }

      const employee = employees.find(
        e => e.id.toString() === formData.employee_id
      );
      if (!employee) {
        toast.error('Invalid employee selected');
        return;
      }

      setIsLoading(true);
      const response = await axios.post('/attendance', {
        ...formData,
        branch_id: selectedBranchId
      });

      setAttendance(prev => [...prev, response.data]);
      setIsAddModalOpen(false);
      resetForm();
      toast.success('Attendance record added successfully');
    } catch (error: any) {
      console.error('Error adding attendance:', error);
      toast.error(
        error.response?.data?.error || 'Failed to add attendance record'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAttendance = async () => {
    try {
      if (!selectedRecord) return;

      if (!formData.employee_id || !formData.date || !formData.status) {
        toast.error('Please fill all required fields');
        return;
      }

      setIsLoading(true);
      const response = await axios.put(`/attendance/${selectedRecord.id}`, {
        ...formData,
        branch_id: selectedBranchId
      });

      setAttendance(prev =>
        prev.map(item => (item.id === selectedRecord.id ? response.data : item))
      );
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      resetForm();
      toast.success('Attendance record updated successfully');
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      toast.error(
        error.response?.data?.error || 'Failed to update attendance record'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attendance record?'))
      return;

    try {
      setIsLoading(true);
      await axios.delete(`/attendance/${id}`);
      setAttendance(prev => prev.filter(item => item.id !== id));
      toast.success('Attendance record deleted successfully');
    } catch (error: any) {
      console.error('Error deleting attendance:', error);
      toast.error(
        error.response?.data?.error || 'Failed to delete attendance record'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Present'
    });
  };

  const editRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      employee_id: record.employee_id.toString(),
      date: record.date,
      status: record.status
    });
    setIsEditModalOpen(true);
  };

  // Enhanced date comparison logic in the filteredAttendance function
  const filteredAttendance = initialLoading
    ? []
    : attendance.filter(record => {
        // Filter by employee name
        const nameMatch = record.employeeName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Filter by branch if selected
        const branchMatch = selectedBranchId
          ? record.branch_id === selectedBranchId
          : true;

        // Filter by status if not "all"
        const statusMatch =
          statusFilter === 'all' ? true : record.status === statusFilter;

        // Enhanced date filter with better comparison
        let dateMatch = true;
        if (dateFilter.start && dateFilter.end) {
          try {
            // Normalize all dates to YYYY-MM-DD format for comparison
            const recordDateStr = record.date.split('T')[0]; // Get just the date part
            const startDateStr = format(dateFilter.start, 'yyyy-MM-dd');
            const endDateStr = format(dateFilter.end, 'yyyy-MM-dd');

            console.log('Date comparison:', {
              record: recordDateStr,
              start: startDateStr,
              end: endDateStr
            });

            // String comparison works well for YYYY-MM-DD format
            dateMatch =
              recordDateStr >= startDateStr && recordDateStr <= endDateStr;

            console.log('Date match result:', dateMatch);
          } catch (e) {
            console.error('Date comparison error:', e, record.date);
            dateMatch = false;
          }
        }

        const finalResult =
          nameMatch && branchMatch && statusMatch && dateMatch;

        // Log the final filter decision for this record
        if (!finalResult) {
          console.log('Record filtered out due to:', {
            nameMatch,
            branchMatch,
            statusMatch,
            dateMatch
          });
        }

        return finalResult;
      });

  console.log({ filteredAttendance });
  const viewEmployeeDTR = async (employeeId: string) => {
    try {
      setIsLoading(true);
      setSelectedEmployeeId(employeeId);

      // Use the dateFilter.start as the basis for the DTR month if available
      const selectedMonth = dateFilter.start || new Date();
      setDtrMonth(selectedMonth);

      // Get the first and last day of the selected month
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      console.log('Fetching attendance for employee:', employeeId);
      console.log('Date range:', startDate, 'to', endDate);

      // Fetch attendance records for this employee in the selected month
      const response = await axios.get('/attendance', {
        params: {
          employee_id: parseInt(employeeId), // Convert string ID to number if needed
          start_date: startDate,
          end_date: endDate
        }
      });

      console.log('API response:', response.data);
      setEmployeeDTR(response.data);
      setIsDTRModalOpen(true);
    } catch (error) {
      console.error('Error fetching DTR data:', error);
      toast.error('Failed to load DTR records');
    } finally {
      setIsLoading(false);
    }
  };

  const printDTR = () => {
    const printContent = document.getElementById('dtr-printable');
    if (!printContent) return;

    const employee = employees.find(
      e => e.id.toString() === selectedEmployeeId
    );
    if (!employee) return;

    const html2pdf = window.html2pdf;
    const opt = {
      margin: 0.5,
      filename: `DTR_${employee.name}_${format(dtrMonth, 'MMMM_yyyy')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(printContent).save();
  };

  useEffect(() => {
    console.log('Employee DTR data:', employeeDTR);

    // Log the dates for the current month to help debug
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(dtrMonth),
      end: endOfMonth(dtrMonth)
    });

    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const matchingRecord = employeeDTR.find(r => {
        if (!r.date) return false;
        const recordDate = new Date(r.date);
        return format(recordDate, 'yyyy-MM-dd') === dateStr;
      });

      if (matchingRecord) {
        console.log(`Found record for ${dateStr}:`, matchingRecord);
      }
    });
  }, [employeeDTR, dtrMonth]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'Absent':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'Half Day':
        return 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'Leave':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  // Add an effect to clear filters on initial load
  useEffect(() => {
    // This will run only once on component mount
    // Reset all filters to show all data
    setSearchTerm('');
    setStatusFilter('all');
    // Set date filter to cover the full month by default
    setDateFilter({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    });
    setSelectedBranchId(null);
  }, []);

  return (
    <div>
      <Tabs value={attendanceTab} onValueChange={setAttendanceTab}>
        <TabsList className="bg-gray-100 p-1 rounded-lg mb-4">
          <TabsTrigger
            value="records"
            className={cn(
              'px-4 py-2 rounded-md transition-all',
              attendanceTab === 'records'
                ? 'bg-white shadow-sm font-medium text-primary'
                : 'text-gray-600 hover:text-gray-900'
            )}>
            Attendance Records
          </TabsTrigger>
          {/* <TabsTrigger
            value="dtr"
            className={cn(
              'px-4 py-2 rounded-md transition-all',
              attendanceTab === 'dtr'
                ? 'bg-white shadow-sm font-medium text-primary'
                : 'text-gray-600 hover:text-gray-900'
            )}>
            DTR Reports
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Daily Time Record (DTR)</CardTitle>
              <CardDescription>
                Track employee attendance and manage time records
              </CardDescription>
            </CardHeader>
            <CardContent>
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

                <div className="flex items-center gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {format(date, 'MMMM yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={date => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    onClick={() => {
                      resetForm();
                      setIsAddModalOpen(true);
                    }}
                    className="bg-blue-700 hover:bg-blue-800 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </div>
              </div>

              {/* Enhanced filter section in the UI */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search employee..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Status filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                      <SelectItem value="Half Day">Half Day</SelectItem>
                      <SelectItem value="Leave">Leave</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date range picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter.start && dateFilter.end
                          ? `${format(dateFilter.start, 'MMM d')} - ${format(
                              dateFilter.end,
                              'MMM d'
                            )}`
                          : 'Date Range'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={{
                          from: dateFilter.start || new Date(),
                          to: dateFilter.end || new Date()
                        }}
                        onSelect={range =>
                          setDateFilter({
                            start: range?.from,
                            end: range?.to
                          })
                        }
                      />
                      <div className="p-3 border-t border-gray-100 flex justify-between">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setDateFilter({ start: undefined, end: undefined });
                            // Force a re-render to apply the filter
                            setAttendance([...attendance]);
                          }}>
                          Clear
                        </Button>
                        <Button
                          onClick={() => {
                            // Close the popover
                            document.body.click();
                            // Force a re-render to ensure the filter is applied
                            setAttendance([...attendance]);
                            console.log('Applied date filter:', {
                              start: dateFilter.start
                                ? format(dateFilter.start, 'yyyy-MM-dd')
                                : 'none',
                              end: dateFilter.end
                                ? format(dateFilter.end, 'yyyy-MM-dd')
                                : 'none'
                            });
                          }}>
                          Apply
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Branch filter - using the existing branch select */}
                  {branches.length > 0 && (
                    <Select
                      value={selectedBranchId || 'all'}
                      onValueChange={value =>
                        setSelectedBranchId(value === 'all' ? null : value)
                      }>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Branches">
                          {selectedBranchId
                            ? branches.find(
                                b => b.id.toString() === selectedBranchId
                              )?.name
                            : 'All Branches'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(branch => (
                          <SelectItem
                            key={branch.id}
                            value={branch.id.toString()}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Reset filters button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFilter({ start: undefined, end: undefined });
                      setSelectedBranchId(null);
                    }}>
                    Reset Filters
                  </Button>
                </div>
              </div>

              {/* Show a message when no results match the filters */}
              {initialLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-2 text-gray-500">
                    Loading attendance records...
                  </p>
                </div>
              ) : filteredAttendance.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>No attendance records match your filters</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFilter({ start: undefined, end: undefined });
                      setSelectedBranchId(null);
                    }}>
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.employeeName}
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.date), 'PPP')}
                        </TableCell>
                        <TableCell>
                          <span className={getStatusBadgeClass(record.status)}>
                            {record.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 border-green-200"
                              onClick={() =>
                                viewEmployeeDTR(record.employee_id.toString())
                              }>
                              <FileText className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                              onClick={() => editRecord(record)}>
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 hover:bg-red-100 border-red-200"
                              onClick={() => handleDeleteAttendance(record.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Add Attendance Dialog */}
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                  <DialogTitle>Add Attendance Record</DialogTitle>
                  <DialogDescription>
                    Record an employee's attendance for a specific date
                  </DialogDescription>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="employee" className="text-right">
                        Employee
                      </Label>
                      <Select
                        value={formData.employee_id}
                        onValueChange={value =>
                          setFormData({ ...formData, employee_id: value })
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
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={e =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={value =>
                          setFormData({ ...formData, status: value })
                        }>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Present">Present</SelectItem>
                          <SelectItem value="Absent">Absent</SelectItem>
                          <SelectItem value="Late">Late</SelectItem>
                          <SelectItem value="Leave">Leave</SelectItem>
                          <SelectItem value="Half Day">Half Day</SelectItem>
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
                    <Button onClick={handleAddAttendance} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Record'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Attendance Dialog */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                  <DialogTitle>Edit Attendance Record</DialogTitle>
                  <DialogDescription>
                    Update this attendance record
                  </DialogDescription>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="employee" className="text-right">
                        Employee
                      </Label>
                      <Select
                        value={formData.employee_id}
                        onValueChange={value =>
                          setFormData({ ...formData, employee_id: value })
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
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={e =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={value =>
                          setFormData({ ...formData, status: value })
                        }>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Present">Present</SelectItem>
                          <SelectItem value="Absent">Absent</SelectItem>
                          <SelectItem value="Late">Late</SelectItem>
                          <SelectItem value="Leave">Leave</SelectItem>
                          <SelectItem value="Half Day">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateAttendance}
                      disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Record'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dtr">
          <DTRReport employees={employees} branches={branches} />
        </TabsContent>
      </Tabs>

      {/* DTR View Modal */}
      <Dialog open={isDTRModalOpen} onOpenChange={setIsDTRModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="flex justify-between items-center">
            <span>Employee Daily Time Record (DTR)</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="dtr-month">Month:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[180px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dtrMonth, 'MMMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dtrMonth}
                      onSelect={date => {
                        if (date) {
                          setDtrMonth(date);
                          if (selectedEmployeeId) {
                            viewEmployeeDTR(selectedEmployeeId);
                          }
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={printDTR}>
                <Printer className="h-4 w-4 mr-2" />
                Print DTR
              </Button>
            </div>
          </DialogTitle>

          <div className="mt-4 overflow-auto max-h-[70vh]" id="dtr-printable">
            {selectedEmployeeId && (
              <div className="bg-white p-4 rounded-md">
                {/* DTR Header */}
                <div className="text-center mb-4 border-b pb-4">
                  <h2 className="text-xl font-bold uppercase">
                    Daily Time Record
                  </h2>
                  <p className="text-sm">Republic of the Philippines</p>
                  <p className="text-sm">Civil Service Form No. 48</p>
                </div>

                {/* Employee Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p>
                      <span className="font-semibold">Name:</span>{' '}
                      {
                        employees.find(
                          e => e.id.toString() === selectedEmployeeId
                        )?.name
                      }
                    </p>
                    <p>
                      <span className="font-semibold">Position:</span>{' '}
                      {
                        employees.find(
                          e => e.id.toString() === selectedEmployeeId
                        )?.role_name
                      }
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold">For the month of:</span>{' '}
                      {format(dtrMonth, 'MMMM yyyy')}
                    </p>
                    <p>
                      <span className="font-semibold">Official Hours:</span>{' '}
                      8:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>

                {/* DTR Table */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-sm">Day</th>
                      <th colSpan={2} className="border p-2 text-sm">
                        AM
                      </th>
                      <th colSpan={2} className="border p-2 text-sm">
                        PM
                      </th>
                      <th className="border p-2 text-sm">Total Hours</th>
                      <th className="border p-2 text-sm">Remarks</th>
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-sm"></th>
                      <th className="border p-2 text-sm">In</th>
                      <th className="border p-2 text-sm">Out</th>
                      <th className="border p-2 text-sm">In</th>
                      <th className="border p-2 text-sm">Out</th>
                      <th className="border p-2 text-sm"></th>
                      <th className="border p-2 text-sm"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {eachDayOfInterval({
                      start: startOfMonth(dtrMonth),
                      end: endOfMonth(dtrMonth)
                    }).map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const record = employeeDTR.find(r => {
                        if (!r.date) return false;
                        const recordDate = new Date(r.date);
                        return format(recordDate, 'yyyy-MM-dd') === dateStr;
                      });
                      const isWeekend =
                        day.getDay() === 0 || day.getDay() === 6;

                      // Define times and hours based on attendance status
                      let amIn = '-',
                        amOut = '-',
                        pmIn = '-',
                        pmOut = '-',
                        totalHours = '-';
                      let remarks = isWeekend ? 'Weekend' : '';

                      if (record) {
                        // Use actual status from the database as remarks
                        remarks = record.status;

                        // Derive time entries based on status
                        if (record.status === 'Present') {
                          amIn = '8:00';
                          amOut = '12:00';
                          pmIn = '13:00';
                          pmOut = '17:00';
                          totalHours = '8';
                        } else if (record.status === 'Late') {
                          amIn = '8:30'; // Assumed late time
                          amOut = '12:00';
                          pmIn = '13:00';
                          pmOut = '17:00';
                          totalHours = '7.5';
                        } else if (record.status === 'Half Day') {
                          amIn = '8:00';
                          amOut = '12:00';
                          pmIn = '-';
                          pmOut = '-';
                          totalHours = '4';
                        } else if (record.status === 'Absent') {
                          remarks = 'Absent';
                        }
                      }

                      return (
                        <tr
                          key={dateStr}
                          className={
                            isWeekend
                              ? 'bg-gray-50'
                              : record?.status === 'Absent'
                              ? 'bg-red-50'
                              : ''
                          }>
                          <td className="border p-2 text-center">
                            {format(day, 'd')}
                          </td>
                          <td className="border p-2 text-center">{amIn}</td>
                          <td className="border p-2 text-center">{amOut}</td>
                          <td className="border p-2 text-center">{pmIn}</td>
                          <td className="border p-2 text-center">{pmOut}</td>
                          <td className="border p-2 text-center">
                            {totalHours}
                          </td>
                          <td className="border p-2 text-center">{remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Signature Area */}
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-t border-black pt-1 w-48 mx-auto"></div>
                    <p className="text-sm">Employee's Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-black pt-1 w-48 mx-auto"></div>
                    <p className="text-sm">Verified by</p>
                  </div>
                </div>

                {/* Certification */}
                <div className="mt-12 border-t pt-4">
                  <p className="text-sm font-semibold mb-2">CERTIFICATION:</p>
                  <p className="text-sm">
                    I certify on my honor that the above is a true and correct
                    report of the hours of work performed, record of which was
                    made daily at the time of arrival and departure from office.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDTRModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
