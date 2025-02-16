import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Suppliers from '../../features/suppliers';

import { Plus, Edit, Trash2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


export default function SupplierOrderManagement() {
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false)
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ name: "", contact: "", email: "" })
  const [newOrder, setNewOrder] = useState({
    supplierId: 0,
    itemId: 0,
    quantity: 0,
    status: "Pending",
  })
  const [searchSupplier, setSearchSupplier] = useState("")
  const [searchOrder, setSearchOrder] = useState("")
  const [supplierFilters, setSupplierFilters] = useState({})
  const [orderFilters, setOrderFilters] = useState({})

  useEffect(() => {
    fetchSuppliers()
    fetchOrders()
    fetchInventory()
  }, [])

  const fetchSuppliers = async () => {
    // Mock API call
    const mockData = [
      { id: 1, name: "Dental Supplies Co.", contact: "John Doe", email: "john@dentalsupplies.com" },
      { id: 2, name: "Medical Equipments Ltd.", contact: "Jane Smith", email: "jane@medequip.com" },
    ]
    setSuppliers(mockData)
  }

  const fetchOrders = async () => {
    // Mock API call
    const mockData = [
      { id: 1, supplierId: 1, itemId: 1, quantity: 1000, status: "Delivered", orderDate: "2023-05-01" },
      { id: 2, supplierId: 2, itemId: 2, quantity: 50, status: "Pending", orderDate: "2023-05-15" },
    ]
    setOrders(mockData)
  }

  const fetchInventory = async () => {
    // Mock API call
    const mockData = [
      { id: 1, name: "Latex Gloves", quantity: 500, unit: "pairs", minThreshold: 100 },
      { id: 2, name: "Anesthetic", quantity: 50, unit: "vials", minThreshold: 10 },
      { id: 3, name: "Dental Floss", quantity: 200, unit: "packs", minThreshold: 50 },
    ]
    setInventory(mockData)
  }

  const addSupplier = async () => {
    const newId = Math.max(...suppliers.map((supplier) => supplier.id)) + 1
    const addedSupplier = { ...newSupplier, id: newId }
    setSuppliers([...suppliers, addedSupplier])
    setIsAddSupplierDialogOpen(false)
    setNewSupplier({ name: "", contact: "", email: "" })
  }

  const addOrder = async () => {
    const newId = Math.max(...orders.map((order) => order.id)) + 1
    const addedOrder = { ...newOrder, id: newId, orderDate: new Date().toISOString().split("T")[0] }
    setOrders([...orders, addedOrder])
    setIsAddOrderDialogOpen(false)
    setNewOrder({ supplierId: 0, itemId: 0, quantity: 0, status: "Pending" })

    // Update inventory
    const updatedInventory = inventory.map((item) =>
      item.id === addedOrder.itemId ? { ...item, quantity: item.quantity + addedOrder.quantity } : item,
    )
    setInventory(updatedInventory)
  }

  const deleteOrder = (orderId) => {
    const orderToDelete = orders.find((order) => order.id === orderId)
    if (orderToDelete) {
      // Update inventory
      const updatedInventory = inventory.map((item) =>
        item.id === orderToDelete.itemId ? { ...item, quantity: item.quantity - orderToDelete.quantity } : item,
      )
      setInventory(updatedInventory)

      // Remove order
      setOrders(orders.filter((order) => order.id !== orderId))
    }
  }

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.name.toLowerCase().includes(searchSupplier.toLowerCase()) ||
        supplier.contact.toLowerCase().includes(searchSupplier.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchSupplier.toLowerCase())) &&
      Object.entries(supplierFilters).every(
        ([key, values]) => values.length === 0 || values.includes(String(supplier[key])),
      ),
  )

  const filteredOrders = orders.filter(
    (order) =>
      (String(order.id).includes(searchOrder) ||
        suppliers
          .find((s) => s.id === order.supplierId)
          ?.name.toLowerCase()
          .includes(searchOrder.toLowerCase()) ||
        inventory
          .find((i) => i.id === order.itemId)
          ?.name.toLowerCase()
          .includes(searchOrder.toLowerCase()) ||
        order.status.toLowerCase().includes(searchOrder.toLowerCase())) &&
      Object.entries(orderFilters).every(
        ([key, values]) => values.length === 0 || values.includes(String(order[key])),
      ),
  )

  const handleFilterChange = (table, column, value) => {
    if (table === "suppliers") {
      setSupplierFilters((prev) => ({
        ...prev,
        [column]: prev[column]?.includes(value)
          ? prev[column].filter((v) => v !== value)
          : [...(prev[column] || []), value],
      }))
    } else {
      setOrderFilters((prev) => ({
        ...prev,
        [column]: prev[column]?.includes(value)
          ? prev[column].filter((v) => v !== value)
          : [...(prev[column] || []), value],
      }))
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-3xl">Supplier & Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="suppliers" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="suppliers">
              <div className="mb-4 flex justify-between items-center">
                <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="text-white bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New Supplier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="!z-[1000] bg-white text-black">
                    <DialogHeader>
                      <DialogTitle>Add New Supplier</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newSupplier.name}
                          onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact" className="text-right">
                          Contact
                        </Label>
                        <Input
                          id="contact"
                          value={newSupplier.contact}
                          onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newSupplier.email}
                          onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <Button className="text-white bg-blue-700" onClick={addSupplier}>Add</Button>
                  </DialogContent>
                </Dialog>
                <div className="flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  <Input
                    placeholder="Search suppliers..."
                    value={searchSupplier}
                    onChange={(e) => setSearchSupplier(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>

              <Table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
                <TableHeader>
                  <TableRow>
                    {["Name", "Contact", "Email"].map((header) => (
                      <TableHead key={header}>
                        <div className="flex items-center">
                          {header}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {Array.from(new Set(suppliers.map((s) => s[header.toLowerCase()]))).map(
                                (value) => (
                                  <DropdownMenuItem key={String(value)}>
                                    <Checkbox
                                      checked={supplierFilters[header.toLowerCase()]?.includes(String(value))}
                                      onCheckedChange={() =>
                                        handleFilterChange("suppliers", header.toLowerCase(), String(value))
                                      }
                                    />
                                    <span className="ml-2">{value}</span>
                                  </DropdownMenuItem>
                                ),
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>
                        <Button

                          variant="outline"
                          size="icon"
                          className="text-blue-500 hover:bg-blue-100 rounded-full p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button

                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:bg-red-100 rounded-full p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="orders">
              <div className="mb-4 flex justify-between items-center">
                <Dialog open={isAddOrderDialogOpen} onOpenChange={setIsAddOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="text-white bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Order</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier" className="text-right">
                          Supplier
                        </Label>
                        <Select
                          onValueChange={(value) => setNewOrder({ ...newOrder, supplierId: Number.parseInt(value) })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item" className="text-right">
                          Item
                        </Label>
                        <Select onValueChange={(value) => setNewOrder({ ...newOrder, itemId: Number.parseInt(value) })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newOrder.quantity}
                          onChange={(e) => setNewOrder({ ...newOrder, quantity: Number.parseInt(e.target.value) })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setNewOrder({ ...newOrder, status: value })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={addOrder}>Add Order</Button>
                  </DialogContent>
                </Dialog>
                <div className="flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    {["Order ID", "Supplier", "Item", "Quantity", "Status", "Order Date"].map((header) => (
                      <TableHead key={header}>
                        <div className="flex items-center">
                          {header}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {Array.from(
                                new Set(
                                  orders.map((o) => {
                                    if (header === "Supplier") return suppliers.find((s) => s.id === o.supplierId)?.name
                                    if (header === "Item") return inventory.find((i) => i.id === o.itemId)?.name
                                    return String(o[header.toLowerCase().replace(" ", "")])
                                  }),
                                ),
                              ).map((value) => (
                                <DropdownMenuItem key={String(value)}>
                                  <Checkbox
                                    checked={orderFilters[header.toLowerCase().replace(" ", "")]?.includes(
                                      String(value),
                                    )}
                                    onCheckedChange={() =>
                                      handleFilterChange("orders", header.toLowerCase().replace(" ", ""), String(value))
                                    }
                                  />
                                  <span className="ml-2">{value}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{suppliers.find((s) => s.id === order.supplierId)?.name}</TableCell>
                      <TableCell>{inventory.find((i) => i.id === order.itemId)?.name}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-blue-500 hover:bg-blue-100 rounded-full p-2"

                          onClick={() => {
                            // setCurrentItem(item);
                            // setIsEditDialogOpen(true);
                          }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:bg-red-100 rounded-full p-2"

                          onClick={() => deleteOrder(order.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
