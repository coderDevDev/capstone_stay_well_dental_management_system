'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Payment } from '@/services/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue('id')}</div>
  },
  {
    accessorKey: 'patient_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Patient" />
    ),
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div>
          <div className="font-medium">
            {payment.patient_first_name} {payment.patient_last_name}
          </div>
          <div className="text-sm text-muted-foreground">
            {payment.patient_email}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    }
  },
  {
    accessorKey: 'payment_method',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Method" />
    ),
    cell: ({ row }) => {
      const method = row.getValue('payment_method') as string;
      return (
        <Badge variant="outline" className="capitalize">
          {method}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'completed'
              ? 'success'
              : status === 'pending'
              ? 'warning'
              : status === 'failed'
              ? 'destructive'
              : 'default'
          }>
          {status}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return format(new Date(row.getValue('created_at')), 'PPP p');
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
];
