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
import { QRCodeSVG } from 'qrcode.react';
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
      <div className="badge badge-neutral mr-2 px-2 p-4">Total Customers: {users.length}</div>

      <button className="btn btn-outline btn-sm" onClick={() => document.getElementById('addCustomer').showModal()}>
        Add Customer
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
  const [file, setFile] = useState(null);
  const [users, setUser] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');
  const [viewedUser, setviewedUser] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fetchUsers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getCustomerList',
      data: {

      }
    });

    let list = res.data.data;
    setUser(list);
  };
  useEffect(() => {
    dispatch(getFeatureList()).then(result => {
      fetchUsers();
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
        Header: 'Customer ID',
        accessor: '',
        Cell: ({ row }) => {
          return <span className="">{row.index + 1}</span>;
        }
      },
      {
        Header: 'QR Code',
        accessor: '',
        Cell: ({ row }) => {
          const url = `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/myprofile/${row.original.CustomerID}`;
          console.log({ row: url })

          return <div>
            <div
              ref={qrCodeRef}
              onClick={() => {
                downloadQRCode()
              }}
              className=' flex justify-center items-center mt-4 h-20 w-20'>
              <QRCodeSVG value={
                url
              } />,
            </div>
            <button
              // type="button"
              className='btn btn-sm mt-2'
              size="sm"
              type="submit"
              onClick={() => {
                downloadQRCode()
              }}
            >
              Download
            </button>
          </div>
        }
      },
      {
        Header: 'Name',
        accessor: 'CustomerName',

        Cell: ({ row, value }) => {
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
        Header: 'Facebook Link',
        accessor: 'Facebook',

        Cell: ({ row, value }) => {
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
        Header: 'Contact',
        accessor: 'Contact',

        Cell: ({ row, value }) => {
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
        Header: 'Address',
        accessor: 'Address',

        Cell: ({ row, value }) => {
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



          console.log({ value })
          return (
            <div className="flex items-center space-x-3">

              {
                (!value || value !== 'undefined undefined') && <div>
                  <div className="font-bold text-neutral-500">{value}</div>
                </div>
              }

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
                {/* <Link to={`/app/settings-profile/user?userId=${l.ID}`}>
                  <button className="btn btn-outline btn-sm">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                </Link> */}
                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {
                    setactiveChildID(l.CustomerID);
                    document.getElementById('deleteModal').showModal();
                  }}>
                  <i class="fa-solid fa-archive"></i>
                </button>
                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {
                    setactiveChildID(l.CustomerID);
                    setviewedUser(l)
                    document.getElementById('updateCustomer').showModal();
                  }}>
                  <i class="fa-solid fa-edit"></i>
                </button>
                <Link to={`/app/userProfile/${l.CustomerID}`}>
                  <button
                    className="btn btn-outline btn-sm ml-2"
                    onClick={() => {
                      setactiveChildID(l.CustomerID);
                      // document.getElementById('updateCustomer').showModal();
                    }}>
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </Link>
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
      fetchUsers();
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
          await fetchUsers();
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
          console.log({ error });
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
          await fetchUsers();
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
          console.log({ error });
        } finally {
        }
      }
    };
  };

  return (
    isLoaded && (
      <TitleCard
        title="Customer List"
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
        <form onSubmit={handleSubmit}>
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
                      url: `/archive/customer_record/${activeChildID}/CustomerID`,
                      data: {
                        activeChildID: activeChildID
                      }
                    });
                    fetchUsers()
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

        <dialog id="addCustomer" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg">Fill Out Form</h1>
            <p className="text-sm text-gray-500 mt-1">Customer Details</p>
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
                  isSubmitting
                }) => {
                  const checkValidateTab = () => {
                    // submitForm();
                  };
                  const errorMessages = () => {
                    // you can add alert or console.log or any thing you want
                    alert('Please fill in the required fields');
                  };

                  return (
                    <Form className="">
                      {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                        <InputText
                          isRequired
                          label="Full Name"
                          name="CustomerName"
                          type="text"
                          placeholder=""
                          value={values.CustomerName}
                          onBlur={handleBlur} // This apparently updates `touched`?
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
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          isRequired
                          label="Contact Number"
                          name="Contact"
                          type="text"
                          placeholder=""
                          value={values.Contact}
                          onBlur={handleBlur} // This apparently updates `touched`?
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
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                      </div>
                      * All fields are required.
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
              </Formik> </div>
          </div>
        </dialog>


        <dialog id="updateCustomer" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg">Update</h1>
            {/* <p className="text-sm text-gray-500 mt-1">Customer Details</p> */}
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              {viewedUser.CustomerName && <Formik {...formikConfigUpdate(viewedUser)}>
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
                  const checkValidateTab = () => {
                    // submitForm();
                  };
                  const errorMessages = () => {
                    // you can add alert or console.log or any thing you want
                    alert('Please fill in the required fields');
                  };

                  return (
                    <Form className="">
                      {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                        <InputText
                          isRequired
                          label="Full Name"
                          name="CustomerName"
                          type="text"
                          placeholder=""
                          value={values.CustomerName}
                          onBlur={handleBlur} // This apparently updates `touched`?
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
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          isRequired
                          label="Contact Number"
                          name="Contact"
                          type="text"
                          placeholder=""
                          value={values.Contact}
                          onBlur={handleBlur} // This apparently updates `touched`?
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
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                      </div>
                      <button
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
              </Formik>} </div>
          </div>
        </dialog>

      </TitleCard>
    )
  );
}

export default Transactions;
