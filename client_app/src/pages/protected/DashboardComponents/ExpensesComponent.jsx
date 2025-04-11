import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PlusCircle,
  Pencil,
  Trash2,
  DollarSign,
  PhilippinePeso,
  FileText,
  Calendar,
  Filter,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExpensesComponent() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    branch_id: ''
  });
  const [filterCategory, setFilterCategory] = useState('all');
  const [totals, setTotals] = useState({
    categoryTotals: [],
    grandTotal: 0
  });
  const [customCategory, setCustomCategory] = useState('');
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);

  // Common expense categories
  const predefinedCategories = [
    'Utilities',
    'Rent',
    'Salaries',
    'Supplies',
    'Equipment',
    'Maintenance',
    'Marketing',
    'Insurance',
    'Taxes',
    'Miscellaneous'
  ];

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/expenses');
      setExpenses(response.data.data);

      // Also fetch totals
      const totalsResponse = await axios.get('/expenses/totals');
      setTotals(totalsResponse.data.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load expenses'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/expenses/categories');
      // Combine predefined categories with ones from database
      const allCategories = [...new Set([...predefinedCategories, ...response.data.data])];
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExpense = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!formData.description || !formData.amount || !formData.category || !formData.date) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please fill in all required fields'
        });
        return;
      }

      const response = await axios.post('/expenses', formData);

      setExpenses(prev => [response.data.data, ...prev]);
      setIsAddDialogOpen(false);

      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        branch_id: ''
      });

      toast({
        title: 'Success',
        description: 'Expense added successfully'
      });

      // Refresh totals
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add expense'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExpense = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!formData.description || !formData.amount || !formData.category || !formData.date) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please fill in all required fields'
        });
        return;
      }

      const response = await axios.put(`/expenses/${currentExpense.id}`, formData);

      setExpenses(prev =>
        prev.map(expense =>
          expense.id === currentExpense.id ? response.data.data : expense
        )
      );

      setIsEditDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Expense updated successfully'
      });

      // Refresh totals
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update expense'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      setIsLoading(true);

      await axios.delete(`/expenses/${currentExpense.id}`);

      setExpenses(prev =>
        prev.filter(expense => expense.id !== currentExpense.id)
      );

      setIsDeleteDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Expense deleted successfully'
      });

      // Refresh totals
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete expense'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditDialog = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.split('T')[0],
      notes: expense.notes || '',
      branch_id: expense.branch_id || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (expense) => {
    setCurrentExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(expense => expense.category === filterCategory);

  const handleCategorySelect = (value) => {
    if (value === 'custom-new') {
      // Handle custom input mode
      setFormData(prev => ({
        ...prev,
        category: customCategory
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        category: value
      }));
    }
    setOpenCategoryCombobox(false);
  };

  const categorySelectUI = (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="category" className="text-right">
        Category
      </Label>
      <div className="col-span-3">
        <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategoryCombobox}
              className="w-full justify-between">
              {formData.category ? formData.category : "Select category..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white">
            <Command>
              <CommandInput
                placeholder="Search or add category..."
                value={customCategory}
                onValueChange={setCustomCategory}
              />
              <CommandEmpty>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start px-2 py-1.5 text-left"
                  onClick={() => handleCategorySelect('custom-new')}
                >
                  Add "{customCategory}"
                </Button>
              </CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category}
                    value={category}
                    onSelect={() => handleCategorySelect(category)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.category === category ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Expenses</CardTitle>
            <CardDescription>
              Manage and track office expenses
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="p-4">
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="outline" className="py-2 px-3 bg-gray-100 font-semibold text-gray-800">
              <PhilippinePeso className="h-4 w-4 mr-1" />
              Total: ₱{Number(totals.grandTotal).toLocaleString()}
            </Badge>

            {totals.categoryTotals?.map((cat) => (
              <Badge
                key={cat.category}
                variant="outline"
                className="py-2 px-3 bg-blue-50 font-medium text-blue-700">
                {cat.category}: ₱{Number(cat.total).toLocaleString()}
              </Badge>
            ))}
          </div>

          <div className="mb-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  {/* <TableHead>Branch</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && !filteredExpenses.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading expenses...
                    </TableCell>
                  </TableRow>
                ) : filteredExpenses.length ? (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>₱{Number(expense.amount).toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                      {/* <TableCell>{expense.branch_name || '—'}</TableCell> */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEditDialog(expense)}
                            className="h-8 w-8 text-blue-600">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(expense)}
                            className="h-8 w-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No expenses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Enter the details of the expense
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₱</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            {categorySelectUI}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsAddDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleAddExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the expense details
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₱</span>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            {categorySelectUI}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Date
              </Label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleEditExpense}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Update Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the expense entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Expense'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

