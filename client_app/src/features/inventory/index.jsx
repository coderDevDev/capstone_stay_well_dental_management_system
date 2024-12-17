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

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table'; // new

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import InputText from '../../components/Input/InputText';

import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import { formatAmount } from './../../features/dashboard/helpers/currencyFormat';
import RadioText from '../../components/Input/Radio';


import * as XLSX from 'xlsx';

const todayInManila = new Date().toLocaleString('en-CA', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).split(',')[0];

const TopSideButtons = ({ removeFilter, applyFilter, applySearch, users }) => {


  const exportToXLS = () => {
    let tableData = users;
    // Convert table data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(tableData);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Export the workbook to an XLS file
    XLSX.writeFile(workbook, 'table_data.xlsx');
  };

  const [filterParam, setFilterParam] = useState('');
  const [searchText, setSearchText] = useState('');

  const locationFilters = [''];

  const showFiltersAndApply = params => {
    applyFilter(params);
    setFilterParam(params);
  };

  const removeAppliedFilter = () => {
    removeFilter();
    setFilterParam('');
    setSearchText('');
  };

  useEffect(() => {
    if (searchText === '') {
      removeAppliedFilter();
    } else {
      applySearch(searchText);
    }
  }, [searchText]);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  return (
    <div className="inline-block float-right">
      {/* <SearchBar
        searchText={searchText}
        styleClass="mr-4"
        setSearchText={setSearchText}
      />
      {filterParam != '' && (
        <button
          onClick={() => removeAppliedFilter()}
          className="btn btn-xs mr-2 btn-active btn-ghost normal-case">
          {filterParam}
          <XMarkIcon className="w-4 ml-2" />
        </button>
      )} */}
      <div className="badge badge-neutral mr-2 px-2 p-4">Total: {users.length}</div>

      <button className="btn btn-outline btn-sm" onClick={() => document.getElementById('addSupplier').showModal()}>
        Add
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button>
      <button
        onClick={exportToXLS}
        className="btn btn-outline btn-sm ml-2 bg-green-500 text-white"
      >
        Export to XLS
      </button>

      {/* 
      <button
        className="btn ml-2 font-bold bg-yellow-500 text-white"
        onClick={() => document.getElementById('my_modal_1').showModal()}>
        Import from file
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button> */}

      {/* <div className="dropdown dropdown-bottom dropdown-end">
        <label tabIndex={0} className="btn btn-sm btn-outline">
          <FunnelIcon className="w-5 mr-2" />
          Filter
        </label>
        <ul
          tabIndex={0}
          className="z-40 dropdown-content menu p-2 text-sm shadow bg-base-100 rounded-box w-52">
          {locationFilters.map((l, k) => {
            return (
              <li key={k}>
                <a onClick={() => showFiltersAndApply(l)}>{l}</a>
              </li>
            );
          })}
          <div className="divider mt-0 mb-0"></div>
          <li>
            <a onClick={() => removeAppliedFilter()}>Remove Filter</a>
          </li>
        </ul>
      </div> */}
    </div>
  );
};

function Transactions() {
  const [activeTab, setActiveTab] = useState(1); // State to control active tab
  const [file, setFile] = useState(null);
  const [users, setUser] = useState([]);
  const [paymentHistoryList, setActivePaymentHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewedData, setViewedData] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [isAddPaymentOpen, setisAddPaymentOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeChildID, setactiveChildID] = useState('');
  const [suppliers, setSupplierList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);


  const fetchInventoryList = async (SupplierID) => {
    let res = await axios({
      method: 'post',
      url: 'inventory/list',
      data: {
        SupplierID: SupplierID
      }
    });

    let list = res.data.data;
    setInventoryList(list);
  };
  useEffect(() => {

    fetchSuppliers();
    setIsLoaded(true);

  }, []);

  const fetchSuppliers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'supplier/list',
      data: {

      }
    });

    let list = res.data.data;
    setSupplierList(list.map((s) => {
      return {
        label: s.SupplierName,
        value: s.SupplierID,

      }
    }));
  };




  useEffect(() => {

    fetchSuppliers();
    fetchInventoryList()
    setIsLoaded(true);

  }, []);


  const [inventoryReportDetails, setInventoryReportDetails] = useState(false);

  const generateInventoryReport = async () => {
    let res = await axios({
      method: 'POST',
      url: `inventory/generateInventoryReport/${viewedData.OrderID}`,
      data: {

      }
    });

    let data = res.data.data;

    setInventoryReportDetails(data);


    let supplierPayments = await axios({
      // headers: {
      //   'content-type': 'multipart/form-data'
      // },
      method: 'POST',
      url: 'supplier/supplierPaymentHistory',
      data: {
        SupplierID: viewedData.SupplierID,
        OrderID: viewedData.OrderID
      }

    }).then((res) => {


      setActivePaymentHistory(res.data.data)


    });


  };


  useEffect(() => {

    if (!!viewedData && viewedData.OrderID) {
      generateInventoryReport()
    }



  }, [viewedData.OrderID]);

  const appSettings = useSelector(state => state.appSettings);
  let { codeTypeList, packageList } = appSettings;

  const removeFilter = async () => {
    // let res = await axios({
    //   method: 'POST',
    //   url: 'user/getChildrenList',
    //   data: {
    //     sponsorIdNumber: ''
    //   }
    // });
    // let list = res.data.data;

    // console.log({ list });
    // setUser(list);
  };

  const applyFilter = params => {
    let filteredUsers = users.filter(t => {
      return t.address === params;
    });
    setUser(filteredUsers);
  };

  // Search according to name
  const applySearch = value => {
    let filteredUsers = users.filter(t => {
      return (
        t.email.toLowerCase().includes(value.toLowerCase()) ||
        t.firstName.toLowerCase().includes(value.toLowerCase()) ||
        t.lastName.toLowerCase().includes(value.toLowerCase())
      );
    });
    setUser(filteredUsers);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  // console.log(users);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const columns = useMemo(
    () => [
      {
        Header: 'Order ID',
        accessor: 'OrderID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Supplier ID',
        accessor: '',
        Cell: ({ row }) => {
          return <span className="">{row.index + 1}</span>;
        }
      },

      {
        Header: 'Supplier Name',
        accessor: 'SupplierName',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Grams',
        accessor: 'Grams',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value.toFixed(2)}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Category',
        accessor: 'Category',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Price',
        accessor: 'Price',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{formatAmount(value)}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Amount',
        accessor: 'Amount',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{formatAmount(value)}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Modified By',
        accessor: 'Admin_FullName',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Date Modified',
        accessor: 'DateModified',

        Cell: ({ row, value }) => {
          let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{date_modified}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Action',
        accessor: '',
        Cell: ({ row }) => {
          let l = row.original;



          return (
            (
              <div className="flex">
                <button
                  className="btn btn-outline btn-sm mr-2"
                  onClick={() => {
                    setViewedData(l)
                    document.getElementById('inventoryViewDetails').showModal();
                  }}>
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button className="btn btn-outline btn-sm mr-2"
                  onClick={() => {

                    setisAddPaymentOpen(true)
                    setSelectedSupplier(l);



                    document.getElementById('inventoryDetails').showModal();
                    // setFieldValue('Admin_Fname', 'dex');
                  }}>



                  <i class="fa-regular fa-edit"></i>
                </button>



                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {


                    console.log(l.OrderID)

                    setactiveChildID(l.OrderID);
                    document.getElementById('deleteModal').showModal();
                  }}>
                  <i class="fa-solid fa-archive"></i>
                </button>
              </div>
            )
          );
        }
      },

    ],
    []
  );

  const tableColumns = useMemo(
    () => [

      {
        Header: 'Payment ID',
        accessor: 'PaymentID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Supplier ID',
        accessor: 'SupplierID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      // {
      //   Header: 'Date Created',
      //   accessor: 'Date',
      //   Cell: ({ row, value }) => {
      //     return <span className="">{value}</span>;
      //   }
      // },
      {
        Header: 'Order ID',
        accessor: 'OrderID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      // 
      {
        Header: 'Payment Date',
        accessor: 'Date',

        Cell: ({ row, value }) => {
          let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{date_modified}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Status',
        accessor: 'Payment_Status',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');

          let isPaid = value === 'PAID';
          return (
            <div className="flex items-center space-x-3">


              <div className={`px-4 py-2 rounded-full font-bold text-white ${isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}>
                {isPaid ? 'Paid' : 'Partially Paid'}
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Amount',
        accessor: 'Amount',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          let USDollar = new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'Php',
          });
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{USDollar.format(value)}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Payment Method',
        accessor: 'Payment_Method',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div className={`px-4 py-2 rounded-full font-bold text-white ${value ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                {value}
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Action',
        accessor: '',
        Cell: ({ row }) => {
          let l = row.original;



          return (
            (
              <div className="flex">



                <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                  // console.log("Dex")
                  // setisEditModalOpen(true)
                  // console.log({ l })
                  setSelectedPayment(l);

                  document.getElementById('viewProofPaymentImage').showModal();



                }}>



                  <i class="fa-regular fa-eye"></i>
                </button>





              </div>
            )
          );
        }
      },



    ],
    []
  );

  const handleOnChange = e => {
    console.log(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('file', file);
      let res = await axios({
        // headers: {
        //   'content-type': 'multipart/form-data'
        // },
        method: 'POST',
        url: 'user/uploadFile',
        data
      });

      setIsSubmitting(false);
      fetchSuppliers();
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


  const formikConfig = (selectedSupplier) => {

    console.log({ selectedSupplier })

    // console.log({ selectedSupplier })

    // console.log({ isAddPaymentOpen })

    // console.log(selectedSupplier.Admin_Fname)




    let validation = {
      SupplierID: Yup.string().required('Required'),
      Category: Yup.string().required('Required'),
      Grams: Yup.number().required('Required').min(1, 'Must be greater than or equal to 1'),
      Price: Yup.number()
        .required('Price is required')
        .min(0, 'Must be greater than or equal to 0')
        // .max(1000000, 'Price cannot exceed 1 million')
        .typeError('Price must be a number'),
      Amount: Yup.number()
        .required('Amount is required')
        .min(0, 'Must be greater than or equal to 0')
        // .max(1000000, 'Amount cannot exceed 1 million')
        .typeError('Amount must be a number'),
      Date: Yup.date().required('Required')
    };




    const defaultDate = new Date();

    // Format it as YYYY-MM-DD
    const formattedDate = defaultDate.toISOString().split('T')[0]; // '2024-10-1
    console.log({ formattedDate })
    let initialValues = {
      SupplierID: parseInt(selectedSupplier?.SupplierID) || '',
      Category: selectedSupplier?.Category || '',
      Grams: selectedSupplier?.Grams || '',
      Price: selectedSupplier?.Price || '',
      Amount: selectedSupplier?.Amount || '',
      Date: formattedDate
    }


    return {
      enableReinitialize: true,
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      validateOnMount: true,
      validateOnChange: true,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);


        try {



          if (selectedSupplier.OrderID) {

            let res = await axios({
              method: 'put',
              url: `inventory/${selectedSupplier.OrderID}`,
              data: values
            })
            document.getElementById('inventoryDetails').close();
            await fetchSuppliers();
            await fetchInventoryList();
            resetForm()
            toast.success('Updated successfully!', {
              onClose: () => {
                setSubmitting(false);

                // navigate('/app/suppliers');
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


          } else {
            let res = await axios({
              method: 'POST',
              url: 'inventory/create',
              data: values
            })
            document.getElementById('addSupplier').close();
            await fetchSuppliers();
            await fetchInventoryList();
            resetForm()
            toast.success('Added successfully!', {
              onClose: () => {
                setSubmitting(false);

                // navigate('/app/suppliers');
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

          }




        } catch (error) {
          console.log({ error });
        } finally {
        }
      }
    };
  };


  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = async (event) => {
    setSelectedOption(event.target.value);
    await fetchInventoryList(event.target.value)
  };


  // console.log({
  //   viewedData
  // })

  console.log({ dexxx: inventoryReportDetails?.TotalGramsSold });
  const leftColumnData = [
    { key: 'Grams', value: viewedData.Grams },
    { key: 'Total Grams Sold', value: inventoryReportDetails?.TotalGramsSold },
    { key: 'Remaining Stocks', value: viewedData.Grams - inventoryReportDetails?.TotalGramsSold || 0 },
  ];

  const rightColumnData = [
    { key: 'Total Price', value: formatAmount(viewedData?.Amount || 0) },
    { key: 'Amount Payable', value: formatAmount(inventoryReportDetails?.AmountPayable || 0) },
    { key: 'Amount Paid', value: formatAmount(inventoryReportDetails?.AmountPaid || 0) },
  ];

  return (
    isLoaded && (
      <TitleCard
        title="List"
        topMargin="mt-2"
        TopSideButtons={
          <TopSideButtons
            applySearch={applySearch}
            applyFilter={applyFilter}
            removeFilter={removeFilter}
            users={inventoryList}
          />
        }>
        <div className="">
          <select
            value={selectedOption}
            onChange={handleChange}
            className="block w-60 px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select supplier</option>
            {suppliers.map(v => {
              return {
                value: v.value,
                label: v.label
              }
            }).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}

          </select>
          {/* <Dropdown
            // icons={mdiAccount}
            label="Supplier Name"
            name="SupplierID"
            placeholder=""
            // value={values.SupplierID}
            // setFieldValue={setFieldValue}
            // onBlur={handleBlur}
            options={suppliers}
          /> */}
          <Table
            style={{ overflow: 'wrap' }}
            className="table-sm"
            columns={columns}
            data={(inventoryList || []).map(data => {
              return {
                ...data
                // fullName,
                // address: fullAddress,
                // packageDisplayName: aP && aP.displayName,
                // date_created:
                //   data.date_created &&
                //   format(data.date_created, 'MMM dd, yyyy hh:mm:ss a')
              };
            })}
            searchField="lastName"
          />
        </div>
        <form >
          <dialog id="my_modal_1" className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Upload Excel File</h3>
              {/* <p className="py-4">Pick a file</p> */}

              {isSubmitting && (
                <div
                  class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-2"
                  role="alert">
                  <p class="font-bold">Please wait</p>
                  <p>Uploading ...</p>
                </div>
              )}

              <label className="form-control w-full">
                <div className="label">
                  {/* <span className="label-text">Pick a file</span> */}
                </div>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full max-w-xs w-full"
                  onChange={handleOnChange}
                />
              </label>

              <div className="modal-action">
                {/* if there is a button in form, it will close the modal */}
                <button
                  className="btn mr-2 btn-primary"
                  disabled={isSubmitting || !file}
                  onClick={async e => {
                    if (!isSubmitting && file) {
                      await handleSubmit(e);
                    }
                  }}>
                  Upload
                </button>
                <button className="btn" disabled={isSubmitting || !file}>
                  Close
                </button>
              </div>
            </div>
          </dialog>
        </form>
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
                      url: `/archive/inventory/${activeChildID}/OrderID`,
                      data: {
                        activeChildID: activeChildID
                      }
                    });

                    fetchInventoryList();
                    document.getElementById('deleteModal').close();
                    toast.success(`Archived Successfully`, {
                      onClose: () => {
                        // window.location.reload();
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
        <dialog id="addSupplier" className="modal">
          <div className="modal-box w-11/12 max-w-2xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg">Fill Out Form</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold">Supplier Order Details</p>
            <div className="p-2 space-y- md:space-y-6 sm:p-4">
              <Formik {...formikConfig(selectedSupplier)}>
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur, // handler for onBlur event of form elements
                  values,
                  touched,
                  errors,
                  submitForm,
                  setFieldTouched,
                  setFieldValue,
                  setFieldError,
                  setErrors,
                  isSubmitting,

                }) => {
                  const checkValidateTab = () => {
                    // submitForm();
                  };
                  const errorMessages = () => {
                    // you can add alert or console.log or any thing you want
                    alert('Please fill in the required fields');
                  };

                  // console.log({ values })

                  return (
                    <Form className="">
                      {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                        {
                          console.log({ suppliers })
                        }
                        <Dropdown
                          // icons={mdiAccount}
                          isRequired
                          label="Supplier Name"
                          name="SupplierID"
                          placeholder=""
                          value={values.SupplierID}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={suppliers}
                        />
                        <Dropdown
                          // icons={mdiAccount}
                          isRequired
                          label="Category"
                          name="Category"
                          placeholder=""
                          value={values.Category}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={[
                            // { value: 'Pendant', label: 'Pendant' },
                            // { value: 'Bangle', label: 'Bangle' },
                            // { value: 'Earrings', label: 'Earrings' },
                            // { value: 'Bracelet', label: 'Bracelet' },
                            // { value: 'Necklace', label: 'Necklace' },
                            // { value: 'Rings', label: 'Rings' },
                            { value: 'BRAND NEW', label: 'BRAND NEW' },
                            { value: 'SUBASTA', label: 'SUBASTA' },
                          ]}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                        <InputText
                          isRequired
                          label="Total Grams"
                          name="Grams"
                          type="number"
                          placeholder=""
                          value={values.Grams || ''} // Display an empty string if Grams is 0
                          onBlur={handleBlur}
                          onChange={(e) => {
                            let grams = parseFloat(e.target.value) || ''; // Set to empty string if NaN or 0
                            grams = grams ? parseFloat(grams.toFixed(2)) : ''; // Limit to two decimal places if non-empty

                            const price = parseFloat(values.Price) || 0;
                            const amount = grams ? parseFloat((grams * price).toFixed(2)) : ''; // Set Amount to empty if Grams is empty

                            setFieldValue("Grams", grams);
                            setFieldValue("Amount", amount);
                          }}
                        />
                        <InputText
                          isRequired
                          label="Price Per Gram(₱)"
                          name="Price"
                          type="number"
                          placeholder=""
                          value={values.Price}
                          onChange={(e) => {
                            let price = parseFloat(e.target.value);

                            // Only proceed if price is a valid number and greater than 0
                            if (!isNaN(price) && price > 0) {
                              price = parseFloat(price.toFixed(2)); // Limit to two decimal places
                              const grams = parseFloat(values.Grams) || 0;
                              setFieldValue("Price", price);
                              setFieldValue("Amount", parseFloat((grams * price).toFixed(2))); // Limit Amount to two decimal places
                            } else {
                              // If the input is not valid, reset Price and Amount
                              setFieldValue("Price", '');
                              setFieldValue("Amount", '');
                            }
                          }}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                        <InputText
                          isRequired
                          label="Amount Payable(₱)"
                          name="Amount"
                          type="number"
                          placeholder=""
                          value={values.Amount}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />  <InputText
                          isRequired
                          min={todayInManila}
                          label="Date"
                          name="Date"
                          type="date"
                          placeholder=""
                          value={values.Date}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>
                      * All fields are required.
                      <button
                        // type="button"
                        type="submit"
                        className={
                          'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white' +
                          (loading ? ' loading' : '')
                        }>
                        Submit
                      </button>
                    </Form>
                  );
                }}
              </Formik> </div>
          </div>
        </dialog>


        <dialog id="inventoryViewDetails" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <button className="btn btn-sm btn-circle absolute right-2 top-2"

              onClick={() => {
                setViewedData({})
                document.getElementById("inventoryViewDetails").close();
              }}
            >✕</button>

            <div>
              <ul
                className="flex mb-0 list-none flex-wrap pt-0 pb-4 flex-row"
                role="tablist">
                <li className="mr-2 last:mr-0 flex-auto text-center">
                  <a
                    className={
                      'text-xs font-bold uppercase px-5 py-3 shadow-sm rounded block leading-normal ' +
                      (activeTab === 1
                        ? 'text-white bg-slate-700 rounded-lg shadow-lg'
                        : 'text-slate-700 bg-slate-200 shadow-md')
                    }
                    onClick={e => {
                      e.preventDefault();
                      setActiveTab(1);
                    }}
                    data-toggle="tab"
                    href="#link1"
                    role="tablist">
                    <i className="fa-solid fa-check-to-slot mr-2"></i>
                    Inventory Details
                  </a>
                </li>
                <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                  <a
                    className={
                      'text-xs font-bold uppercase px-5 py-3 shadow-sm rounded block leading-normal ' +
                      (activeTab === 2
                        ? 'text-white bg-slate-700 rounded-lg shadow-lg'
                        : 'text-slate-700 bg-slate-200 shadow-md')
                    }
                    onClick={e => {
                      e.preventDefault();
                      setActiveTab(2);
                    }}
                    data-toggle="tab"
                    href="#link2"
                    role="tablist">
                    <i className="fa-solid fa-hourglass-half mr-2"></i>
                    Payments
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div
                className={activeTab === 1 ? 'block' : 'hidden'}
                id="link1">
                <div className="flex flex-col items-start space-y-6">
                  <h1 className="text-2xl font-bold text-green-500">
                    Order ID: {viewedData.OrderID}
                  </h1>
                  <table className="min-w-full border border-gray-300">
                    <tbody>
                      <tr>
                        {/* Left Column */}
                        <td className="border-r">
                          <table className="min-w-full">
                            <tbody>
                              {leftColumnData.map((item, index) => (
                                <tr
                                  key={index}
                                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} border-b`}
                                >
                                  <td className="p-4 font-semibold text-gray-700 border-r">{item.key}</td>
                                  <td className="p-4 text-gray-600">{item.value ? item.value.toFixed(2) : 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>

                        {/* Right Column */}
                        <td>
                          <table className="min-w-full">
                            <tbody>
                              {rightColumnData.map((item, index) => (
                                <tr
                                  key={index}
                                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} border-b`}
                                >
                                  <td className="p-4 font-semibold text-gray-700 border-r">{item.key}</td>
                                  <td className="p-4 text-gray-600">{item.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                className={activeTab === 2 ? 'block' : 'hidden'}
                id="link1">
                <h1 className="font-bold text-lg">Supplier Payment History</h1>
                <Table
                  style={{ overflow: 'wrap' }}
                  className="table-sm"
                  columns={tableColumns}
                  data={(paymentHistoryList || []).map(data => {
                    return {
                      ...data
                      // fullName,
                      // address: fullAddress,
                      // packageDisplayName: aP && aP.displayName,
                      // date_created:
                      //   data.date_created &&
                      //   format(data.date_created, 'MMM dd, yyyy hh:mm:ss a')
                    };
                  })}
                  searchField="lastName"
                />
              </div>

            </div>

          </div>
        </dialog>



        <dialog id="inventoryDetails" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {
                  setisAddPaymentOpen(false)
                }}>✕</button>
            </form>
            <h1 className="font-bold text-lg">Details</h1>
            {/* <p className="text-sm text-gray-500 mt-1 font-bold text-buttonPrimary">Supplier Payment</p> */}
            <Formik {...formikConfig(selectedSupplier)}>
              {({
                handleSubmit,
                handleChange,
                handleBlur, // handler for onBlur event of form elements
                values,
                touched,
                errors,
                submitForm,
                setFieldTouched,
                setFieldValue,
                setFieldError,
                setErrors,
                isSubmitting,

              }) => {
                const checkValidateTab = () => {
                  // submitForm();
                };
                const errorMessages = () => {
                  // you can add alert or console.log or any thing you want
                  alert('Please fill in the required fields');
                };

                // console.log({ values })

                return (
                  <Form className="">
                    {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                      <Dropdown
                        // icons={mdiAccount}
                        isRequired
                        label="Supplier Name"
                        name="SupplierID"
                        placeholder=""
                        value={values.SupplierID}
                        setFieldValue={setFieldValue}
                        onBlur={handleBlur}
                        options={suppliers}
                      />
                      <Dropdown
                        // icons={mdiAccount}
                        isRequired
                        label="Category"
                        name="Category"
                        placeholder=""
                        value={values.Category}
                        setFieldValue={setFieldValue}
                        onBlur={handleBlur}
                        options={[
                          { value: 'Pendant', label: 'Pendant' },
                          { value: 'Bangle', label: 'Bangle' },
                          { value: 'Earrings', label: 'Earrings' },
                          { value: 'Bracelet', label: 'Bracelet' },
                          { value: 'Necklace', label: 'Necklace' },
                          { value: 'Rings', label: 'Rings' },
                          { value: 'BRAND NEW', label: 'BRAND NEW' },
                          { value: 'SUBASTA', label: 'SUBASTA' },
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                      <InputText
                        isRequired
                        label="Total Grams"
                        name="Grams"
                        type="number"
                        placeholder=""
                        value={values.Grams}
                        onBlur={handleBlur}
                        onChange={(e) => {
                          const grams = parseFloat(e.target.value) || 0;
                          const price = parseFloat(values.Price) || 0;
                          setFieldValue("Grams", grams);
                          setFieldValue("Amount", grams * price);
                        }}
                      />  <InputText
                        isRequired
                        label="Price (₱)"
                        name="Price"
                        type="number"
                        placeholder=""
                        value={values.Price}
                        onBlur={handleBlur}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          const grams = parseFloat(values.Grams) || 0;
                          setFieldValue("Price", price);
                          setFieldValue("Amount", grams * price);
                        }}

                      />

                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                      <InputText
                        isRequired
                        label="Total Amount (₱)"
                        name="Amount"
                        type="number"
                        placeholder=""
                        value={values.Amount}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />  <InputText
                        isRequired
                        label="Date"
                        name="Date"
                        type="date"
                        placeholder=""
                        value={values.date}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />

                    </div>
                    * All fields are required.
                    <button
                      // type="button"
                      type="submit"
                      className={
                        'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white' +
                        (loading ? ' loading' : '')
                      }>
                      Update
                    </button>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </dialog>

        <dialog id="viewTransactionHistory" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {
                  setisEditModalOpen(false)
                }}>✕</button>
            </form>

          </div>
        </dialog>

        <dialog id="viewProofPaymentImage" className="modal">
          <div className="modal-box">
            <div class="flex justify-center items-center">
              <img id="Proof_Payment" src={`${selectedPayment.Proof_Payment}`} alt="" preview className='object-cover h-120 w-100 ' />
            </div>
            <div className="modal-action">


              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>

      </TitleCard>
    )
  );
}

export default Transactions;
