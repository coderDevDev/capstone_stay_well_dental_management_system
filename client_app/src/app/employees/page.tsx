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
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import UpdateEmployeeForm from './UpdateEmployeeForm';
import { employeeService, type Employee } from '@/services/api';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { branchService, type Branch } from '@/services/api';

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Set up socket connection for real-time updates
  useEffect(() => {
    const socket = io('https://staywelldentalbackend.onrender.com', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('employeeUpdated', () => {
      fetchEmployees();
    });

    socket.on('employeeDeleted', () => {
      fetchEmployees();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Add branch fetching
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchService.getAll();
        if (response.success) {
          setBranches(response.data);
          setSelectedBranchId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Failed to fetch branches');
      } finally {
        setIsLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployeeList(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  // Filter employees by branch
  const filteredEmployees = employeeList.filter(employee => {
    const matchesSearch = employee.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranchId
      ? employee.branch_id === selectedBranchId
      : true;
    return matchesSearch && matchesBranch;
  });

  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const addEmployee = async (data: Omit<Employee, 'id'>) => {
    try {
      await employeeService.create(data);
      setIsAddModalOpen(false);
      toast.success('Employee added successfully');
      fetchEmployees();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'Failed to add employee');
    }
  };

  const updateEmployee = async (data: Partial<Employee>) => {
    try {
      if (data.id) {
        await employeeService.update(data.id, data);
        setSelectedEmployee(null);
        toast.success('Employee updated successfully');
        fetchEmployees();
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast.error(error.message || 'Failed to update employee');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await employeeService.delete(id);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error(error.message || 'Failed to delete employee');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>
                Manage your employee information
              </CardDescription>
            </div>
            {/* <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Employee
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {/* Branch Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Filter by Branch</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {console.log({ branches: branches.length })}
              {branches.length > 1 && (
                <Card
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    !selectedBranchId
                      ? 'ring-2 ring-blue-500 shadow-md bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBranchId(null)}>
                  <div className="flex flex-col space-y-1">
                    <h4 className="font-medium text-sm">All Branches</h4>
                  </div>
                </Card>
              )}

              {branches.map(branch => (
                <Card
                  key={branch.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedBranchId === branch.id
                      ? 'ring-2 ring-blue-500 shadow-md bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBranchId(branch.id)}>
                  <div className="flex flex-col space-y-1">
                    <h4 className="font-medium text-sm truncate">
                      {branch.name}
                    </h4>
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
          </div>

          <div className="flex items-center justify-between mb-4">
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
              onClick={() => setIsAddModalOpen(true)}
              className="hover:bg-blue-700
              
              font-bold text-white bg-blue-700 shadow-2xl
              ">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>

                  <TableHead>Salary</TableHead>
                  <TableHead>Salary Basis</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.role_name}</TableCell>

                    <TableCell>₱{employee.salary.toLocaleString()}</TableCell>
                    <TableCell>{employee.salary_basis}</TableCell>
                    <TableCell>{employee.workingHours} hours/week</TableCell>
                    <TableCell>{employee.category}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                          onClick={() => setSelectedEmployee(employee)}>
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 border-red-200"
                          onClick={() => handleDelete(employee.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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

      {/* Add/Edit Employee Modal */}
      <Dialog
        open={isAddModalOpen || selectedEmployee !== null}
        onOpenChange={open => {
          if (!open) {
            setIsAddModalOpen(false);
            setSelectedEmployee(null);
          }
        }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 gap-0">
          <div className="max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <DialogTitle className="text-xl font-semibold">
                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <UpdateEmployeeForm
                onUpdate={updateEmployee}
                onAdd={addEmployee}
                employee={selectedEmployee}
                branches={branches}
                selectedBranchId={selectedBranchId}
                onClose={() => {
                  setIsAddModalOpen(false);
                  setSelectedEmployee(null);
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
