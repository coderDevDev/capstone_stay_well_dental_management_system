import moment from 'moment';
import React, { useEffect, useState, useMemo, useRef, lazy, useCallback } from 'react';
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
import { PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  setAppSettings,
  getFeatureList
} from '../settings/appSettings/appSettingsSlice';
import { cn } from '@/lib/utils';
// import Table, {
//   AvatarCell,
//   SelectColumnFilter,
//   StatusPill,
//   DateCell
// } from '../../pages/protected/DataTables/Table'; // new

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import InputText from '../../components/Input/InputText';

import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import RegisterPage from '@/app/register/page';
import {
  regions,
  provinces,
  cities,
  barangays
} from 'select-philippines-address';

import {
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  RefreshCw, UserSearch, User, Clock, FilterX, Edit2, Trash2, Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const Register = lazy(() => import('./../../pages/Register'));



function Transactions() {
  const qrCodeRef = useRef();

  const [file, setFile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');
  const [viewedUser, setviewedUser] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({
    key: 'patient_id',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({
    search: '',
    gender: 'all',
    ageRange: 'all',
    dateRange: 'all',
    region: 'all'
  });

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('user/patients/all');
      setPatients(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filterPatients = (data) => {
    return data.filter(patient => {
      const searchFields = [
        patient.full_name,
        patient.email,
        patient.phone_number,
        patient.medical_history
      ].join(' ').toLowerCase();

      const matchesSearch = !filters.search ||
        searchFields.includes(filters.search.toLowerCase());

      const matchesGender = !filters.gender ||
        filters.gender === 'all' ||
        patient.gender === filters.gender;

      const matchesAgeRange = !filters.ageRange ||
        filters.ageRange === 'all' ||
        (() => {
          const age = parseInt(patient.age);
          switch (filters.ageRange) {
            case '0-18': return age >= 0 && age <= 18;
            case '19-30': return age >= 19 && age <= 30;
            case '31-50': return age >= 31 && age <= 50;
            case '51+': return age >= 51;
            default: return true;
          }
        })();

      const matchesRegion = !filters.region ||
        filters.region === 'all' ||
        patient.address_region === filters.region;

      return matchesSearch && matchesGender &&
        matchesAgeRange && matchesRegion;
    });
  };

  const sortPatients = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'full_name') {
        aValue = `${a.patient_first_name} ${a.patient_last_name}`;
        bValue = `${b.patient_first_name} ${b.patient_last_name}`;
      }

      if (sortConfig.key === 'date_of_birth') {
        aValue = new Date(a.date_of_birth);
        bValue = new Date(b.date_of_birth);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getPaginatedData = () => {
    const filteredData = filterPatients(patients);
    const sortedData = sortPatients(filteredData);
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      currentItems: sortedData.slice(startIndex, startIndex + itemsPerPage),
      totalItems: filteredData.length,
      totalPages: Math.ceil(filteredData.length / itemsPerPage)
    };
  };

  const { currentItems, totalItems, totalPages } = getPaginatedData();

  const handleResetFilters = () => {
    setFilters({
      search: '',
      gender: 'all',
      ageRange: 'all',
      dateRange: 'all',
      region: 'all'
    });
    setCurrentPage(1);
  };

  const AddressDisplay = (row) => {
    const [addressNames, setAddressNames] = useState({
      region: '',
      province: '',
      city: '',
      barangay: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    console.log({ row })
    if (!row.original) return null;
    console.log(row);
    const {
      address_region,
      address_province,
      address_city,
      address_or_location
    } = row.original;

    const loadAddressNames = useCallback(async () => {
      try {
        setIsLoading(true);
        const [regionsList, provincesList, citiesList, barangaysList] = await Promise.all([
          regions(),
          address_region ? provinces(address_region) : [],
          address_province ? cities(address_province) : [],
          address_city ? barangays(address_city) : []
        ]);

        const names = {
          region: regionsList.find(r => r.region_code === address_region)?.region_name || '',
          province: provincesList.find(p => p.province_code === address_province)?.province_name || '',
          city: citiesList.find(c => c.city_code === address_city)?.city_name || '',
          barangay: barangaysList.find(b => b.brgy_code === address_or_location)?.brgy_name || ''
        };

        setAddressNames(names);
      } catch (error) {
        console.error('Error loading address names:', error);
      } finally {
        setIsLoading(false);
      }
    }, [address_region, address_province, address_city, address_or_location]);

    useEffect(() => {
      loadAddressNames();
    }, [loadAddressNames]);

    if (isLoading) {
      return <div className="text-neutral-500">Loading address...</div>;
    }

    return (
      <div className="text-neutral-500">
        {addressNames.barangay && <p>{addressNames.barangay}</p>}
        <p>
          {[addressNames.city, addressNames.province, addressNames.region]
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        key: 'full_name',
        label: 'Full Name',
        sortable: true
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true
      },
      {
        key: 'phone_number',
        label: 'Phone Number',
        sortable: true
      },
      // {
      //   key: 'address',
      //   label: 'Address',
      //   sortable: false
      // },
      {
        key: 'date_of_birth',
        label: 'Date of Birth',
        sortable: true
      },
      {
        key: 'age',
        label: 'Age',
        sortable: true
      },
      {
        key: 'gender',
        label: 'Gender',
        sortable: true
      },
      {
        key: 'medical_history',
        label: 'Medical History',
        sortable: false
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false
      }
    ],
    []
  );

  const handleEdit = (user) => {
    const formData = {
      firstName: user.patient_first_name,
      middleName: user.middle_name || '',
      lastName: user.patient_last_name,
      email: user.email,
      phoneNumber: user.phone_number,
      dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
      gender: user.gender,
      region: user.address_region || '',
      province: user.address_province || '',
      city: user.address_city || '',
      barangay: user.address_or_location || '',
      medicalHistory: user.medical_history || '',
      password: '',
      confirmPassword: ''
    };

    setviewedUser({
      ...user,
      formData,
      address_region: user.address_region,
      address_province: user.address_province,
      address_city: user.address_city,
      address_or_location: user.address_or_location
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`user/patients/${patientId}`);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete patient');
      }
    }
  };

  const handleUpdate = async (values) => {
    try {
      const response = await axios.put(`user/patients/${viewedUser.patient_id}`, values);
      if (response.data.success) {
        toast.success('Patient updated successfully');
        setIsEditDialogOpen(false);
        fetchPatients();
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update patient');
    }
  };

  const handleOnChange = e => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('file', file);
      let res = await axios({
        method: 'POST',
        url: 'user/uploadFile',
        data
      });

      setIsSubmitting(false);
      fetchPatients();
      toast.success(`Uploaded Successfully`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } catch (error) {
      toast.error(`Something went wrong`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } finally {
      document.getElementById('my_modal_1').close();
    }
  };

  const formikConfig = () => {
    return {
      initialValues: {
        CustomerName: '',
        Facebook: '',
        Contact: '',
        Address: ''
      },
      validationSchema: Yup.object({
        CustomerName: Yup.string().required('Required'),
        Facebook: Yup.string().required('Required'),
        Contact: Yup.number().required('Required'),
        Address: Yup.string().required('Required'),
      }),
      validateOnMount: true,
      validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);

        try {
          let res = await axios({
            method: 'POST',
            url: 'user/create',
            data: values
          })
          document.getElementById('addCustomer').close();
          await fetchPatients();
          resetForm();
          toast.success('Customer successfully added!', {
            onClose: () => {
              setSubmitting(false);
              navigate('/app/users');
            },
            position: 'top-right',
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });
        } catch (error) {
        } finally {
        }
      }
    };
  };
  const formikConfigUpdate = (viewedUser) => {
    return {
      initialValues: {
        CustomerName: viewedUser.CustomerName || '',
        Facebook: viewedUser.Facebook || '',
        Contact: viewedUser.Contact || '',
        Address: viewedUser.Address || ''
      },
      validationSchema: Yup.object({
        CustomerName: Yup.string().required('Required'),
        Facebook: Yup.string().required('Required'),
        Contact: Yup.number().required('Required'),
        Address: Yup.string().required('Required'),
      }),
      validateOnMount: true,
      validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);

        try {
          let res = await axios({
            method: 'put',
            url: `user/${activeChildID}`,
            data: values
          })
          document.getElementById('updateCustomer').close();
          setviewedUser({})
          await fetchPatients();
          resetForm();
          toast.success('Customer successfully updated!', {
            onClose: () => {
              setSubmitting(false);
              navigate('/app/users');
            },
            position: 'top-right',
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });
        } catch (error) {
        } finally {
        }
      }
    };
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleViewTreatment = (patient) => {
    navigate(`/patients/${patient.patient_id}/treatments`);
  };

  const handleAdd = async (formData) => {
    try {
      const response = await userService.register(formData);
      if (response.success) {
        toast.success('Patient added successfully');
        fetchPatients();
        setIsAddDialogOpen(false);
      } else {
        throw new Error(response.message || 'Failed to add patient');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>Manage your patient records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">

          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-blue-50 text-blue-700 rounded-md px-3 py-1.5 text-sm font-medium">
                Total Patients: {totalItems}
              </div>

              <div className="relative flex-1 min-w-[200px]">
                <UserSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={filters.search}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>

              <Select
                value={filters.gender}
                onValueChange={value => {
                  setFilters(prev => ({ ...prev, gender: value }));
                  setCurrentPage(1);
                }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.ageRange}
                onValueChange={value => {
                  setFilters(prev => ({ ...prev, ageRange: value }));
                  setCurrentPage(1);
                }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="0-18">0-18</SelectItem>
                  <SelectItem value="19-30">19-30</SelectItem>
                  <SelectItem value="31-50">31-50</SelectItem>
                  <SelectItem value="51+">51+</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="flex items-center gap-2">
                <FilterX className="h-4 w-4" />
                Reset Filters
              </Button>

              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={cn(
                          "font-semibold",
                          column.sortable && "cursor-pointer"
                        )}
                        onClick={() => column.sortable && requestSort(column.key)}
                      >
                        {column.label}
                        {sortConfig.key === column.key && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ?
                              <SortAsc className="h-4 w-4 inline" /> :
                              <SortDesc className="h-4 w-4 inline" />
                            }
                          </span>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading patients...
                      </TableCell>
                    </TableRow>
                  ) : currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((item, idx) => (
                      <TableRow
                        key={item.patient_id}
                        className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-muted/30'
                          }`}>
                        <TableCell className="font-medium">
                          {`${item.patient_first_name} ${item.patient_last_name}`}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${item.email}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {item.email}
                          </a>
                        </TableCell>
                        <TableCell>{item.phone_number}</TableCell>
                        {/* <TableCell>
                          <AddressDisplay row={item} />
                        </TableCell> */}
                        <TableCell>
                          {item.date_of_birth ? format(new Date(item.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{item.age}</TableCell>
                        <TableCell>{item.gender}</TableCell>
                        <TableCell>{item.medical_history || 'None'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTreatment(item)}
                              className="bg-green-50 hover:bg-green-100 border-green-200"
                            >
                              <Eye className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 hover:bg-red-100 border-red-200"
                              onClick={() => handleDelete(item.patient_id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} patients
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}>
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const diff = Math.abs(page - currentPage);
                    return diff <= 2 || page === 1 || page === totalPages;
                  })
                  .map((page, i, arr) => (
                    <React.Fragment key={page}>
                      {i > 0 && arr[i - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 bg-gray-600 hover:bg-gray-600 text-white"
                        onClick={() => setCurrentPage(page)}>
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ToastContainer />

      <dialog id="deleteModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Archive Confirmation</h3>
          <p className="py-4">Do you want to archive this record? </p>
          <hr />
          <div className="modal-action mt-12">
            <button
              className="btn btn-outline   "
              type="button"
              onClick={() => {
                document.getElementById('deleteModal').close();
              }}>
              Cancel
            </button>

            <button
              className="btn bg-buttonPrimary text-white"
              onClick={async () => {
                try {
                  let res = await axios({
                    method: 'put',
                    url: `/archive/customer_record/${activeChildID}/CustomerID`,
                    data: {
                      activeChildID: activeChildID
                    }
                  });
                  fetchPatients()
                  document.getElementById('deleteModal').close();
                  toast.success(`Archived Successfully`, {
                    onClose: () => {
                    },
                    position: 'top-right',
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'light'
                  });
                } catch (error) { }
              }}>
              Yes
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="addCustomer" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h1 className="font-bold text-lg">Fill Out Form</h1>
          <p className="text-sm text-gray-500 mt-1">Customer Details</p>
          <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
            <Formik {...formikConfig()}>
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                touched,
                errors,
                submitForm,
                setFieldTouched,
                setFieldValue,
                setFieldError,
                setErrors,
                isSubmitting
              }) => {
                const checkValidateTab = () => {
                };
                const errorMessages = () => {
                  alert('Please fill in the required fields');
                };

                return (
                  <Form className="">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                      <InputText
                        isRequired
                        label="Full Name"
                        name="CustomerName"
                        type="text"
                        placeholder=""
                        value={values.CustomerName}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">
                      <InputText
                        isRequired
                        className="border-2 border-none focus:border-purple-500 rounded-lg p-2 w-full"
                        label="Facebook Link"
                        name="Facebook"
                        type="text"
                        placeholder=""
                        value={values.Facebook}
                        onBlur={handleBlur}
                      />
                      <InputText
                        isRequired
                        label="Contact Number"
                        name="Contact"
                        type="text"
                        placeholder=""
                        value={values.Contact}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                      <InputText
                        isRequired
                        label="Complete Address"
                        name="Address"
                        type="text"
                        placeholder=""
                        value={values.Address}
                        onBlur={handleBlur}
                      />
                    </div>
                    * All fields are required.
                    <button
                      type="submit"
                      className={
                        'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white'

                      }>
                      Submit
                    </button>
                  </Form>
                );
              }}
            </Formik> </div>
        </div>
      </dialog>

      <dialog id="updateCustomer" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h1 className="font-bold text-lg">Update</h1>
          <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
            {viewedUser && <Formik {...formikConfigUpdate(viewedUser)}>
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                touched,
                errors,
                submitForm,
                setFieldTouched,
                setFieldValue,
                setFieldError,
                setErrors,
                isSubmitting
              }) => {
                const checkValidateTab = () => {
                };
                const errorMessages = () => {
                  alert('Please fill in the required fields');
                };

                return (
                  <Form className="">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                      <InputText
                        isRequired
                        label="Full Name"
                        name="CustomerName"
                        type="text"
                        placeholder=""
                        value={values.CustomerName}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">
                      <InputText
                        isRequired
                        className="border-2 border-none focus:border-purple-500 rounded-lg p-2 w-full"
                        label="Facebook Link"
                        name="Facebook"
                        type="text"
                        placeholder=""
                        value={values.Facebook}
                        onBlur={handleBlur}
                      />
                      <InputText
                        isRequired
                        label="Contact Number"
                        name="Contact"
                        type="text"
                        placeholder=""
                        value={values.Contact}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                      <InputText
                        isRequired
                        label="Complete Address"
                        name="Address"
                        type="text"
                        placeholder=""
                        value={values.Address}
                        onBlur={handleBlur}
                      />
                    </div>
                    <button
                      type="submit"
                      className={
                        'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white'

                      }>
                      Update
                    </button>
                  </Form>
                );
              }}
            </Formik>} </div>
        </div>
      </dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] p-6 bg-white rounded-lg shadow-lg overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-lg font-semibold">Edit Patient</h2>
          </div>

          {viewedUser && (
            <RegisterPage
              setIsDialogOpen={setIsEditDialogOpen}
              initialData={viewedUser}
              isEdit={true}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          {/* <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button> */}
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] p-6 bg-white rounded-lg shadow-lg overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-lg font-semibold">Add New Patient</h2>
          </div>
          <RegisterPage
            setIsDialogOpen={setIsAddDialogOpen}
            isEdit={false}
            onSubmit={handleAdd}
            onSuccess={() => {
              setIsAddDialogOpen(false);
              fetchPatients();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Transactions;
