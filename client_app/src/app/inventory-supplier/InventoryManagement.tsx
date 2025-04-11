'use client';

import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import InventoryTable from './InventoryTable';
import OrderTable from './OrderTable';
import SupplierTable from './SupplierTable';
import UpdateInventoryForm from './UpdateInventoryForm';
import AddSupplierOrderForm from './AddSupplierOrderForm';
import AddSupplierForm from './AddSupplierForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package, ShoppingCart, Users } from 'lucide-react';
import {
  inventoryService,
  orderService,
  supplierService
} from '@/services/api';
import { cn } from '@/lib/utils';
import { notify } from '@/components/ui/notifications';

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  supplierId: number;
  minQuantity: number;
  batchNumber: string;
  location?: string;
  expirationDate?: Date;
  notes?: string;
}

export interface Order {
  id: number;
  supplierId: number;
  itemId: number;
  quantity: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
}

const initialInventory: InventoryItem[] = [
  { id: 1, name: 'Widget A', quantity: 100, supplierId: 1 },
  { id: 2, name: 'Gadget B', quantity: 50, supplierId: 2 }
];

const initialOrders: Order[] = [
  {
    id: 1,
    supplierId: 1,
    itemId: 1,
    quantity: 10,
    date: '2023-05-01',
    status: 'Pending'
  },
  {
    id: 2,
    supplierId: 2,
    itemId: 2,
    quantity: 5,
    date: '2023-05-02',
    status: 'Shipped'
  }
];

const initialSuppliers: Supplier[] = [
  { id: 1, name: 'Acme Corp', contact: 'john@acme.com' },
  { id: 2, name: 'Tech Supplies Inc', contact: 'jane@techsupplies.com' }
];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [notifiedItems, setNotifiedItems] = useState<Set<number>>(new Set());

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryData, ordersData, suppliersData] = await Promise.all([
          inventoryService.getAll(),
          orderService.getAll(),
          supplierService.getAll()
        ]);
        setInventory(inventoryData);
        setOrders(ordersData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // You might want to show an error toast here
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const socket = io('https://staywelldentalbackend.onrender.com', {
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

    socket.on('inventoryUpdated', async () => {
      try {
        const inventoryData = await inventoryService.getAll();
        setInventory(inventoryData);
        checkStockLevels(inventoryData);
      } catch (error) {
        console.error('Error updating inventory:', error);
      }
    });

    socket.on('orderStatusUpdated', async () => {
      try {
        const ordersData = await orderService.getAll();
        setOrders(ordersData);
      } catch (error) {
        console.error('Error updating orders:', error);
      }
    });

    socket.on('supplierUpdated', async () => {
      try {
        const suppliersData = await supplierService.getAll();
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error updating suppliers:', error);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateInventory = async (data: Partial<InventoryItem>) => {
    try {
      if (data.id) {
        const updatedItem = await inventoryService.update(data.id, data);
        setInventory(prev =>
          prev.map(item =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          )
        );
        setIsInventoryModalOpen(false);
        notify.stockUpdate(updatedItem.name, updatedItem.quantity);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const addInventory = async (data: Omit<InventoryItem, 'id'>) => {
    try {
      const newItem = await inventoryService.create(data);
      setInventory(prev => [...prev, newItem]);
      setIsInventoryModalOpen(false);
    } catch (error) {
      console.error('Error adding inventory:', error);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'status'>) => {
    try {
      const newOrder = await orderService.create(orderData);
      setOrders(prev => [...prev, newOrder]);
      setIsOrderModalOpen(false);
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    newStatus: Order['status']
  ) => {
    try {
      const updatedOrder = await orderService.updateStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? updatedOrder : order))
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      await orderService.delete(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const addSupplier = async (data: Omit<Supplier, 'id'>) => {
    try {
      const newSupplier = await supplierService.create(data);
      setSuppliers(prev => [...prev, newSupplier]);
      setIsSupplierModalOpen(false);
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  };

  const updateSupplier = async (data: Supplier) => {
    try {
      const updatedSupplier = await supplierService.update(data.id, data);
      setSuppliers(prev =>
        prev.map(supplier =>
          supplier.id === data.id ? updatedSupplier : supplier
        )
      );
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      await supplierService.delete(id);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const handlePlaceOrder = (itemId: number) => {
    setIsOrderModalOpen(true);
    setSelectedItemId(itemId);
  };

  const checkStockLevels = useCallback(
    (items: InventoryItem[]) => {
      items.forEach(item => {
        if (!notifiedItems.has(item.id)) {
          if (item.quantity !== undefined && item.minQuantity !== undefined) {
            if (item.quantity <= item.minQuantity * 0.5) {
              notify.criticalStock(item.name, item.quantity);
              setNotifiedItems(prev => new Set([...prev, item.id]));
            } else if (item.quantity <= item.minQuantity) {
              notify.lowStock(item.name, item.quantity, item.minQuantity);
              setNotifiedItems(prev => new Set([...prev, item.id]));
            }
          }
        }
      });
    },
    [notifiedItems]
  );

  useEffect(() => {
    if (inventory.length > 0) {
      checkStockLevels(inventory);
    }
  }, [inventory, checkStockLevels]);

  const refreshInventory = async () => {
    try {
      const inventoryData = await inventoryService.getAll();
      setInventory(inventoryData);
      checkStockLevels(inventoryData);
    } catch (error) {
      console.error('Error refreshing inventory:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="w-full border-b flex h-auto p-0 bg-transparent gap-6  justify-start">
          <TabsTrigger
            value="inventory"
            className={cn(
              'flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600',
              'bg-transparent hover:bg-gray-50/50 rounded-none data-[state=active]:bg-transparent',
              'data-[state=active]:text-blue-600 data-[state=active]:shadow-none'
            )}>
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className={cn(
              'flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600',
              'bg-transparent hover:bg-gray-50/50 rounded-none data-[state=active]:bg-transparent',
              'data-[state=active]:text-blue-600 data-[state=active]:shadow-none'
            )}>
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="suppliers"
            className={cn(
              'flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600',
              'bg-transparent hover:bg-gray-50/50 rounded-none data-[state=active]:bg-transparent',
              'data-[state=active]:text-blue-600 data-[state=active]:shadow-none'
            )}>
            <Users className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Manage your inventory items and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                inventory={inventory}
                suppliers={suppliers}
                onUpdate={updateInventory}
                onAdd={addInventory}
                refreshInventory={refreshInventory}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Track and manage purchase orders from suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTable
                orders={orders}
                inventory={inventory}
                suppliers={suppliers}
                onUpdateStatus={updateOrderStatus}
                onAddOrder={addOrder}
                onDeleteOrder={deleteOrder}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>
                Manage your supplier information and contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierTable
                suppliers={suppliers}
                onUpdate={updateSupplier}
                onAdd={addSupplier}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Inventory Modal */}
      <Dialog
        open={isInventoryModalOpen}
        onOpenChange={setIsInventoryModalOpen}>
        <DialogContent>
          <UpdateInventoryForm
            onUpdate={updateInventory}
            onAdd={addInventory}
            inventory={inventory}
            suppliers={suppliers}
            onClose={() => setIsInventoryModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Place Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent>
          <AddSupplierOrderForm
            onAdd={(order, updateImmediately) => {
              addOrder(order);
              setIsOrderModalOpen(false);
            }}
            inventory={inventory}
            suppliers={suppliers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
