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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import UpdateBranchForm from './UpdateBranchForm';
import { branchService, type Branch } from '@/services/api';
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

export default function DentalBranchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    fetchBranches();
  }, []);

  // Set up socket connection for real-time updates
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('branchUpdated', () => {
      fetchBranches();
    });

    socket.on('branchDeleted', () => {
      fetchBranches();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await branchService.getAll();
      if (response.success) {
        setBranchList(response.data || []);
      } else {
        setBranchList([]);
        toast.error('Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranchList([]);
      toast.error('Failed to fetch branches');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = branchList.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedBranches = filteredBranches.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

  const addBranch = async (data: Omit<Branch, 'id'>) => {
    try {
      await branchService.create(data);
      setIsAddModalOpen(false);
      toast.success('Branch added successfully');
      fetchBranches();
    } catch (error: any) {
      console.error('Error adding branch:', error);
      toast.error(error.message || 'Failed to add branch');
    }
  };

  const updateBranch = async (data: Partial<Branch>) => {
    try {
      if (data.id) {
        await branchService.update(data.id, data);
        setSelectedBranch(null);
        toast.success('Branch updated successfully');
        fetchBranches();
      }
    } catch (error: any) {
      console.error('Error updating branch:', error);
      toast.error(error.message || 'Failed to update branch');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await branchService.delete(id);
      toast.success('Branch deleted successfully');
      fetchBranches();
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      toast.error(error.message || 'Failed to delete branch');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dental Branches</CardTitle>
              <CardDescription>
                Manage your dental clinic branches
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="hover:bg-blue-700 font-bold text-white bg-blue-700 shadow-2xl">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading branches...</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Contact Number</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Operating Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBranches.map(branch => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">
                          {branch.name}
                        </TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>{branch.contact_number}</TableCell>
                        <TableCell>{branch.manager}</TableCell>
                        <TableCell>{branch.operating_hours}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              branch.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {branch.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                              onClick={() => setSelectedBranch(branch)}>
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 hover:bg-red-100 border-red-200"
                              onClick={() => handleDelete(branch.id)}>
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
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            setPage(p => Math.max(1, p - 1));
                          }}
                          className={
                            page === 1 ? 'pointer-events-none opacity-50' : ''
                          }
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
                          onClick={() =>
                            setPage(p => Math.min(totalPages, p + 1))
                          }
                          className={
                            page === totalPages
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isAddModalOpen || selectedBranch !== null}
        onOpenChange={open => {
          if (!open) {
            setIsAddModalOpen(false);
            setSelectedBranch(null);
          }
        }}>
        <DialogContent className="max-w-4xl">
          <UpdateBranchForm
            onUpdate={updateBranch}
            onAdd={addBranch}
            branch={selectedBranch}
            onClose={() => {
              setIsAddModalOpen(false);
              setSelectedBranch(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
