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
      <div className="badge badge-neutral mr-2 px-2 p-4">Total Supplier: {users.length}</div>

      <button className="btn btn-outline btn-sm" onClick={() => document.getElementById('addSupplier').showModal()}>
        Add Supplier
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

  const [inventoryList, setInventoryList] = useState([]);
  const [file, setFile] = useState(null);
  const [users, setUser] = useState([]);
  const [paymentHistoryList, setActivePaymentHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [isAddPaymentOpen, setisAddPaymentOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchInventoryOrders = async () => {


    let res = await axios({
      method: 'POST',
      url: 'inventory/list',
      data: {
        SupplierID: selectedSupplier.SupplierID
      }
    });

    let list = res.data.data;





    setInventoryList(list.map((s) => {
      return {
        label: `${s.OrderID}`,
        value: s.OrderID,
        SupplierID: s.SupplierID

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
    setUser(list);
  };
  useEffect(() => {
    dispatch(getFeatureList()).then(result => {
      fetchSuppliers();

      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    fetchInventoryOrders()
    // setSelectedSupplier(selectedSupplier)
  }, [selectedSupplier.SupplierID]);

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
        Header: 'Phone Number',
        accessor: 'PhoneNo',

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
        Header: 'Email',
        accessor: 'Email',

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
        Header: 'Modified By',
        accessor: 'Admin_Fname',

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
        accessor: 'Date_Modified',

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

                <button className="btn btn-outline btn-sm mr-2" onClick={() => {

                  setisAddPaymentOpen(true)
                  setSelectedSupplier(l);



                  document.getElementById('createSupplierPayment').showModal();
                  // setFieldValue('Admin_Fname', 'dex');
                }}>



                  <i class="fa-regular fa-credit-card"></i>
                </button>
                <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                  // setisEditModalOpen(true)
                  setSelectedSupplier(l);

                  if (l.SupplierID) {
                    let res = await axios({
                      // headers: {
                      //   'content-type': 'multipart/form-data'
                      // },
                      method: 'POST',
                      url: 'supplier/supplierPaymentHistory',
                      data: {
                        SupplierID: l.SupplierID
                      }

                    }).then((res) => {


                      setActivePaymentHistory(res.data.data)
                      document.getElementById('viewTransactionHistory').showModal();

                    });

                  }



                }}>



                  <i class="fa-regular fa-eye"></i>
                </button>
                <button className="btn btn-outline btn-sm mr-2" onClick={() => {
                  // setactiveChildID(l.SupplierID);
                  setSelectedSupplier(l);
                  document.getElementById('editSupplierModal').showModal();


                }}>



                  <i class="fa-regular fa-edit"></i>
                </button>
                <button className="btn btn-outline btn-sm mr-2" onClick={async () => {

                  setactiveChildID(l.SupplierID);
                  setSelectedSupplier(l);
                  document.getElementById('deleteModal').showModal();

                }}>



                  <i class="fa-solid fa-archive"></i>
                </button>
                {/* 
                <button className="btn btn-outline btn-sm" onClick={() => {

                  // setisEditModalOpen(true)
                  // setSelectedSupplier(l);

                  // document.getElementById('viewTransactionHistory').showModal();
                  // setFieldValue('Admin_Fname', 'dex');
                }}>
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>

                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {
                    // setactiveChildID(l.ID);
                    // document.getElementById('deleteModal').showModal();
                  }}>
                  <i class="fa-solid fa-download"></i>
                </button> */}
              </div>
            )
          );
        }
      },
      // {
      //   Header: 'Name of Mother/Caregiver',
      //   accessor: 'Name_of_Mother_or_Caregiver',

      //   Cell: ({ row, value }) => {
      //     return (
      //       <div className="flex items-center space-x-3">
      //         <div className="avatar">
      //           <div className="mask mask-circle w-12 h-20">
      //             <img
      //               src="https://cdn-icons-png.freepik.com/512/8115/8115385.png?ga=GA1.2.680220839.1714096437"
      //               alt="Avatar"
      //             />
      //           </div>
      //         </div>

      //         <div>
      //           <div className="font-bold text-neutral-500">{value}</div>
      //         </div>
      //       </div>
      //     );
      //   }
      // },
      // {
      //   Header: 'Barangay',
      //   accessor: 'Address_or_Location',
      //   sortable: true,
      //   wrap: true,

      //   Cell: ({ value }) => {
      //     return (
      //       <p
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {value}
      //       </p>
      //     );
      //   }
      // },

      // {
      //   Header: 'Belongs to IP Group?',
      //   accessor: 'Belongs_to_IP_Group',
      //   Cell: ({ value }) => {
      //     return <span className="text-wrap">{value}</span>;
      //   }
      // },
      // {
      //   Header: 'Gender',
      //   accessor: 'Sex',
      //   Cell: ({ value }) => {
      //     return <span className="text-wrap">{value}</span>;
      //   }
      // },

      // {
      //   Header: 'Date of Birth',
      //   accessor: 'Date_of_Birth',
      //   Cell: ({ value }) => {
      //     return (
      //       <span
      //         className=""
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {format(value, 'MMM dd, yyyy')}
      //       </span>
      //     );
      //   }
      // },
      // {
      //   Header: 'Date Measured',
      //   accessor: 'Date_Measured',
      //   Cell: ({ value }) => {
      //     console.log({ value });
      //     return (
      //       <span
      //         className=""
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {value && format(value, 'MMM dd, yyyy')}
      //       </span>
      //     );
      //   }
      // },
      // {
      //   Header: 'Weight',
      //   accessor: 'Weight',
      //   Cell: ({ value }) => {
      //     return (
      //       <span
      //         className=""
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {value} kg
      //       </span>
      //     );
      //   }
      // },
      // {
      //   Header: 'Height',
      //   accessor: 'Height',
      //   Cell: ({ value }) => {
      //     return (
      //       <span
      //         className=""
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {value} cm
      //       </span>
      //     );
      //   }
      // },
      // {
      //   Header: 'Age in Months',
      //   accessor: 'Age_in_Months',
      //   Cell: ({ value }) => {
      //     return (
      //       <span
      //         className=""
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {value}
      //       </span>
      //     );
      //   }
      // },
      // {
      //   Header: 'Weight for Age Status',
      //   accessor: 'Weight_for_Age_Status',
      //   Cell: ({ value }) => {
      //     return (
      //       <span
      //         className=""
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {value}
      //       </span>
      //     );
      //   }
      // },
      // {
      //   Header: 'Height for Age Status',
      //   accessor: 'Height_for_Age_Status',
      //   Cell: ({ value }) => {
      //     return (
      //       <span
      //         className=""
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {value}
      //       </span>
      //     );
      //   }
      // },
      // {
      //   Header: 'Weight for Lt/Ht Status',
      //   accessor: 'Weight_for_Lt_or_Ht_Status',
      //   Cell: ({ value }) => {
      //     return (
      //       <span
      //         className=""
      //         style={{
      //           whiteSpace: 'normal'
      //         }}>
      //         {value}
      //       </span>
      //     );
      //   }
      // }
      // {
      //   Header: 'Action',
      //   accessor: '',
      //   Cell: ({ row }) => {
      //     let l = row.original;
      //     return (
      //       <Link to={`/app/settings-profile/user?userId=${l.ID}`}>
      //         <button className="btn btn-sm ">View</button>
      //       </Link>
      //     );
      //   }
      // }
    ],
    []
  );

  const paymentHistoryColumns = useMemo(
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


                  console.log("Dex")
                  // setisEditModalOpen(true)
                  console.log({ l })
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


  const formikConfig = (selectedSupplier, isFromEdit = false) => {



    // console.log({ selectedSupplier })

    // console.log({ isAddPaymentOpen })

    // console.log(selectedSupplier.Admin_Fname)





    let validation = {
      SupplierName: Yup.string().required('Required'),
      PhoneNo: Yup.string()
        .matches(/^\d{11}$/, 'Phone number must be exactly 11 digits')
        .required('Phone number is required'),
      Email: Yup.string().email().required('Required')

    };


    let initialValues = {
      SupplierName: selectedSupplier.SupplierName || '',
      PhoneNo: selectedSupplier?.PhoneNo || '',
      Email: selectedSupplier?.Email || '',
    }





    if (isAddPaymentOpen) {


      validation = {
        OrderID: Yup.string().required('Required'),
        Date: Yup.string().required('Required'),
        Amount: Yup.string().required('Required'),
        Payment_Status: Yup.string().required('Required'),

        Payment_Method: Yup.string().required('Required')
      }
      initialValues = {
        OrderID: '',
        Amount: '',
        Payment_Status: '',
        Date: '',
        Payment_Method: '',
        Proof_Payment: '',
        SupplierID: selectedSupplier.SupplierID,
        SupplierName: selectedSupplier.SupplierName
      };
    }

    return {
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);


        // console.log({ isEditModalOpen })
        try {

          if (isFromEdit) {

            let res = await axios({
              method: 'POST',
              url: `supplier/edit/${selectedSupplier.SupplierID}`,
              data: values
            })
            document.getElementById('editSupplierModal').close();
            await fetchSuppliers();
            toast.success('Supplier successfully updated!', {
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
            return true;
          }

          if (isAddPaymentOpen) {



            if (!file) {
              setFieldError('Proof_Payment', 'Required')
            }


            const data = new FormData();


            // OrderID: '',
            // Amount: '',
            // Payment_Status: '',
            // Date: '',
            // Payment_Method: '',

            data.append('file', file);
            data.append('SupplierID', values.SupplierID);
            data.append('OrderID', values.OrderID);
            data.append('Payment_Status', values.Payment_Status);
            data.append('Date', values.Date);
            data.append('Payment_Method', values.Payment_Method);
            data.append('Amount', values.Amount);


            let res = await axios({
              // headers: {
              //   'content-type': 'multipart/form-data'
              // },
              method: 'POST',
              url: 'supplier/uploadFile',
              data
            });

            setisAddPaymentOpen(false)
            document.getElementById('createSupplierPayment').close();
            await fetchSuppliers();
            toast.success('Updated successfully!', {
              onClose: () => {
                setSubmitting(false);
                navigate('/app/suppliers');
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

            // console.log("dex")

            // let res = await axios({
            //   method: 'POST',
            //   url: 'user/viewTransactionHistory',
            //   data: { ...values, EmployeeID: selectedSupplier.EmployeeID }
            // })
            // setisEditModalOpen(false)
            // document.getElementById('viewTransactionHistory').close();
            // await fetchSuppliers();
            // toast.success('Updated successfully!', {
            //   onClose: () => {
            //     setSubmitting(false);
            //     navigate('/app/employees');
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

          } else {

            // console.log({ values })


            let res = await axios({
              method: 'POST',
              url: 'supplier/create',
              data: values
            })
            document.getElementById('addSupplier').close();
            await fetchSuppliers();
            toast.success('Supplier successfully added!', {
              onClose: () => {
                setSubmitting(false);
                navigate('/app/suppliers');
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
            users={users}
          />
        }>
        <div className="">
          <Table
            style={{ overflow: 'wrap' }}
            className="table-sm"
            columns={columns}
            data={(users || []).map(data => {
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



        <dialog id="addSupplier" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg">Fill Out Form</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold">Supplier Details</p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
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
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                        <InputText
                          isRequired
                          label="Supplier Name"
                          name="SupplierName"
                          type="text"
                          placeholder=""
                          value={values.SupplierName}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-1 ">


                        <InputText
                          isRequired
                          label="Phone Number"
                          name="PhoneNo"
                          type="text"
                          placeholder=""
                          value={values.PhoneNo}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-1 ">


                        <InputText
                          isRequired
                          label="Email"
                          name="Email"
                          type="text"
                          placeholder=""
                          value={values.Email}
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



        <dialog id="createSupplierPayment" className="modal">
          <div className="modal-box w-11/12 max-w-4xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {
                  setisAddPaymentOpen(false)
                }}>✕</button>
            </form>
            <h1 className="font-bold text-lg">Fill Out Form</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold text-buttonPrimary">Supplier Payment</p>
            {isAddPaymentOpen &&
              <div className="p-0 space-y-2 md:space-y-2 sm:p-0">
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
                    isSubmitting
                  }) => {


                    // console.log({ values })

                    return (
                      <Form className="">
                        {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                          <InputText
                            isRequired
                            label="Supplier ID"
                            name="SupplierID "
                            type="text"
                            placeholder=""
                            disabled
                            value={values.SupplierID}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />
                          <InputText
                            isRequired
                            label="Supplier Name"
                            name="SupplierName "
                            type="text"
                            placeholder=""
                            disabled
                            value={values.SupplierName}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                          <div className=''>
                            <Dropdown
                              isRequired
                              // icons={mdiAccount}
                              label="Inventory Order ID"
                              name="OrderID"
                              placeholder=""
                              value={values.OrderID}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={inventoryList}
                            />
                          </div>
                          <InputText
                            isRequired
                            label="Date"
                            name="Date"
                            type="date"
                            placeholder=""
                            value={values.Date}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />

                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 mt-4">


                          <InputText
                            isRequired
                            label="Amount of Payment"
                            name="Amount"
                            type="text"
                            placeholder=""
                            value={values.Amount}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />
                          <div className=''>
                            <Dropdown
                              isRequired
                              // icons={mdiAccount}
                              label="Payment Status"
                              name="Payment_Status"
                              placeholder=""
                              value={values.Payment_Status}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={[
                                { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
                                { value: 'OVERDUE', label: 'Overdue' },
                                { value: 'PAID', label: 'Paid' }
                              ]}
                            />
                          </div>

                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-1 ">
                          <RadioText
                            isRequired
                            // icons={mdiAccount}
                            label="Payment Method *"
                            name="Payment_Method"
                            placeholder=""
                            value={values.Payment_Method}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={[
                              { value: 'CASH', label: 'Cash' },
                              // { value: 'Cash', label: 'Cash' },
                              { value: 'BDO', label: 'BDO' },
                              { value: 'BPI', label: 'BPI' }
                            ]}
                          />


                        </div>

                        <InputText
                          isRequired
                          label="Proof of Payment"
                          name="Proof_Payment"
                          type="file"
                          accept="image/*"
                          placeholder=""
                          value={values.Proof_Payment}
                          onChange={(e) => {
                            let file = e.target.files[0];
                            setFile(file);
                            //setFieldValue('Proof_Payment', 'dex')
                            // console.log(file.name)
                            if (file) {
                              blah.src = URL.createObjectURL(file)
                            }

                          }}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <div class="flex justify-center items-center">
                          <img id="blah" src="img.jpg" alt="" preview className='object-cover h-48 w-96 ' />
                        </div>* All fields are required.
                        <button
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
                </Formik>
              </div>
            }</div>
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
            <h1 className="font-bold text-lg">Supplier Payment History</h1>
            <Table
              style={{ overflow: 'wrap' }}
              className="table-sm"
              columns={paymentHistoryColumns}
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

                    console.log("Dex")
                    let res = await axios({
                      method: 'put',
                      url: `/archive/supplier/${activeChildID}/SupplierID`,
                      data: {
                        activeChildID: activeChildID
                      }
                    });
                    fetchSuppliers();

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


        <dialog id="editSupplierModal" className="modal">
          <div className="modal-box">

            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setSelectedSupplier({})
                document.getElementById('editSupplierModal').close();
              }}

            >✕</button>

            <h1 className="font-bold text-lg">Edit Supplier Form</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold">Supplier Details</p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              {selectedSupplier.SupplierID &&
                <Formik {...formikConfig(selectedSupplier, true)}>
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


                    console.log({ values })

                    return (
                      <Form className="">
                        {/* <label
                className={`block mb-2 text-green-400 text-left font-bold`}>
                Child
              </label> */}
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                          <InputText
                            isRequired
                            label="Supplier Name"
                            name="SupplierName"
                            type="text"
                            placeholder=""
                            value={values.SupplierName}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />

                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-1 ">


                          <InputText
                            isRequired
                            label="Phone Number"
                            name="PhoneNo"
                            type="text"
                            placeholder=""
                            value={values.PhoneNo}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-1 ">


                          <InputText
                            isRequired
                            label="Email"
                            name="Email"
                            type="text"
                            placeholder=""
                            value={values.Email}
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
                </Formik>
              } </div>
          </div>
        </dialog>



      </TitleCard>
    )
  );
}

export default Transactions;
