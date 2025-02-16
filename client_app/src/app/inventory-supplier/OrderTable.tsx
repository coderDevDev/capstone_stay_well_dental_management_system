'use client';

import { useState, useEffect } from 'react';
import type { Order, InventoryItem, Supplier } from './InventoryManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AddSupplierOrderForm from './AddSupplierOrderForm';
import { io } from 'socket.io-client';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger
// } from '@/components/ui/tooltip';

interface OrderTableProps {
  orders: Order[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  onUpdateStatus: (orderId: number, status: Order['status']) => void;
  onAddOrder: (order: Omit<Order, 'id' | 'status'>) => void;
  onDeleteOrder: (orderId: number) => void;
}

export default function OrderTable({
  orders,
  inventory,
  suppliers,
  onUpdateStatus,
  onAddOrder,
  onDeleteOrder
}: OrderTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isLoading, setIsLoading] = useState(false);
  const [localOrders, setLocalOrders] = useState(orders);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', error => {
      console.error('Connection error:', error);
    });

    socket.on('orderStatusUpdated', updatedOrder => {
      setLocalOrders(prev =>
        prev.map(order => (order.id === updatedOrder.id ? updatedOrder : order))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Filter orders based on search term
  const filteredOrders = localOrders.filter(order => {
    const supplier = suppliers.find(s => s.id === order.supplierId)?.name;
    const item = inventory.find(i => i.id === order.itemId)?.name;
    const searchString = `${supplier} ${item} ${order.status}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Shipped':
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
      case 'Delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleStatusUpdate = async (
    orderId: number,
    status: Order['status']
  ) => {
    try {
      setIsLoading(true);
      await onUpdateStatus(orderId, status);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (orderId: number) => {
    try {
      setIsLoading(true);
      await onDeleteOrder(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    if (currentStatus === 'Delivered') {
      return [{ value: 'Delivered', label: 'Delivered' }];
    }
    return [
      { value: 'Pending', label: 'Pending' },
      { value: 'Shipped', label: 'Shipped' },
      { value: 'Delivered', label: 'Delivered' }
    ];
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 transition-all duration-200"
          />
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-700 hover:bg-blue-600 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Order
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Order ID</TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">Supplier</div>
                </TableHead>
                <TableHead className="font-semibold">Item</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order, idx) => (
                <TableRow
                  key={order.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-muted/30'
                  }`}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    {suppliers.find(s => s.id === order.supplierId)?.name}
                  </TableCell>
                  <TableCell>
                    {inventory.find(i => i.id === order.itemId)?.name}
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={order.status}
                        onValueChange={value =>
                          handleStatusUpdate(order.id, value)
                        }
                        disabled={order.status === 'Delivered'}>
                        <SelectTrigger className="w-32">
                          <SelectValue>{order.status}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusOptions(order.status).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={isLoading}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{' '}
          {filteredOrders.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex gap-1">
            {getPageNumbers().map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                className="w-8 bg-gray-600 hover:bg-gray-600 text-white"
                onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <AddSupplierOrderForm
            onAdd={(order, updateImmediately) => {
              onAddOrder(order);
              setIsAddModalOpen(false);
            }}
            inventory={inventory}
            suppliers={suppliers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
