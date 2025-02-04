import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import TitleCard from '../../components/Cards/TitleCard';
// import { RECENT_TRANSACTIONS } from '../../utils/dummyData';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SearchBar from '../../components/Input/SearchBar';
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ViewColumnsIcon from '@heroicons/react/24/outline/EyeIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import {
  setAppSettings,
  getFeatureList
} from '../settings/appSettings/appSettingsSlice';

// import Table, {
//   AvatarCell,
//   SelectColumnFilter,
//   StatusPill,
//   DateCell
// } from '../../pages/protected/DataTables/Table'; // new

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

import InputText from '../../components/Input/InputText';

// import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

// import { formatAmount } from './../../features/dashboard/helpers/currencyFormat';
// import RadioText from '../../components/Input/Radio';


import * as XLSX from 'xlsx';

const todayInManila = new Date().toLocaleString('en-CA', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).split(',')[0];




import { Plus, Edit, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


export default function InventoryManagement() {
  const [inventory, setInventory] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 0,
    unit: "",
    minThreshold: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    // Mock API call
    const mockData = [
      { id: 1, name: "Latex Gloves", quantity: 500, unit: "pairs", minThreshold: 100 },
      { id: 2, name: "Anesthetic", quantity: 50, unit: "vials", minThreshold: 10 },
      { id: 3, name: "Dental Floss", quantity: 200, unit: "packs", minThreshold: 50 },
    ]
    setInventory(mockData)
  }

  const addItem = async () => {
    const newId = Math.max(...inventory.map((item) => item.id)) + 1
    const addedItem = { ...newItem, id: newId }
    setInventory([...inventory, addedItem])
    setIsAddDialogOpen(false)
    setNewItem({ name: "", quantity: 0, unit: "", minThreshold: 0 })
  }

  const updateItem = async () => {
    if (!currentItem) return
    const updatedInventory = inventory.map((item) => (item.id === currentItem.id ? currentItem : item))
    setInventory(updatedInventory)
    setIsEditDialogOpen(false)
  }

  const deleteItem = async () => {
    if (!currentItem) return
    const updatedInventory = inventory.filter((item) => item.id !== currentItem.id)
    setInventory(updatedInventory)
    setIsDeleteDialogOpen(false)
  }

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase()),
  )


  const validationSchema = Yup.object({
    item_name: Yup.string().required('Name is required'),
    quantity: Yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
    unit: Yup.string().required('Unit is required'),
    price: Yup.number().required('Price is required').min(1, 'Min Threshold must be at least 1')
  });

  const AddItemDialog = () => {
    return (
      <Formik
        initialValues={{
          item_name: '',
          quantity: '',
          unit: '',
          price: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          // Handle form submission logic here
          console.log(values);
        }}
      >
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          touched,
          errors,
          isSubmitting,
        }) => (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} className="!z-[1000]">
            <DialogTrigger asChild>
              <Button className="text-white bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="!z-[1000] bg-white text-black">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
              </DialogHeader>

              <div>

                <InputText
                  isRequired
                  label="Item name"
                  name="item_name"
                  type="text"
                  placeholder=""
                  value={values.item_name}

                  onBlur={handleBlur} // This apparently updates `touched`?
                />
              </div>

              <div className='-mt-2'>
                <InputText
                  isRequired
                  label="Quantity"
                  name="quantity"
                  type="number"
                  placeholder=""
                  value={values.quantity}

                  onBlur={handleBlur} // This apparently updates `touched`?
                />
              </div>
              <div className='-mt-2'>
                <InputText
                  isRequired
                  label="Unit"
                  name="unit"
                  type="number"
                  placeholder=""
                  value={values.unit}

                  onBlur={handleBlur} // This apparently updates `touched`?
                />
              </div>
              <div className='-mt-2'>
                <InputText
                  isRequired
                  label="Price per unit"
                  name="price"
                  type="number"
                  placeholder=""
                  value={values.price}

                  onBlur={handleBlur} // This apparently updates `touched`?
                />
              </div>
              <Button
                type="submit" // Change to "submit" to trigger form submission
                onClick={handleSubmit} // This is optional but won't harm
                className="mt-4 text-white bg-blue-700"
                disabled={isSubmitting}
              >Add Item</Button>

            </DialogContent>
          </Dialog>
        )}
      </Formik>
    );
  };

  return (
    <div className="container mx-auto p-6 ">
      <Card className="bg-white">
        <CardHeader>
          {/* <CardTitle className="text-3xl">Inventory Management</CardTitle> */}
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex justify-between items-center">
            <AddItemDialog />

            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <Table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
            <TableHeader className="text-sm font-medium text-gray-700 bg-gray-100">
              <TableRow>
                <TableHead className="px-4 py-3 text-left">Name</TableHead>
                <TableHead className="px-4 py-3 text-left">Quantity</TableHead>
                <TableHead className="px-4 py-3 text-left">Unit</TableHead>
                <TableHead className="px-4 py-3 text-left">Min Threshold</TableHead>
                <TableHead className="px-4 py-3 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow
                  key={item.id}
                  className={`text-sm border-t ${item.quantity <= item.minThreshold ? "bg-red-50" : "bg-white"} hover:bg-gray-50 transition-all`}
                >
                  <TableCell className="px-4 py-3">{item.name}</TableCell>
                  <TableCell className="px-4 py-3">{item.quantity}</TableCell>
                  <TableCell className="px-4 py-3">{item.unit}</TableCell>
                  <TableCell className="px-4 py-3">{item.minThreshold}</TableCell>
                  <TableCell className="px-4 py-3 flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-blue-500 hover:bg-blue-100 rounded-full p-2"
                      onClick={() => {
                        setCurrentItem(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:bg-red-100 rounded-full p-2"
                      onClick={() => {
                        setCurrentItem(item);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="!z-[1000] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                  className="col-span-3"
                />


              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number.parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-unit" className="text-right">
                  Unit
                </Label>
                <Input
                  id="edit-unit"
                  value={currentItem.unit}
                  onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-minThreshold" className="text-right">
                  Min Threshold
                </Label>
                <Input
                  id="edit-minThreshold"
                  type="number"
                  value={currentItem.minThreshold}
                  onChange={(e) => setCurrentItem({ ...currentItem, minThreshold: Number.parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <Button
            className="mt-4 text-white bg-blue-700"
            onClick={updateItem}>Update Item</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this item?</p>
          <Button onClick={deleteItem}>Confirm Delete</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
