import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { InventoryForm } from './InventoryForm';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function DashboardView() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter inventory items
  const filteredItems = inventory.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!showLowStock || item.quantity <= item.threshold)
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Low Stock Alert Banner */}
      {inventory.some(item => item.quantity <= item.threshold) && (
        <Alert variant="destructive">
          <AlertDescription>
            Some items are running low on stock! Please check the inventory.
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showLowStock ? 'destructive' : 'outline'}
            onClick={() => setShowLowStock(!showLowStock)}>
            {showLowStock ? 'Show All' : 'Show Low Stock'}
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>Add Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <InventoryForm onSuccess={() => setIsAddModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Inventory Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell
                  className={
                    item.quantity <= item.threshold
                      ? 'text-red-500 font-bold'
                      : ''
                  }>
                  {item.quantity}
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.quantity <= item.threshold
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                    {item.quantity <= item.threshold ? 'Low Stock' : 'In Stock'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Restock
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Analytics Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Stock Usage Trends</h3>
          <Bar
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Usage',
                  data: [12, 19, 3, 5, 2, 3],
                  backgroundColor: 'rgba(53, 162, 235, 0.5)'
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' as const },
                title: { display: false }
              }
            }}
          />
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Low Stock Items</h3>
          <div className="space-y-2">
            {inventory
              .filter(item => item.quantity <= item.threshold)
              .map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span>{item.name}</span>
                  <span className="text-red-600 font-semibold">
                    {item.quantity} left
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
