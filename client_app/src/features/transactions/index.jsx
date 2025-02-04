import moment from 'moment';
import { useEffect, useState, useMemo, useRef, lazy } from 'react';
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

const Register = lazy(() => import('./../../pages/Register'));

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
      <div className="badge badge-neutral mr-2 px-4 p-4 bg-white text-blue-950">Total: {users.length}</div>
      {/* 
      <button className="btn btn-outline" onClick={() => document.getElementById('addCustomer').showModal()}>
        
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button> */}

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
      method: 'get',
      url: 'user/patients/all',
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

    // //console.log({ list });
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

  // //console.log(users);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const columns = useMemo(
    () => [
      {
        Header: 'Patient ID',
        accessor: 'patient_id',
        Cell: ({ value }) => <span>{value}</span>,
      },
      {
        Header: 'Full Name',
        accessor: 'full_name',
        Cell: ({ value, row }) => {

          let item = row.original;
          let fullName = `${item.patient_first_name} ${item.patient_last_name}`
          return <div className="font-bold text-neutral-500">{value || fullName}</div>;
        }
      },
      {
        Header: 'Email',
        accessor: 'email',
        Cell: ({ value }) => (
          <div className="text-blue-900 font-bold">
            <a href={`mailto:${value}`} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          </div>
        ),
      },
      {
        Header: 'Phone Number',
        accessor: 'phone_number',
        Cell: ({ value }) => (
          <div className="font-bold text-neutral-500">{value}</div>
        ),
      },
      {
        Header: 'Address',
        accessor: 'address',
        Cell: ({ row }) => {
          const { address, address_region, address_province, address_city, address_or_location } =
            row.original;
          return (
            <div className="text-neutral-500">
              <p>{address}</p>
              <p>
                {address_city}, {address_province}, {address_region}
              </p>
              <p>{address_or_location}</p>
            </div>
          );
        },
      },
      {
        Header: 'Date of Birth',
        accessor: 'date_of_birth',
        Cell: ({ value }) => {
          const formattedDate = value
            ? format(new Date(value), 'MMM dd, yyyy')
            : 'N/A';
          return <div className="font-bold text-neutral-500">{formattedDate}</div>;
        },
      },
      {
        Header: 'Age',
        accessor: 'age',
        Cell: ({ value }) => <div className="font-bold text-neutral-500">{value}</div>,
      },
      {
        Header: 'Gender',
        accessor: 'gender',
        Cell: ({ value }) => (
          <div className="font-bold text-neutral-500">{value}</div>
        ),
      },
      {
        Header: 'Medical History',
        accessor: 'medical_history',
        Cell: ({ value }) => (
          <div className="text-neutral-500">{value || 'None'}</div>
        ),
      },
      {
        Header: 'Actions',
        accessor: '',
        Cell: ({ row }) => {
          const patient = row.original;


          const [isModalOpen, setIsModalOpen] = useState(false);

          const handleConfirm = async (updateStatus) => {
            // Handle confirmation action here


            try {

              // let res = await axios({
              //   method: 'put',
              //   url: `appointment/update`,
              //   data: { ...appointment, status: updateStatus }
              // })


              // await getAppointmentList();

              toast.success(`Deleted Successfully`, {
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
              console.log(error)
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
              console.log('Confirmed!');
              setIsModalOpen(false);

            }

          };


          const [isOpen, setIsOpen] = useState(false);

          const toggleModal = () => {

            console.log("Dex")
            setIsOpen(!isOpen);
          };

          return (
            <div className="flex">

              <button
                className="btn btn-outline btn-sm ml-2"
                onClick={toggleModal}
              >
                <i className="fa-solid fa-edit"></i>
              </button>

              <button
                className="btn btn-outline btn-sm ml-2"

                onClick={() => {

                  setIsModalOpen(true)
                  // setSelectedAppointment(appointment);
                  // document.getElementById('viewAppointment').showModal();
                }}


              >
                <i className="fa-solid fa-trash"></i>
              </button>
              {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white w-11/12 lg:w-3/4 xl:w-2/3 p-6 rounded-lg shadow-lg overflow-y-auto max-h-screen">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center border-b pb-3">
                      <h2 className="text-xl font-semibold">Patient Details</h2>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={toggleModal}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="mt-4">
                      <Register

                        isFromUpdateProfile={true}
                        patientId={patient}

                      />
                    </div>

                    {/* Modal Footer */}
                    {/* <div className="flex justify-end mt-6">
                      <button
                        className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700 mr-2"
                        onClick={toggleModal}
                      >
                        Cancel
                      </button>
                      <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
                        Confirm
                      </button>
                    </div> */}
                  </div>
                </div>
              )}

              {
                isModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="modal modal-open">
                      <div className="modal-box">
                        <h2 className="text-lg font-bold mb-4">Delete Patient</h2>
                        <p>Do you want to delete this patient?</p>
                        <div className="modal-action">
                          <button className="btn" onClick={() => {
                            setIsModalOpen(false)
                          }}>
                            Cancel
                          </button>
                          <button className="btn btn-success bg-red-500 text-white" onClick={() => {
                            handleConfirm()
                          }}>
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }


            </div>
          );
        },
      },
    ],
    []
  );


  const handleOnChange = e => {
    //console.log(e.target.files[0]);
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
          //console.log({ error });
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
          //console.log({ error });
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
