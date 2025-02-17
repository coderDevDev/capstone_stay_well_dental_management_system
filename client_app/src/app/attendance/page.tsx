'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  employees,
  getEmployeeAttendance,
  addAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  type AttendanceRecord
} from '@/lib/mock-data';
import {
  CalendarIcon,
  User,
  Save,
  Trash2,
  Edit,
  Eye,
  UserSearch,
  Clock,
  Filter,
  FilterX
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import UpdateAttendanceForm from './UpdateAttendanceForm';
import { attendanceService, type Attendance } from '@/services/api';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import AttendanceCalendarView from './AttendanceCalendarView';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<
    string | undefined
  >();
  const [currentAttendance, setCurrentAttendance] =
    useState<AttendanceRecord | null>(null);
  const [employeeAttendance, setEmployeeAttendance] = useState<
    AttendanceRecord[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedEmployeeForCalendar, setSelectedEmployeeForCalendar] =
    useState<string | null>(null);
  const [filterEmployee, setFilterEmployee] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEmployee) {
      fetchOrCreateAttendance();
      fetchEmployeeAttendance();
    }
  }, [selectedEmployee]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('attendanceUpdated', () => {
      fetchAttendance();
    });

    socket.on('attendanceDeleted', () => {
      fetchAttendance();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrCreateAttendance = () => {
    if (!selectedEmployee) return;

    const selectedDate = date.toISOString().split('T')[0];
    const existingAttendance = getEmployeeAttendance(
      selectedEmployee,
      selectedDate,
      selectedDate
    );

    if (existingAttendance.length > 0) {
      setCurrentAttendance(existingAttendance[0]);
    } else {
      const newAttendance = addAttendanceRecord({
        employeeId: selectedEmployee,
        date: selectedDate,
        status: 'Present'
      });
      setCurrentAttendance(newAttendance);
    }
  };

  const fetchEmployeeAttendance = () => {
    if (!selectedEmployee) return;

    const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    const attendance = getEmployeeAttendance(
      selectedEmployee,
      startDate,
      endDate
    );
    setEmployeeAttendance(attendance);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      fetchOrCreateAttendance();
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
  };

  const handleAttendanceChange = (
    status: 'Present' | 'Absent' | 'Late' | 'Half Day'
  ) => {
    if (currentAttendance) {
      setCurrentAttendance({ ...currentAttendance, status });
    }
  };

  const handleSaveAttendance = () => {
    if (currentAttendance) {
      const updatedRecord = updateAttendanceRecord(currentAttendance);
      setCurrentAttendance(updatedRecord);
      fetchEmployeeAttendance();
    }
  };

  const handleDeleteAttendance = (id: string) => {
    deleteAttendanceRecord(id);
    if (currentAttendance && currentAttendance.id === id) {
      setCurrentAttendance(null);
    }
    fetchEmployeeAttendance();
  };

  const fetchAttendance = async () => {
    try {
      const data = await attendanceService.getAll();
      setAttendanceList(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance');
    }
  };

  const handleResetFilters = () => {
    setFilterEmployee(null);
    setFilterStatus(null);
    setSearchTerm('');
    setPage(1);
  };

  const filteredAttendance = attendanceList.filter(record => {
    const matchesSearch = record.employee_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEmployee =
      filterEmployee === 'all' || !filterEmployee
        ? true
        : record.employee_id === filterEmployee;
    const matchesStatus =
      filterStatus === 'all' || !filterStatus
        ? true
        : record.status === filterStatus;

    return matchesSearch && matchesEmployee && matchesStatus;
  });

  const pageCount = Math.ceil(filteredAttendance.length / itemsPerPage);
  const paginationRange = Array.from({ length: pageCount }, (_, i) => i + 1);
  const visiblePaginationRange = paginationRange.slice(
    Math.max(0, Math.min(page - 3, pageCount - 5)),
    Math.min(pageCount, Math.max(5, page + 2))
  );

  const addAttendance = async (data: Omit<Attendance, 'id'>) => {
    try {
      await attendanceService.create(data);
      setIsAddModalOpen(false);
      toast.success('Attendance record added successfully');
      fetchAttendance();
    } catch (error) {
      console.error('Error adding attendance:', error);
      toast.error('Failed to add attendance');
    }
  };

  const updateAttendance = async (data: Partial<Attendance>) => {
    try {
      if (data.id) {
        await attendanceService.update(data.id, data);
        setSelectedAttendance(null);
        toast.success('Attendance record updated successfully');
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const deleteAttendance = async (id: string) => {
    try {
      await attendanceService.delete(id);
      toast.success('Attendance record deleted successfully');
      fetchAttendance();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error('Failed to delete attendance');
    }
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return attendanceList.filter(record => record.employee_id === employeeId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Manage your attendance records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <UserSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search attendance..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 max-w-[200px]"
                />
              </div>

              <Select
                value={filterEmployee || undefined}
                onValueChange={value => {
                  setFilterEmployee(value);
                  setPage(1);
                }}>
                <SelectTrigger className="w-[200px]">
                  <User className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {[
                    ...new Set(attendanceList.map(record => record.employee_id))
                  ].map(id => (
                    <SelectItem key={id} value={id}>
                      {employees.find(emp => emp.id === id)?.name || id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterStatus || undefined}
                onValueChange={value => {
                  setFilterStatus(value);
                  setPage(1);
                }}>
                <SelectTrigger className="w-[150px]">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="flex items-center gap-2">
                <FilterX className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="hover:bg-blue-700 font-bold text-white bg-blue-700 shadow-2xl">
              Add Attendance
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.employeeName}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.date), 'PPP')}
                      </TableCell>
                      <TableCell>{record.status}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                            onClick={() => setSelectedAttendance(record)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-purple-50 hover:bg-purple-100 border-purple-200"
                            onClick={() =>
                              setSelectedEmployeeForCalendar(record.employee_id)
                            }>
                            <Eye className="h-4 w-4 text-purple-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 border-red-200"
                            onClick={() => deleteAttendance(record.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {pageCount > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    />
                  </PaginationItem>

                  {page > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => setPage(1)}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {page > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {visiblePaginationRange.map(p => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={page === p}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {page < pageCount - 2 && (
                    <>
                      {page < pageCount - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink onClick={() => setPage(pageCount)}>
                          {pageCount}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                      disabled={page === pageCount}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isAddModalOpen || selectedAttendance !== null}
        onOpenChange={open => {
          if (!open) {
            setIsAddModalOpen(false);
            setSelectedAttendance(null);
          }
        }}>
        <DialogContent className="max-w-4xl">
          <UpdateAttendanceForm
            onUpdate={updateAttendance}
            onAdd={addAttendance}
            attendance={selectedAttendance}
            onClose={() => {
              setIsAddModalOpen(false);
              setSelectedAttendance(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedEmployeeForCalendar !== null}
        onOpenChange={open => {
          if (!open) setSelectedEmployeeForCalendar(null);
        }}>
        <DialogContent className="max-w-3xl">
          {selectedEmployeeForCalendar && (
            <AttendanceCalendarView
              employeeName={selectedEmployeeForCalendar}
              attendanceRecords={getEmployeeAttendance(
                selectedEmployeeForCalendar
              )}
              onUpdateAttendance={async data => {
                if (data.id) {
                  await attendanceService.update(data.id, data);
                } else {
                  await attendanceService.create(data);
                }
                fetchAttendance();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
