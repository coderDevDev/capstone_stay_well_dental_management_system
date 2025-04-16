'use client';

import { useEffect, useState } from 'react';
import { Payment, paymentService } from '@/services/api';
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
import { Search } from 'lucide-react';
import {
  DialogHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { PaymentDialog } from './components/payment-dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { PlusCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [isCashPaymentDialogOpen, setIsCashPaymentDialogOpen] = useState(false);
  const [cashPaymentData, setCashPaymentData] = useState({
    patient_name: '',
    service_name: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.getList();
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Calculate totals

  const totalAmount = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  );

  console.log({ totalAmount });

  const totalPayments = payments.length;
  const completedPayments = payments.filter(
    p => p.status === 'completed'
  ).length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      `${payment.patient_first_name} ${payment.patient_last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === 'all' || payment.payment_method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Calculate total cash payments
  const totalCashPayments = payments
    .filter(p => p.payment_method === 'cash')
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  // Add this function to handle cash payment submissions
  const handleAddCashPayment = async () => {
    try {
      if (!cashPaymentData.patient_name || !cashPaymentData.amount) {
        toast.error('Patient name and amount are required');
        return;
      }

      setIsLoading(true);

      // Create a proper payment object
      const paymentData = {
        patient_id: 'manual', // Placeholder for manual entry
        patient_first_name: cashPaymentData.patient_name.split(' ')[0] || '',
        patient_last_name:
          cashPaymentData.patient_name.split(' ').slice(1).join(' ') || '',
        service_name: cashPaymentData.service_name || 'Cash Payment',
        amount: parseFloat(cashPaymentData.amount),
        payment_method: 'cash',
        status: 'completed',
        transaction_id: `CASH-${Date.now()}`, // Generate a unique ID
        notes: cashPaymentData.notes,
        payment_date: cashPaymentData.date
      };

      // Use the new manual payment endpoint
      const response = await paymentService.createManualCashPayment(
        paymentData
      );

      if (response.success) {
        toast.success('Cash payment recorded successfully');
        setIsCashPaymentDialogOpen(false);
        setCashPaymentData({
          patient_name: '',
          service_name: '',
          amount: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          notes: ''
        });
        fetchPayments(); // Refresh the payments list
      } else {
        toast.error(response.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error adding cash payment:', error);
      toast.error('An error occurred while recording the payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    !isLoading && (
      <div className="container mx-auto py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP'
                }).format(totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalPayments} transactions
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                {((completedPayments / totalPayments) * 100).toFixed(1)}% of
                total
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                {((pendingPayments / totalPayments) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cash Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP'
                }).format(totalCashPayments)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.payment_method === 'cash').length}{' '}
                transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payments</CardTitle>
                <CardDescription>
                  Manage payment records and transactions
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsCashPaymentDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Cash Payment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-gray-500" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={value => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={methodFilter}
                  onValueChange={value => setMethodFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : paginatedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayments.map(payment => (
                      <TableRow key={payment.transaction_id}>
                        <TableCell>{payment.transaction_id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payment.patient_first_name}{' '}
                              {payment.patient_last_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{payment.service_name}</TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP'
                          }).format(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize ${
                              payment.payment_method === 'paypal'
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : payment.payment_method === 'gcash'
                                ? 'bg-green-50 text-green-700 border-green-300'
                                : 'bg-gray-50 text-gray-700 border-gray-300'
                            }`}>
                            {payment.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payment.status === 'completed'
                                ? 'bg-green-50 text-green-700 border-green-300'
                                : payment.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                : 'bg-red-50 text-red-700 border-red-300'
                            }>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.created_at), 'PPP p')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
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
                            href="#"
                            onClick={e => {
                              e.preventDefault();
                              setPage(p);
                            }}
                            isActive={page === p}>
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          setPage(p => Math.min(totalPages, p + 1));
                        }}
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
          </CardContent>
        </Card>

        <Dialog
          open={isDialogOpen}
          onOpenChange={open => {
            if (!open) {
              setIsDialogOpen(false);
              setSelectedPayment(null);
            }
          }}>
          <DialogContent className="sm:max-w-[425px]">
            <PaymentDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              payment={selectedPayment}
              onClose={() => {
                setSelectedPayment(null);
                setIsDialogOpen(false);
              }}
              onSuccess={() => {
                fetchPayments();
                setIsDialogOpen(false);
                setSelectedPayment(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Cash Payment Dialog */}
        <Dialog
          open={isCashPaymentDialogOpen}
          onOpenChange={setIsCashPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Cash Payment</DialogTitle>
              <DialogDescription>
                Record a manual cash payment received from a patient.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patient_name" className="text-right">
                  Patient Name
                </Label>
                <Input
                  id="patient_name"
                  value={cashPaymentData.patient_name}
                  onChange={e =>
                    setCashPaymentData({
                      ...cashPaymentData,
                      patient_name: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service_name" className="text-right">
                  Service
                </Label>
                <Input
                  id="service_name"
                  value={cashPaymentData.service_name}
                  onChange={e =>
                    setCashPaymentData({
                      ...cashPaymentData,
                      service_name: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={cashPaymentData.amount}
                  onChange={e =>
                    setCashPaymentData({
                      ...cashPaymentData,
                      amount: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={cashPaymentData.date}
                  onChange={e =>
                    setCashPaymentData({
                      ...cashPaymentData,
                      date: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={cashPaymentData.notes}
                  onChange={e =>
                    setCashPaymentData({
                      ...cashPaymentData,
                      notes: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCashPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="text-white" onClick={handleAddCashPayment}>
                Save Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  );
}
