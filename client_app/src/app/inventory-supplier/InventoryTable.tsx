'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
  ChevronDown,
  Minus,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import UpdateInventoryForm from './UpdateInventoryForm';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

interface InventoryTableProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  onUpdate: (data: Partial<InventoryItem>) => void;
  onOrder: (itemId: number) => void;
  onAdd: (data: Omit<InventoryItem, 'id'>) => void;
  refreshInventory: () => Promise<void>;
}

export default function InventoryTable({
  inventory,
  suppliers,
  onUpdate,
  onOrder,
  onAdd,
  refreshInventory
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const itemsPerPage = 8;
  const [useItemDialog, setUseItemDialog] = useState(false);
  const [itemToUse, setItemToUse] = useState<InventoryItem | null>(null);
  const [useQuantity, setUseQuantity] = useState(1);
  const [useLoading, setUseLoading] = useState(false);

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item => {
    const supplier = suppliers.find(s => s.id === item.supplierId)?.name;
    const searchString =
      `${item.name} ${supplier} ${item.category}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Get all unique categories
  const categories = Array.from(
    new Set(filteredInventory.map(item => item.category || 'Uncategorized'))
  ).sort();

  // Filter by selected category (if not "all")
  const categoryFilteredInventory =
    selectedCategory === 'all'
      ? filteredInventory
      : filteredInventory.filter(
          item => (item.category || 'Uncategorized') === selectedCategory
        );

  // Pagination
  const totalPages = Math.ceil(categoryFilteredInventory.length / itemsPerPage);
  const paginatedInventory = categoryFilteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when changing category
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const getStatusBadge = (quantity: number) => {
    if (quantity === 0)
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
    if (quantity <= 10)
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
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

  const handleUseItem = (item: InventoryItem) => {
    setItemToUse(item);
    setUseQuantity(1);
    setUseItemDialog(true);
  };

  const confirmUseItem = async () => {
    if (!itemToUse || useQuantity <= 0) return;

    try {
      setUseLoading(true);

      // Call the dedicated API endpoint for using items
      const response = await axios.post('/inventory/use', {
        itemId: itemToUse.id,
        quantity: useQuantity,
        notes: `Manual usage recorded from inventory management`
      });

      if (response.data.success) {
        // Close the dialog
        setUseItemDialog(false);
        setItemToUse(null);

        // Show success message
        toast({
          title: 'Success',
          description: `${useQuantity} ${itemToUse.name}(s) marked as used`
        });

        // Immediately refresh the inventory table
        await refreshInventory();

        // The socket will also handle updates, but this ensures immediate UI refresh
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.data.error || 'Failed to update inventory'
        });
      }
    } catch (error) {
      console.error('Error updating inventory usage:', error);
      const errorMessage =
        error.response?.data?.error || 'Failed to update inventory';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      });
    } finally {
      setUseLoading(false);
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

      {/* Category Tabs */}
      <div className="w-full overflow-x-auto pb-2">
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full">
          <TabsList className="bg-muted/50 p-1 flex flex-nowrap overflow-x-auto">
            <TabsTrigger
              className="flex-shrink-0 px-4 py-2 rounded transition-colors data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:font-bold data-[state=active]:shadow"
              value="all">
              All Items ({filteredInventory.length})
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger
                key={category}
                className="flex-shrink-0 px-4 py-2 rounded transition-colors data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:font-bold data-[state=active]:shadow"
                value={category}>
                {category} (
                {
                  filteredInventory.filter(
                    item => (item.category || 'Uncategorized') === category
                  ).length
                }
                )
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
              {paginatedInventory.length > 0 ? (
                paginatedInventory.map((item, idx) => (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseItem(item)}
                          className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white"
                          disabled={item.quantity <= 0}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No items found. Try adjusting your search or selecting a
                    different category.
                  </TableCell>
                </TableRow>
              )}
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

      <AlertDialog open={useItemDialog} onOpenChange={setUseItemDialog}>
        <AlertDialogContent className="bg-white rounded-lg shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Use Item from Inventory</AlertDialogTitle>
            <AlertDialogDescription>
              Record usage of this item. The quantity will be deducted from
              inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {itemToUse && (
            <div className="space-y-4 py-2">
              <div className="flex flex-col space-y-1.5">
                <h3 className="text-lg font-semibold">{itemToUse.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Current stock: {itemToUse.quantity}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity Used</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={useQuantity}
                  onChange={e => setUseQuantity(parseInt(e.target.value) || 0)}
                  min={1}
                  max={itemToUse.quantity}
                />
              </div>

              {useQuantity > itemToUse.quantity && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Not enough items in stock
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={useLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUseItem}
              disabled={
                useLoading ||
                !itemToUse ||
                useQuantity <= 0 ||
                useQuantity > (itemToUse?.quantity || 0)
              }
              className="bg-amber-600 hover:bg-amber-700 text-white">
              {useLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Usage'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                className="w-8 bg-gray-600 hover:bg-gray-600 text-white"
                onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
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
