import moment from 'moment';
import { useEffect, useState, useMemo, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import TitleCard from '../../components/Cards/TitleCard';
// import { RECENT_LoanApplication } from '../../utils/dummyData';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SearchBar from '../../components/Input/SearchBar';
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ViewColumnsIcon from '@heroicons/react/24/outline/EyeIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';

import PlayCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import {
  mdiAccount,
  mdiBallotOutline,
  mdiGithub,
  mdiMail,
  mdiUpload,
  mdiAccountPlusOutline,
  mdiPhone,
  mdiLock,
  mdiVanityLight,
  mdiLockOutline,
  mdiCalendarRange,
  mdiPhoneOutline,
  mdiMapMarker,
  mdiEmailCheckOutline,
  mdiAccountHeartOutline,
  mdiCashCheck,
  mdiAccountCreditCardOutline,
  mdiCreditCardOutline
} from '@mdi/js';
import 'react-tooltip/dist/react-tooltip.css'
// import Tooltip from 'react-tooltip';
import { Tooltip } from 'react-tooltip';
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
import TextAreaInput from '../../components/Input/TextAreaInput';
import Dropdown from '../../components/Input/Dropdown';
import Radio from '../../components/Input/Radio';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';

import { useDropzone } from "react-dropzone";
import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';

import { FaCheckCircle } from "react-icons/fa"; // Font Awesome icon


import LoanCalculator from "./loanCalculator";
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { formatAmount } from './../../features/dashboard/helpers/currencyFormat';


import { AppointmentForm } from './../../components/AppointmentForm';



// const Register = lazy(() => import('./../../pages/Register'));
const formatDateForDB = (date, timeOnly = false) => {
  if (!!timeOnly) {
    return format(new Date(date), 'hh:mm a'); // 'a' adds AM/PM
  } else {
    return format(new Date(date), 'MMMM dd, yyyy hh:mm a'); // e.g., "December 18, 2024 02:30 PM"
  }
};
const TopSideButtons = ({ removeFilter, applyFilter, applySearch, myAppointmentList }) => {
  const [filterParam, setFilterParam] = useState('');
  const [searchText, setSearchText] = useState('');

  const locationFilters = [''];
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  let isEnabled = loggedInUser.role === 'Patient';
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
      <div className="badge badge-neutral mr-2 px-4 p-4 bg-white text-blue-950">Total : {myAppointmentList.length}</div>

      {isEnabled && <button className="btn btn-outline bg-blue-700 text-white" onClick={() => document.getElementById('addAppointment').showModal()}>
        Add
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button>
      }

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

function LoanApplication() {


  // Define file handling logic
  const [files, setFiles] = useState({
    borrowerValidID: null,
    bankStatement: null,
    coMakersValidID: null,
  });

  const onDrop = (acceptedFiles, fieldName) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: acceptedFiles[0],
    }));
  };

  const dropzoneProps = (fieldName) => ({
    onDrop: (files) => onDrop(files, fieldName),
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const [file, setFile] = useState(null);
  const [faqList, setList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');
  const [selectedLoan, setselectedLoan] = useState({});
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();



  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);

  const [myAppointmentList, setAppointmentList] = useState([]);

  const prepareAddress = async () => {
    await regions().then(region => {

      console.log({ region })
      setRegions(
        region.map(r => {
          return {
            value: r.region_code,
            label: r.region_name
          };
        })
      );
    });
    // await regionByCode('01').then(region => console.log(region.region_name));
    await provinces().then(province => console.log(province));
    // await provincesByCode('01').then(province => console.log(province));
    // await provinceByName('Rizal').then(province =>
    //   console.log(province.province_code)
    // );
    await cities().then(city => console.log(city));
    await barangays().then(barangays => console.log(barangays));
  };

  const getAppointmentList = async () => {

    let res = await axios({
      method: 'POST',
      url: 'appointment/list',
      data: {

      }
    });
    let list = res.data.data;

    setAppointmentList(list)


  };

  useEffect(() => {


    prepareAddress();
    getAppointmentList()
    setIsLoaded(true);
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
    // setList(list);
  };

  const applyFilter = params => {
    let filteredfaqList = faqList.filter(t => {
      return t.address === params;
    });
    setList(filteredfaqList);
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
    setList(filteredUsers);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  // console.log(users);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: '',
        Cell: ({ row }) => {
          return <span className="">{row.index + 1}</span>;
        }
      },
      {
        Header: 'Appointment ID',
        accessor: 'appointment_id',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Patient Name',
        accessor: '',
        Cell: ({ row, value }) => {
          let details = row.original;
          return <span className="">{details.patient_first_name} {details.patient_last_name}</span>;
        }
      },
      {
        Header: 'Dentist Name',
        accessor: 'dentist_full_name',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Appointment Date',
        accessor: '',
        Cell: ({ row, value }) => {
          let details = row.original;

          console.log({ details })
          return <span className="">
            {formatDateForDB(details.start)} to {formatDateForDB(details.end, true)}
          </span>
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row, value }) => {
          return <StatusPill value={value} />;
        }
      },
      {
        Header: 'Remarks',
        accessor: 'remarks',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Action',
        accessor: '',
        Cell: ({ row }) => {
          let appointment = row.original;



          let isEnabled = loggedInUser.role !== 'Patient';

          const [isModalOpen, setIsModalOpen] = useState(false);

          const [isModalCancelOpen, seIsModalCancelOpen] = useState(false);


          const handleOpenModal = () => {
            setIsModalOpen(true);
          };

          const handleCloseModal = () => {
            setIsModalOpen(false);
          };


          const handleOpenCancelModal = () => {
            seIsModalCancelOpen(true);
          };

          const handleCloseCancelModal = () => {
            seIsModalCancelOpen(false);
          };



          const sendMessage = async ({ firstName, lastName, phoneNumber, status, date }) => {
            const message = `Dear ${firstName} ${lastName}, your appointment on ${date} has been ${status}!`;


            // URL encoding the message and phone number
            const url = `https://sadnsrmvis.com/hwebit_sms/index.php?cp_num=${encodeURIComponent(phoneNumber)}&message=${encodeURIComponent(message)}`;

            try {
              // Perform the request to the server
              const response = await fetch(url);
              const data = await response.json(); // Assuming the server returns JSON

              // Handle the server response
              if (response.ok) {
                //console.log('Message sent successfully:', data);
              } else {
                console.error('Error sending message:', data);
              }
            } catch (error) {
              console.error('Network error:', error);
            }
          };


          const handleConfirm = async (updateStatus) => {
            // Handle confirmation action here


            try {

              let res = await axios({
                method: 'put',
                url: `appointment/update`,
                data: { ...appointment, status: updateStatus }
              })


              await sendMessage({
                firstName: appointment.patient_first_name,
                lastName: appointment.patient_last_name,
                phoneNumber: appointment.phone_number,
                status: updateStatus,
                date: `${formatDateForDB(appointment.start)} to ${formatDateForDB(appointment.end, true)}`
              });



              await getAppointmentList();

              toast.success(`Updated Successfully`, {
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
              seIsModalCancelOpen(false)
            }

          };



          return (
            <div className="flex">

              {isEnabled && <button
                className="btn btn-outline btn-sm bg-base-500 mr-4"
                onClick={() => {

                  handleOpenModal()

                  console.log({ isModalOpen })
                  // setSelectedAppointment(appointment);
                  // document.getElementById('viewAppointment').showModal();
                }}
              >
                <i class="fa-solid fa-check text-gray-900"></i>


              </button>
              }
              <button
                className="btn btn-outline btn-sm bg-base-500"
                onClick={() => {
                  handleOpenCancelModal()
                  // setSelectedAppointment(appointment);
                  // document.getElementById('viewAppointment').showModal();
                }}
              >
                <i class="fa-solid fa-archive text-gray-900"></i>

              </button>
              {/* Optionally add more action buttons here */}

              {
                isModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="modal modal-open">
                      <div className="modal-box">
                        <h2 className="text-lg font-bold mb-4">Apppointment Acceptance</h2>
                        <p>Do you want to confirm this appointment?</p>

                        {/* <Register /> */}
                        <div className="modal-action">
                          <button className="btn" onClick={handleCloseModal}>
                            Cancel
                          </button>
                          <button className="btn btn-success text-white" onClick={() => {
                            handleConfirm('Scheduled')
                          }}>
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              {
                isModalCancelOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="modal modal-open">
                      <div className="modal-box">
                        <h2 className="text-lg font-bold mb-4">Apppointment Cancellation</h2>
                        <p>Do you want to cancel this appointment?</p>
                        <div className="modal-action">
                          <button className="btn" onClick={handleCloseCancelModal}>
                            Cancel
                          </button>
                          <button className="btn bg-red-500 text-white" onClick={() => {
                            handleConfirm('Cancelled')
                          }}>
                            Confirm Cancellation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }


            </div>
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
      fetchFaqList();
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


  const [currentStep, setCurrentStep] = useState(0);
  const formikConfig = () => {



    console.log({ currentStep })

    let PersonalInfoTabValidation = {};

    if (currentStep === 0) {
      PersonalInfoTabValidation = {
        loan_type: Yup.string()
          .required('Required'),
        first_name: Yup.string()
          .required('Required'),

        middle_name: Yup.string()
          .required('Required'),
        last_name: Yup.string()
          .required('Required'),
        // work: Yup.string()
        //   .required('Required'),
        address_region: Yup.string().required('Required field'),
        address_province: Yup.string().required('Required field'),
        address_city: Yup.string().required('Required field'),
        address_barangay: Yup.string().required('Required field'),
        // streetAddress: Yup.string().required('Required field'),
        residence_type: Yup.string()
          .required('Required')
      }
    }
    else if (currentStep === 1) {


      PersonalInfoTabValidation = {
        work_type: Yup.string().required('Work type is required'),
        position: Yup.string().required('Position is required'),
        status: Yup.string().required('Status is required'),
        agency_name: Yup.string().required('Agency name is required'),
        // school_name: Yup.string().when('position', {
        //   is: 'Teacher', // Conditional validation if position is 'Teacher'
        //   then: Yup.string().required('School name is required for teachers'),
        //   otherwise: Yup.string(),
        // }),
        pensioner: Yup.string().required('Please select if you are a pensioner'),
        // monthly_pension: Yup.number()
        //   .typeError('Monthly pension must be a number')
        //   .when('pensioner', {
        //     is: 'YES',
        //     then: Yup.number().required('Monthly pension amount is required'),
        //     otherwise: Yup.number().notRequired(),
        //   }),
        loan_type_specific: Yup.string().required('Loan type is required'),
        // proposed_loan_amount: Yup.number()
        //   .typeError('Loan amount must be a number')
        //   .required('Proposed loan amount is required'),
        installment_duration: Yup.string().required('Duration is required'),
        numberField: Yup.number().required('Number is required'),
        //   .required('Installment duration is required'),
        loan_security: Yup.string().required('Loan security (ATM/Passbook) is required')
      }
    }

    else if (currentStep === 3) {
      PersonalInfoTabValidation = {
        calculatorLoanAmmount: Yup.number().required('Required'),
        calculatorInterestRate: Yup.number().required('Required'),
        calculatorMonthsToPay: Yup.number().required('Required'),
      }
    }

    // else if (currentStep === 1) {

    //   console.log("DEx")
    //   PersonalInfoTabValidation = {
    //     borrowerValidID: Yup.string().required("Borrower's Valid ID is required"),
    //     bankStatement: Yup.string().required("Bank Statement is required"),
    //     coMakersValidID: Yup.string().required("Co-maker's Valid ID is required"),
    //   }
    // }




    return {
      initialValues: {

        "loan_type": "",
        "first_name": "",
        "middle_name": "",
        "last_name": "",
        "work": "",
        "address_region": "",
        "address_province": "",
        "address_city": "",
        "address_barangay": "",
        "residence_type": "",
        "work_type": "",
        "position": "",
        "status": "",
        "agency_name": "",
        "school_name": "",
        "pensioner": "",
        "monthly_pension": "",
        "loan_type_specific": "",
        "proposed_loan_amount": "",
        "installment_duration": "",
        "loan_security": "",
        "numberField": "",
        "borrowerValidID": null,
        "bankStatement": null,
        "coMakersValidID": null,


        calculatorLoanAmmount: 20000,
        calculatorInterestRate: 36,
        calculatorMonthsToPay: 6,
        calculatorTotalAmountToPay: 0,

      },
      validationSchema: Yup.object({
        ...PersonalInfoTabValidation

      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);

        console.log({ values })



        // console.log("dex submit")



        let res = await axios({
          method: 'post',
          url: `loan/create`,
          data: values
        })



        let loan_application_id = res.data.data.loan_application_id

        const formData = new FormData();
        formData.append('bankStatement', values.bankStatement); // Assuming values contains File objects
        formData.append('borrowerValidID', values.borrowerValidID);
        formData.append('coMakersValidID', values.coMakersValidID);
        formData.append('loan_application_id', loan_application_id);

        await axios({
          // headers: {
          //   'content-type': 'multipart/form-data'
          // },
          method: 'POST',
          url: 'loan/upload-files',
          data: formData
        });

        setSubmitting(false);

        resetForm();
        getAppointmentList();
        document.getElementById('addAppointment').close();

        toast.success('Successfully created!', {
          onClose: () => {

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

        return true

        if (currentStep === 2) {

        }
        try {

          if (selectedLoan.question) {
            let res = await axios({
              method: 'put',
              url: `faq/${selectedLoan.id}`,
              data: values
            })
            document.getElementById('editFaq').close();
            await fetchFaqList();
            resetForm();
            toast.success('Successfully updated!', {
              onClose: () => {

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
              url: 'faq/create',
              data: values
            })
            document.getElementById('addAppointment').close();
            await fetchFaqList();
            resetForm();
            toast.success('Successfully added!', {
              onClose: () => {

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


  const DropzoneArea = ({ fieldName, files, dropzoneProps, setFieldValue, errors }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      ...dropzoneProps,
      onDrop: (acceptedFiles) => {

        setFieldValue(fieldName, acceptedFiles[0]);
        if (acceptedFiles.length > 0) {
          // Update files state with the new file
          setFiles((prevFiles) => ({
            ...prevFiles,
            [fieldName]: acceptedFiles[0],
          }));
        }
      },
    });


    let hasError = errors[fieldName];
    return (
      <div
        {...getRootProps()}
        className={`flex justify-center items-center w-full h-32 p-4 border-2 
       
          ${isDragActive ? "border-blue-500" : "border-gray-300"
          } border-dashed rounded-md text-sm cursor-pointer`}
      >
        <input {...getInputProps()} />
        <div>
          {files[fieldName] ? (
            <p className="text-gray-700">
              {files[fieldName].name} <span className="text-green-500">(Selected)</span>
            </p>
          ) : (
            <p className="text-gray-500">
              Drag and drop a file here, or click to select a file.
            </p>
          )}
        </div>
      </div>
    );
  };



  return (

    <TitleCard
      title="List"
      topMargin="mt-2"
      TopSideButtons={
        <TopSideButtons
          applySearch={applySearch}
          applyFilter={applyFilter}
          removeFilter={removeFilter}
          myAppointmentList={myAppointmentList}
        />
      }>
      <div className="">

        <dialog id="addAppointment" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg  p-4 
 bg-gradient-to-r from-gray-200 to-gray-300
      z-10 text-blue-950 border bg-white
             rounded">New Appointments</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="">
              <AppointmentForm
                getAppointmentList={getAppointmentList} />

            </div>
          </div>
        </dialog >


        <dialog id="viewLoan" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">

            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setselectedLoan({})
                document.getElementById("viewLoan").close()
              }}


            >✕</button>

            <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-gray-200 to-gray-300
      z-10 text-blue-950 border bg-white text-blue-950  rounded-t-lg">
              <h1 className="text-xl font-bold">Loan Details</h1>

            </div>

            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <StatusPill value={selectedLoan.loan_status} />
              {selectedLoan.loan_application_id && <Formik
                initialValues={{
                  calculatorLoanAmmount: parseFloat(selectedLoan.loan_amount),
                  calculatorInterestRate: parseFloat(selectedLoan.interest_rate),
                  calculatorMonthsToPay: parseFloat(selectedLoan.repayment_schedule_id),

                }}
              >
                {({
                  validateForm,
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

                  console.log({ values })


                  return <LoanCalculator
                    isReadOnly={true}
                    values={values}
                    setFieldValue={setFieldValue}
                    handleBlur={handleBlur}
                    calculatorLoanAmmount={values.calculatorLoanAmmount}
                    calculatorInterestRate={values.calculatorInterestRate}
                    calculatorMonthsToPay={values.calculatorMonthsToPay}
                    calculatorTotalAmountToPay={values.calculatorTotalAmountToPay}
                  />


                }}</Formik>
              }

            </div>
          </div>
        </dialog >
        <Table
          style={{ overflow: 'wrap' }}
          className="table-sm"
          columns={columns}
          data={(myAppointmentList || []).map(data => {
            return {
              ...data

            };
          })}
          searchField="lastName"
        />
      </div >

      <ToastContainer />









    </TitleCard >

  );
}

export default LoanApplication;
