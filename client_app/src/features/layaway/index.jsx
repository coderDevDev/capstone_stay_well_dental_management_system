import moment from 'moment';
import { useEffect, useState, useMemo, useRef } from 'react';
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

import { QRCodeSVG } from 'qrcode.react';
import { formatAmount } from '../dashboard/helpers/currencyFormat';
import {
  setAppSettings,
  getFeatureList
} from '../settings/appSettings/appSettingsSlice';

import easyinvoice from 'easyinvoice';

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
import RadioText from '../../components/Input/Radio';
const TopSideButtons = ({ removeFilter, applyFilter, applySearch, users }) => {
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

      <button className="btn btn-outline btn-sm" onClick={() => document.getElementById('addOrder').showModal()}>
        Add Order
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
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

  const allItemOptions = [
    { value: 'Pendant', label: 'Pendant' },
    { value: 'Bangle', label: 'Bangle' },
    { value: 'Earrings', label: 'Earrings' },
    { value: 'Bracelet', label: 'Bracelet' },
    { value: 'Necklace', label: 'Necklace' },
    { value: 'Rings', label: 'Rings' }
  ];



  const [file, setFile] = useState(null);
  const [users, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentHistoryList, setActivePaymentHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');

  const [isAddPaymentOpen, setisAddPaymentOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [suppliers, setSupplierList] = useState([]);


  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(8000); // Adjust based on your data


  const [inventoryList, setInventoryList] = useState([]);
  const [selectedSupplierID, setSelectedSupplier] = useState({});


  const [pricingSettings, setPricingSettings] = useState({}); // Changed variable name here
  const [pricingSettingsSelected, setPricingSettingsSelected] = useState(); //
  const fetchPricingSettings = async () => {
    try {
      const res = await axios.get(`settings/pricing/1`); // Using shorthand for axios.get
      const settings = res.data.data; // Changed variable name here
      setPricingSettings(settings); // Changed function call here
    } catch (err) {
      console.error('Error fetching pricing settings:', err); // Log the error
      setError('Failed to fetch pricing settings'); // Changed error message here
    } finally {
      setIsLoaded(true); // Ensure isLoaded is set to true regardless of success or error
    }
  };


  useEffect(() => {
    fetchPricingSettings(); // Changed function call here
  }, []);

  const fetchInventoryOrders = async () => {
    let res = await axios({
      method: 'POST',
      url: 'inventory/list',
      data: {
        SupplierID: selectedSupplierID
      }
    });

    let list = res.data.data;




    setInventoryList(list.map((s) => {
      return {
        label: `${s.OrderID}`,
        value: s.OrderID,
        SupplierID: s.SupplierID,
        Total_Grams_Sold: s.Total_Grams_Sold,
        maxGramsOffer: s.Grams - s.Total_Grams_Sold

      }
    }));
  };


  // Sample function to fetch payment data (replace with your API call)
  const fetchPayments = async () => {
    // Example data: replace with your API call


    let res = await axios({
      method: 'POST',
      url: 'layaway/payment/list',
      data: {
        LayawayID: selectedOrder.LayawayID
      }
    });

    let list = res.data.data;


    setPayments(list);
    // calculateTotalPaid(samplePayments);
  };

  // Calculate total paid
  const calculateTotalPaid = (payments) => {
    const total = payments.reduce((acc, payment) => acc + payment.amount, 0);
    setTotalPaid(total);
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedOrder]);


  const fetchOrders = async () => {
    let res = await axios({
      method: 'POST',
      url: 'layaway/list',
      data: {

      }
    });

    let list = res.data.data;




    setOrders(list)
  };

  const fetchCustomers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getCustomerList',
      data: {

      }
    });

    let list = res.data.data;


    setCustomers(list.map((s) => {
      return {
        label: `${s.CustomerName} - ${s.Contact}`,
        value: s.CustomerID,
        Facebook: s.Facebook
      }
    }));
  };

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

  const fetchAll = () => {

    fetchSuppliers();
    fetchCustomers();
    fetchOrders();
    fetchInventoryOrders()
  }

  useEffect(() => {
    fetchInventoryOrders()
  }, [selectedSupplierID]);

  useEffect(() => {
    dispatch(getFeatureList()).then(result => {
      fetchAll();
      setIsLoaded(true);
    });
  }, []);

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
        Header: 'QR Code',
        accessor: 'qr',
        Cell: ({ row }) => {
          let l = row.original;



          return (
            (
              <div className="flex">






                <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                  setSelectedOrder(l);

                  document.getElementById('viewQRCode').showModal();


                }}>



                  <i class="fa-solid fa-barcode"></i> QR
                </button>

              </div>
            )
          );
        }
      },

      {
        Header: 'Date Created',
        accessor: 'Date_Created',
        Cell: ({ row, value }) => {
          return <span className="">{value && format(value, 'MMM dd, yyyy hh:mm:ss a')}</span>;
        }
      },
      {
        Header: 'Layaway ID',
        accessor: 'OrderID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Customer ID',
        accessor: 'CustomerID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Customer Name',
        accessor: 'CustomerName',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Grams',
        accessor: 'Grams',
        Cell: ({ row, value }) => {
          return <span className="">{value.toFixed(2)}</span>;
        }
      },
      {
        Header: 'Category',
        accessor: 'Category',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Price',
        accessor: 'Price',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Months to Pay',
        accessor: 'MonthsToPay',
        Cell: ({ row, value }) => {
          return <span className="">{value} Month(s)</span>;
        }
      },
      {
        Header: 'Start Date',
        accessor: 'Start_Date',
        Cell: ({ row, value }) => {
          let date = format(value, 'MMM dd, yyyy');
          return <span className="">{date}</span>;
        }
      },
      {
        Header: 'Due Date',
        accessor: 'Due_Date',
        Cell: ({ row, value }) => {
          let date = format(value, 'MMM dd, yyyy');
          return <span className="">{date}</span>;
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row, value }) => {

          let dueDate = row.original.Due_Date;


          const targetDate = new Date(dueDate);
          const now = new Date(); // Gets the current date and time

          // Check if the current date matches the target date
          const isMatchingDate = now.toISOString() === targetDate.toISOString();
          // const isPastDueDate = now > dueDate;

          return <StatusPill value={value} />
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
                  setSelectedOrder(l);

                  document.getElementById('viewProofPaymentImage').showModal();



                }}>



                  <i class="fa-regular fa-eye"></i>
                </button>

                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {


                    setactiveChildID(l.LayawayID);
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




    let validation = {
      MonthsToPay: Yup.number().required('Required'),
      Start_Date: Yup.date().required('Required'),
      CustomerID: Yup.string().required('Required'),
      Facebook: Yup.string().required('Required'),
      // ItemName: Yup.string().required('Required'),
      Category: Yup.string().required('Required'),
      SupplierID: Yup.string().required('Required'),
      Grams: Yup.number().required('Required').min(1, 'Must be greater than or equal to 1'),
      Price: Yup.number()
        .required('Price is required')
        .min(0, 'Must be greater than or equal to 0')
        .max(1000000, 'Price cannot exceed 1 million')
        .typeError('Price must be a number'),
      PriceWithInterest: Yup.number()
        .required('Price is required')
        .min(0, 'Must be greater than or equal to 0')
        .max(1000000, 'Price cannot exceed 1 million')
        .typeError('Price must be a number'),
      quantity: Yup.number().required('Quantity is required').positive('Must be a positive number').integer('Must be an integer'),
      itemNames: Yup.array().of(
        Yup.number()
          // .required('Item count is required')
          .test(
            'max-toTal-quantity',
            'The item count must not exceed the total quantity available',
            function (value) {

              let total = this.parent.reduce((acc, current) => {
                let sum = current;
                if (!current) {
                  sum = 0;
                }
                return acc + sum
              }, 0)




              const quantity = this.from[0].value.quantity; // Access sibling value return value <= quantity; 


              if (total > quantity) {
                return false
              }
              return true
            }
          )
          .test(
            'max-to-quantity',
            'The item count must not exceed or less than the quantity',
            function (value) {

              let total = this.parent.reduce((acc, current) => {
                let sum = current;
                if (!current) {
                  sum = 0;
                }
                return acc + sum
              }, 0)




              const quantity = this.from[0].value.quantity; // Access sibling value return value <= quantity; 

              if (total === 0) {
                return false
              }
              else if (total < quantity) {

                return false

              }
              else if (value > quantity) {
                return false
              }
              return true
            }
          )

      ),
      Downpayment: Yup.number()
        .required('Required')
        .moreThan(0, 'Downpayment must be greater than 0') // Downpayment must be greater than 0
        .lessThan(Yup.ref('PriceWithInterest'), 'Downpayment must be less than Price'), // Downpayment must be less than Price

    };

    let initialValues = {
      PriceWithInterest: '',
      quantity: 1,
      itemNames: [

      ],
      MonthsToPay: '',
      Start_Date: '',
      Due_Date: '',
      CustomerID: '',
      Facebook: '',
      Category: '',
      SupplierID: '',
      Grams: '',
      Price: '',
      // ItemName: '',
      Downpayment: ''
    }


    // if (isAddPaymentOpen) {
    //   validation = {
    //     OrderID: Yup.string().required('Required'),
    //     Date: Yup.string().required('Required'),
    //     Amount: Yup.string().required('Required'),
    //     Payment_Status: Yup.string().required('Required'),

    //     Payment_Method: Yup.string().required('Required')
    //   }
    //   initialValues = {
    //     OrderID: '',
    //     Amount: '',
    //     Payment_Status: '',
    //     Date: '',
    //     Payment_Method: '',
    //     Proof_Payment: '',
    //     SupplierID: selectedSupplier.SupplierID,
    //     SupplierName: selectedSupplier.SupplierName
    //   };
    // }

    return {
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      validateOnMount: true,
      validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);

        // console.log("here")
        // console.log({ isEditModalOpen })




        try {

          const itemNames = allItemOptions.map((item, index) => ({
            item: item.label,
            count: values.itemNames[index] || 0 // Default to0 if the count is empty}));  
          })).filter((item) => {
            return item.count > 0
          });
          let finalData = { ...values, Due_Date: endDate, Price: values.PriceWithInterest, itemNames };




          let res = await axios({
            method: 'POST',
            url: 'layaway/create',
            data: finalData
          })
          fetchOrders()
          document.getElementById('addOrder').close();
          toast.success('Added Successfully!', {
            onClose: () => {
              setSubmitting(false);
              // navigate('/app/transactions');
            }
          })

          // await fetchAll();

          // // await fetchSuppliers();
          // toast.success('Added Successfully!', {
          //   onClose: () => {
          //     setSubmitting(false);
          //     navigate('/app/transactions');
          //   },
          //   position: 'top-right',
          //   autoClose: 500,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          //   theme: 'light'
          // });


          resetForm()

        } catch (error) {
          console.log({ error });
        } finally {

        }
      }
    };
  };


  const totalAmountPaid = selectedOrder ? payments.filter(s => ['PAYMENT_FOR_APPROVAL', 'PARTIALLY_PAID', 'PAID'].includes(s.status)).reduce((acc, current) => {
    return acc + parseInt(current.amount)
  }, 0) : 0;
  console.log({ totalAmountPaid })


  const formikConfigAddPayment = () => {

    let remainingBalance = parseInt(selectedOrder?.Price) - totalAmountPaid;


    let validation = {
      amount: Yup.number()
        .required('Required')
        .moreThan(0, 'Amount must be greater than 0') // Downpayment must be greater than 0
        .max(remainingBalance, `Amount must be less than remaining balance of ₱${remainingBalance.toFixed(2)}`), // Downpayment must be less than Price
      payment_method: Yup.string().required('Required')
    };

    let initialValues = {

      proof_of_payment: '',
      amount: '',
      payment_method: ''
    }





    return {
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);



        try {


          console.log({ dex: 1 })


          const data = new FormData();



          data.append('Proof_Payment', file);
          data.append('payment_method', values.payment_method);
          data.append('amount', values.amount);
          data.append('customer_id', selectedOrder.CustomerID);
          data.append('layAwayID', selectedOrder.LayawayID);


          let updatedStatus = remainingBalance - values.amount === 0 ? 'PAID' : 'PARTIALLY_PAID';



          data.append('status', updatedStatus);

          let result = await axios({
            // headers: {
            //   'content-type': 'multipart/form-data'
            // },
            method: 'POST',
            url: 'layaway/makePayment',
            data
          });

          fetchPayments()
          document.getElementById('addPayment').close();
          await fetchAll();
          // document.getElementById('addOrder').close();
          // // await fetchSuppliers();
          document.getElementById('viewReceipt').close();
          toast.success('Payment added successfully!', {
            // onClose: () => {
            //   setSubmitting(false);
            //   navigate('/app/transactions');
            // },
            position: 'top-right',
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });

          fetchAll();


        } catch (error) {
          console.log({ error });
        } finally {
          resetForm()
        }
      }
    };
  };



  const [plan, setPlan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate end date based on plan selection and start date
  useEffect(() => {
    if (plan && startDate) {
      const monthsToAdd = parseInt(plan);
      const start = new Date(startDate);
      const calculatedEndDate = new Date(start.setMonth(start.getMonth() + monthsToAdd));
      console.log({ calculatedEndDate })
      calculatedEndDate && setEndDate(calculatedEndDate.toISOString().split('T')[0]);
    } else {
      setEndDate('');
    }
  }, [plan, startDate]);


  const qrCodeRef = useRef();
  const downloadQRCode = () => {
    // Create a canvas element to convert SVG to image  
    const canvas = document.createElement('canvas');
    const size = 200; // size of the QR code  
    canvas.width = size;
    canvas.height = size;

    // Get the SVG data  
    const svg = qrCodeRef.current.querySelector('svg'); // Adjust to get the SVG element  
    const svgData = new XMLSerializer().serializeToString(svg);

    // Convert SVG to data URL  
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Draw the image on the canvas  
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url); // Clean up the URL object  

      // Trigger the download of the image  
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png'); // Convert to png  
      link.download = 'qrcode.png'; // Set the file name  
      link.click(); // Simulate a click to trigger download  
    };

    // Set the src of the image to the URL created from SVG blob  
    img.src = url;
  };


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
            users={orders}
          />
        }>
        <div className="">
          <Table
            style={{ overflow: 'wrap' }}
            className="table-sm"
            columns={columns}
            data={(orders || []).map(data => {
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
                      url: `/archive/layaway/${activeChildID}/LayawayID`,
                      data: {
                        activeChildID: activeChildID
                      }
                    });

                    document.getElementById('deleteModal').close();
                    fetchAll()
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


        <dialog id="addOrder" className="modal">
          <div className="modal-box w-11/12 max-w-2xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg">Fill Out Form</h1>

            <p className="text-sm text-gray-500 mt-1 font-bold">Lay-Away Order Details</p>

            <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mt-4" role="alert">
              <p class="font-bold">Note</p>
              <p>Information will be recorded and cannot be changed</p>
            </div>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <Formik {...formikConfig()}>
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
                  let selectString = {
                    'SUBASTA': 'Amount_Per_Gram_Subasta',
                    'BRAND NEW': 'Amount_Per_Gram_Brand_New'
                  }

                  let selectStringinterest = {
                    'SUBASTA': 'Interest_Subasta',
                    'BRAND NEW': 'Interest_Brand_New'
                  }


                  const calculatePriceInterest = (grams, monthsToPay = 1, categoryCalue) => {
                    let categoryDropdownValue = categoryCalue || values.Category;


                    const interestPerGramInDb = parseFloat(pricingSettings[selectStringinterest[categoryDropdownValue]]);




                    let interestTimeMonthsToPay = interestPerGramInDb * monthsToPay;










                    setFieldValue('interestPrice', interestTimeMonthsToPay);


                    let basicPrice = parseFloat(grams * pricingSettingsSelected)



                    setFieldValue('PriceWithInterest', basicPrice + interestTimeMonthsToPay)

                    // console.log({ interestPrice, price: price })
                    // setFieldValue('PriceWithInterest', 2); //
                  }


                  return (
                    <Form className="">
                      {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                        <Dropdown
                          isRequired
                          // icons={mdiAccount}
                          label="Supplier Name"
                          name="SupplierID"
                          placeholder=""
                          value={values.SupplierID}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={suppliers}
                          affectedInput={
                            'orderID'
                          }
                          functionToCalled={(value) => {
                            setFieldValue('orderID', '');
                            setSelectedSupplier(value);



                            // if (inventoryList.length === 0) {
                            //   setFieldValue('orderID', '')
                            // }
                            // console.log(inventoryList.filter(i => i.SupplierID === `${value}`))

                            // setInventoryList(inventoryList.filter(i => i.SupplierID === `${value}`))
                          }}
                        // onChange={() => {
                        //   // setFieldValue('SupplierName', values.SupplierID)

                        //   console.log({
                        //     inventoryList
                        //   })
                        // }}
                        />

                        < Dropdown
                          isRequired
                          // icons={mdiAccount}
                          label="Inventory Order ID"
                          name="orderID"
                          placeholder=""
                          value={values.orderID}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={inventoryList}
                        />
                      </div>


                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                        <div className='mt-2'>
                          <Dropdown
                            isRequired
                            // icons={mdiAccount}
                            label="Lay-away Plan"
                            name="MonthsToPay"
                            placeholder=""
                            value={1}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={[
                              {
                                label: "1 Month",
                                value: 1
                              },
                              {
                                label: "2 Months",
                                value: 2
                              },
                              {
                                label: "3 Months",
                                value: 3
                              }
                            ]}
                            functionToCalled={async (value) => {

                              // setPlan();
                              // let user = users.find(u => {
                              //   return u.value === value
                              // })
                              setPlan(value)
                              setFieldValue('MonthsToPay', value);
                              await calculatePriceInterest(values.Grams, value)
                            }}
                          />
                        </div>

                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                        <InputText
                          isRequired
                          label="Start Date"
                          name="Start_Date"
                          type="date"
                          placeholder=""
                          value={values.Start_Date}

                          onChange={(e) => {
                            setFieldValue('Start_Date', e.target.value);
                            setFieldValue('Due_Date', endDate);
                            setStartDate(e.target.value)

                          }}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />


                        <InputText
                          isRequired
                          label="Due Date"
                          name="Due_Date"
                          type="date"
                          placeholder=""
                          value={endDate}
                          disabled
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />



                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">



                        <Dropdown
                          isRequired
                          // icons={mdiAccount}
                          label="Customer"
                          name="CustomerID"
                          placeholder=""
                          value={values.CustomerID}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={users}
                          functionToCalled={(value) => {

                            let user = users.find(u => {
                              return u.value === value
                            })

                            setFieldValue('Facebook', user.Facebook)
                          }}
                        />
                        <InputText
                          isRequired
                          className="border-2 py-3 border-none focus:border-purple-500 rounded-lg p-2 w-full"
                          label="Facebook Link"
                          name="Facebook"
                          type="text"
                          placeholder=""
                          value={values.Facebook}
                          disabled
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>


                      <div className="grid grid-cols-1 gap-3 md:grid-cols- ">


                        <InputText
                          isRequired
                          label={`Item Quantity`}
                          name="quantity"
                          type="number"
                          placeholder=""
                          value={values.quantity}

                          onBlur={handleBlur} // This apparently updates `touched`?
                        />


                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {allItemOptions.map((item, index) => (
                            <InputText


                              itemClass={true}
                              key={item.value} // Unique key for each input
                              label={`${item.label}`}
                              name={`itemNames[${index}]`}
                              type="number"
                              placeholder=""
                              value={values.itemNames[index]}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                if (/^\d*$/.test(newValue)) { // Check if the value is a whole number
                                  handleChange(e); // Update the form state
                                }
                              }}
                              onBlur={handleBlur} // This updates `touched`
                              error={errors.itemNames?.[index]} // Show error if touched

                            />
                          ))}
                        </div>

                        <div className='mt-2'>
                          <Dropdown
                            isRequired
                            // icons={mdiAccount}
                            label="Category"
                            name="Category"
                            placeholder=""
                            value={values.Category}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            // affectedInput={
                            //   'orderID'
                            // }
                            functionToCalled={async (value) => {


                              let multiplyBry = pricingSettings[selectString[value]];


                              setPricingSettingsSelected(multiplyBry)

                              setSelectedSupplier(value);

                              setFieldValue('Category', value);

                              await calculatePriceInterest(values.Grams, values.MonthsToPay, value)

                              // if (inventoryList.length === 0) {
                              //   setFieldValue('orderID', '')
                              // }
                              // console.log(inventoryList.filter(i => i.SupplierID === `${value}`))

                              // setInventoryList(inventoryList.filter(i => i.SupplierID === `${value}`))
                            }}
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

                      </div>


                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <InputText
                          isRequired
                          label={`Grams per Items * ₱${pricingSettingsSelected || 0}`}
                          name="Grams"
                          type="number"
                          placeholder=""
                          onChange={(e) => {

                            const grams = e.target.value;



                            let findTotal_Grams_Sold = inventoryList.find(i => i.value === values.orderID);



                            let maxOrder = findTotal_Grams_Sold.maxGramsOffer;





                            // Regex to allow only numbers and up to 2 decimal places
                            const gramsRegex = /^\d*\.?\d{0,2}$/;

                            if (gramsRegex.test(grams) || grams === "") {
                              setFieldValue('Grams', grams); // Update grams directly as a string
                              let gramsNumber = parseFloat(grams);


                              if (gramsNumber > parseFloat(maxOrder)) {
                                gramsNumber = maxOrder;
                                setFieldError(
                                  'Grams', `Mininum order is ${maxOrder} as per inventory`
                                );
                                setFieldValue(
                                  'Grams', maxOrder
                                )

                              }

                              setFieldValue('Price', parseFloat(gramsNumber * pricingSettingsSelected).toFixed(2)); // Update price based on grams
                              let interestPrice = calculatePriceInterest(gramsNumber, values.MonthsToPay, values.Category);

                            }
                          }}
                          value={values.Grams}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                        <InputText
                          isRequired
                          label="Price"
                          name="Price"
                          type="number"
                          placeholder=""
                          disabled
                          value={values.Price}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                      </div>
                      <InputText
                        isRequired
                        label={`Total Price (₱${values.Price} + ₱${(values.interestPrice || 0).toFixed(2)})`}
                        name="PriceWithInterest"
                        type="number"
                        placeholder=""
                        disabled
                        value={values.PriceWithInterest}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />
                      <InputText
                        isRequired
                        label="Initial Downpayment"
                        name="Downpayment"
                        type="number"
                        placeholder=""
                        value={values.Downpayment}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />
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







        <Formik {...formikConfigAddPayment()}>
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
            return <dialog id="addPayment" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Add Payment</h3>
                {/* <p className="py-4">Pick a file</p> */}
                {/* 
                {isSubmitting && (
                  <div
                    class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-2"
                    role="alert">
                    <p class="font-bold">Please wait</p>
                    <p>Uploading ...</p>
                  </div>
                )} */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                  <InputText

                    label="Customer Name"
                    name="CustomerName"
                    type="text"
                    placeholder=""
                    value={selectedOrder.CustomerName}

                    onBlur={handleBlur} // This apparently updates `touched`?
                    disabled


                  /></div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-2">
                  <Dropdown

                    // icons={mdiAccount}
                    label="Payment Method"
                    name="payment_method"
                    placeholder=""
                    value={"Cash"}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={[
                      {
                        label: "Cash",
                        value: "Cash"
                      },
                      {
                        label: "BDO",
                        value: "BDO"
                      },
                      {
                        label: "BPI",
                        value: "BPI"
                      }
                    ]}
                    functionToCalled={(value) => {

                      // setPlan();
                      // let user = users.find(u => {
                      //   return u.value === value
                      // })
                      setPlan(value)
                      setFieldValue('MonthsToPay', value)
                    }}

                  />
                  <InputText

                    label="Amount"
                    name="amount"
                    type="number"
                    placeholder=""


                    onBlur={handleBlur} // This apparently updates `touched`?


                  />

                </div>
                <label className="form-control w-full">
                  <div className="label font-bold">
                    Proof of Payment
                    {/* <span className="label-text">Pick a file</span> */}
                  </div>
                  <input
                    name="proof_of_payment"
                    type="file"
                    className="file-input file-input-bordered w-full max-w-xs w-full"
                    onChange={handleOnChange}
                  />
                </label>

                <div className="modal-action">
                  {/* if there is a button in form, it will close the modal */}
                  <button
                    className="btn mr-2 bg-green-500"
                    disabled={isSubmitting || !file}
                    type='submit'
                    onClick={e => {
                      e.preventDefault();
                      if (!isSubmitting && file) {
                        handleSubmit(e);
                      }
                    }}
                  >
                    Submit
                  </button>
                  <button className="btn" onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('addPayment').close();
                  }}>
                    Close
                  </button>
                </div>
              </div>
            </dialog>
          }}
        </Formik>

        <dialog id="viewProofPaymentImage" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">

            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold mb-4">Payment Summary</h1>
              <div className="p-4">
                <div className="flex justify-between font-bold">
                  <span>Status:</span>
                  <span className='font-2xl'><StatusPill value={selectedOrder.status} /></span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Customer Name:</span>
                  <span>{selectedOrder.CustomerName}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Customer ID</span>
                  <span>{selectedOrder.CustomerID}</span>
                </div>
              </div>
              <div className="bg-white shadow-md rounded-lg  overflow-auto">
                <table className="min-w-full ">
                  <thead className="bg-gray-200 ">
                    <tr>
                      <th className="py-2 px-4 text-left">Layaway ID</th>
                      <th className="py-2 px-4 text-left">Amount Paid</th>
                      <th className="py-2 px-4 text-left">Payment Method</th>
                      <th className="py-2 px-4 text-left">Payment Date</th>
                      <th className="py-2 px-4 text-left">Proof of Payment</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => {

                      let forApproval = payment.status === 'PAYMENT_FOR_APPROVAL'
                      return <tr key={payment.layAwayID} className="border-b">
                        <td className="py-2 px-4">{payment.layAwayID}</td>
                        <td className="py-2 px-4">{formatAmount(payment.amount)}</td>
                        <td className="py-2 px-4">{payment.payment_method}</td>
                        <td className="py-2 px-4">{format(payment.payment_date, 'MMM dd, yyyy')}</td>
                        <td className="py-2 px-4">

                          <button className="btn btn-outline btn-sm mr-2" onClick={async () => {

                            window.open(payment.proof_of_payment, '_blank'); // Opens the image in a new tab



                          }}>



                            <i class="fa-regular fa-eye"></i>
                          </button>


                        </td>
                        <td className="py-2 px-4">

                          <StatusPill value={payment.status} />
                        </td>
                        <td className="py-2 px-4">

                          {forApproval && <div className="flex">
                            <button
                              className="btn btn-success btn-sm flex items-center mr-2"

                              onClick={async () => {
                                let result = await axios({
                                  // headers: {
                                  //   'content-type': 'multipart/form-data'
                                  // },
                                  method: 'POST',
                                  url: 'layaway/payment/updateStatus',
                                  data: {
                                    LayawayID: selectedOrder.LayawayID,
                                    paymentID: payment.id,
                                    status: 'PAID'
                                  }
                                });
                                fetchPayments()
                              }}
                            >
                              <i className="fa-solid fa-check"></i>

                            </button>
                            <button className="btn btn-error  btn-sm  flex items-center"
                              onClick={async () => {
                                let result = await axios({
                                  // headers: {
                                  //   'content-type': 'multipart/form-data'
                                  // },
                                  method: 'POST',
                                  url: 'layaway/payment/updateStatus',
                                  data: {
                                    LayawayID: selectedOrder.LayawayID,
                                    paymentID: payment.id,
                                    status: 'REJECTED'
                                  }
                                });
                                fetchPayments()
                              }}
                            >
                              <i className="fa-solid fa-times"></i>

                            </button>
                          </div>}

                        </td>
                      </tr>
                    })}
                  </tbody>
                </table>
                <div className="p-4">
                  <div className="flex justify-between font-bold">
                    <span className=''>Order Amount:</span>
                    <span className='text-green-500'>{formatAmount(selectedOrder.Price)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total Amount Paid:</span>
                    <span>{formatAmount(totalAmountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Remaining Balance:</span>
                    <span className='text-yellow-500'>{formatAmount(selectedOrder.Price - totalAmountPaid)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">



              {/* if there is a button in form, it will close the modal */}
              <div className='flex'>

                {/* <button

                  disabled={orders.find(o => {
                    return o.LayawayID === selectedOrder.LayawayID && o.status === 'PAID'
                  })}
                  className="btn mr-2 bg-green-500" onClick={() => document.getElementById('addPayment').showModal()}>Add Payment</button> */}

                <button className="btn"
                  onClick={() => document.getElementById('viewProofPaymentImage').close()}
                >Close</button>
              </div>


            </div>
          </div>
        </dialog>


        <dialog id="viewQRCode" className="modal">
          <div className="modal-box  bg-customBlue ">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-white"
                onClick={() => {
                  //  setisEditModalOpen(false)
                }}>✕</button>
            </form>
            <h1 className="font-bold text-lg text-center">QR CODE</h1>
            {/* <div className=' flex justify-center items-center mt-4'>
              <QRCodeSVG value={
                JSON.stringify({ dex: 1 })
              } />,
            </div> */}
            <div className=' flex justify-center items-center mt-4'>
              <div className="card bg-base-100 w-80 shadow-xl">
                {/* <figure>
                
                </figure> */}
                <div className="card-body justify-center items-center">
                  <h2 className="card-title text-center mt-4 font-bold">
                    QR CODE

                  </h2>

                  <div
                    ref={qrCodeRef}
                  >
                    <QRCodeSVG


                      value={
                        `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/myprofile/${selectedOrder.CustomerID}/layaway/${selectedOrder.LayawayID}`

                      }

                      size={200} />
                  </div>

                  <div className="card-actions justify-end">
                    <button
                      // type="button"
                      size="sm"
                      type="submit"
                      onClick={() => {
                        downloadQRCode()
                      }}
                      className={
                        'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white' +
                        (loading ? ' loading' : '')
                      }>
                      Download
                    </button>

                  </div>
                </div>
              </div></div>
          </div>
        </dialog>

      </TitleCard >
    )
  );
}

export default Transactions;
