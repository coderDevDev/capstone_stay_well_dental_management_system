'use client';

import { useState } from 'react';
import type { InventoryItem, Supplier } from './InventoryManagement';
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
import { Input } from '@/components/ui/input';
import {
  Search,
  Edit,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import UpdateInventoryForm from './UpdateInventoryForm';

interface InventoryTableProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  onUpdate: (data: Partial<InventoryItem>) => void;
  onOrder: (itemId: number) => void;
  onAdd: (data: Omit<InventoryItem, 'id'>) => void;
}

export default function InventoryTable({
  inventory,
  suppliers,
  onUpdate,
  onOrder,
  onAdd
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 8;

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item => {
    const supplier = suppliers.find(s => s.id === item.supplierId)?.name;
    const searchString = `${item.name} ${supplier}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (quantity: number) => {
    if (quantity === 0)
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
    if (quantity <= 10)
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsAddModalOpen(true);
  };

  const handleAdd = async (data: Omit<InventoryItem, 'id'>) => {
    try {
      setIsLoading(true);
      await onAdd(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: Partial<InventoryItem>) => {
    try {
      setIsLoading(true);
      await onUpdate(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 transition-all duration-200"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedItem(null);
            setIsAddModalOpen(true);
          }}
          className="bg-blue-700 hover:bg-blue-600 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Supplier</TableHead>
                <TableHead className="font-semibold">Min. Quantity</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInventory.map((item, idx) => (
                <TableRow
                  key={item.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-muted/30'
                  }`}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.supplier_name}</TableCell>
                  <TableCell>{item.minQuantity}</TableCell>
                  <TableCell>{getStatusBadge(item.quantity)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="btn btn-sm bg-blue-600 hover:bg-blue-600 text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOrder(item.id)}
                        className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white">
                        <ShoppingCart className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <UpdateInventoryForm
            onUpdate={handleUpdate}
            onAdd={handleAdd}
            inventory={inventory}
            suppliers={suppliers}
            mode={selectedItem ? 'update' : 'add'}
            initialData={selectedItem}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of{' '}
          {filteredInventory.length} entries
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
    </div>
  );
}
