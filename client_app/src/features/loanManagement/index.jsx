import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';
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

import { formatAmount } from '../dashboard/helpers/currencyFormat';
const TopSideButtons = ({ removeFilter, applyFilter, applySearch, faqList }) => {
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
      {/* <div className="badge badge-neutral mr-2 px-2 p-4 text-blue-950 px-2 py-4 bg-white">Total : {faqList.length}</div> */}

      <button className="btn btn-outline bg-customBlue text-white" onClick={() => document.getElementById('addLoan').showModal()}>
        Add
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

  const [myLoanList, setLoanList] = useState([]);

  const prepareAddress = async () => {
    await regions().then(region => {

      //console.log({ region })
      setRegions(
        region.map(r => {
          return {
            value: r.region_code,
            label: r.region_name
          };
        })
      );
    });
    // await regionByCode('01').then(region => //console.log(region.region_name));
    await provinces();
    await provincesByCode('01');
    await provinceByName('Rizal');
    await cities().then(city => console.log(city));
    await barangays().then(barangays => console.log(barangays));
  };

  const loanList = async () => {

    let res = await axios({
      method: 'POST',
      url: 'admin/loan/list',
      data: {

      }
    });
    let list = res.data.data;

    setLoanList(list)


  };

  useEffect(() => {


    prepareAddress();
    loanList()
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

    // //console.log({ list });
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

  // //console.log(users);
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
        Header: 'Type',
        accessor: 'loan_type_value',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Loan Amount',
        accessor: 'loan_amount',
        Cell: ({ row, value }) => {
          return <span className="">{formatAmount(value)}</span>;
        }
      },
      {
        Header: 'Interest Rate',
        accessor: 'interest_rate',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Months To Pay',
        accessor: 'repayment_schedule_id',
        Cell: ({ row, value }) => {
          return <span className="">{value} Months</span>;
        }
      },
      {
        Header: 'Date Created',
        accessor: 'application_date',
        Cell: ({ row, value }) => {
          return <span className="">

            {value &&
              format(value, 'MMM dd, yyyy hh:mm a')}

          </span>;
        }
      },
      {
        Header: 'Date Approved',
        accessor: 'approval_date',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Status',
        accessor: 'loan_status',
        Cell: ({ row, value }) => {
          return <StatusPill value={value} />



        }
      },


      {
        Header: 'Action',
        accessor: '',
        Cell: ({ row }) => {
          let loan = row.original;



          return (
            (
              <div className="flex">

                <button className="btn btn-outline btn-sm" onClick={() => {

                  // setisEditModalOpen(true)
                  // setselectedLoan(loan);

                  // document.getElementById('viewLoan').showModal();

                  navigate(`/app/loan_details/${loan.loan_application_id}`);

                  // setFieldValue('Admin_Fname', 'dex');
                }}>
                  <i class="fa-solid fa-eye"></i>
                </button>

                {/* <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {


                    setactiveChildID(l.id);

                  }}>
                  <i class="fa-solid fa-archive"></i>
                </button> */}
              </div>
            )
          );
        }
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



    //console.log({ currentStep })

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

    //   //console.log("DEx")
    //   PersonalInfoTabValidation = {
    //     borrowerValidID: Yup.string().required("Borrower's Valid ID is required"),
    //     bankStatement: Yup.string().required("Bank Statement is required"),
    //     coMakersValidID: Yup.string().required("Co-maker's Valid ID is required"),
    //   }
    // }




    return {
      initialValues: {
        "loan_type": "GOVERNMENT AND PRIVATE EMPLOYEES LOAN",
        "first_name": "Dexter",
        "middle_name": "Bequillo",
        "last_name": "Miranda",
        "work": "",
        "address_region": "05",
        "address_province": "0505",
        "address_city": "050506",
        "address_barangay": "050506062",
        "residence_type": "OWN",
        "work_type": "Private Employee",
        "position": "Programmer",
        "status": "Working",
        "agency_name": "None",
        "school_name": "",
        "pensioner": "NO",
        "monthly_pension": "",
        "loan_type_specific": "OTHERS",
        "proposed_loan_amount": 20000,
        "installment_duration": "1",
        "loan_security": "BDO-123",
        "numberField": 1,
        "borrowerValidID": {
          "path": "./BANBAN ENTRANCE.jpg",
          "relativePath": "./BANBAN ENTRANCE.jpg"
        },
        "bankStatement": {
          "path": "./EAST-VALENCIA Entrance.jpg",
          "relativePath": "./EAST-VALENCIA Entrance.jpg"
        },
        "coMakersValidID": {
          "path": "./OLD Poblacion Entrance.jpg",
          "relativePath": "./OLD Poblacion Entrance.jpg"
        },
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

        //console.log({ values })



        // //console.log("dex submit")



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
        loanList();
        document.getElementById('addLoan').close();

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
            document.getElementById('addLoan').close();
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
          //console.log({ error });
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
          faqList={faqList}
        />
      }>
      <div className="">

        <dialog id="addLoan" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg  p-4 bg-gradient-to-r from-gray-200 to-gray-300
      z-10 text-blue-950 border bg-white
             text-white rounded-lg">New Appointment</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <Formik {...formikConfig()}>
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

                  const PersonalInfo = useMemo(() => (
                    <div>
                      <Form className="">

                        <Radio
                          isRequired
                          label="Loan Type"
                          name="loan_type" // This should be "loan_type"
                          value={values.loan_type}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={[
                            { value: 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN', label: 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN' },
                            { value: 'NON-EMPLOYEE LOAN', label: 'NON-EMPLOYEE LOAN' }
                          ]}
                        />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                          <InputText
                            isRequired
                            placeholder=""
                            label="Given Name"
                            name="first_name"
                            type="text"
                            value={values.first_name} // Bind value to Formik state
                            onBlur={handleBlur}
                            onChange={(e) => {

                              //console.log(e.target.value)
                              setFieldValue('first_name', e.target.value); // Use the input value
                            }}
                          />
                          <InputText
                            isRequired
                            placeholder=""
                            label="Middle Name"
                            name="middle_name"
                            type="middle_name"

                            value={values.middle_name}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />
                          <InputText
                            isRequired
                            placeholder=""
                            label="Last Name"
                            name="last_name"
                            type="last_name"

                            value={values.last_name}
                            onBlur={handleBlur} // This apparently updates `touched`?
                          />

                        </div>

                        <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-4 ">
                          <Dropdown
                            className="z-50"

                            label="Region"
                            name="address_region"
                            value={values.address_region}

                            onBlur={handleBlur}
                            options={addressRegions}
                            affectedInput="address_province"
                            allValues={values}
                            setFieldValue={setFieldValue}
                            functionToCalled={async regionCode => {
                              if (regionCode) {
                                setFieldValue('address_province', '');
                                await provincesByCode(regionCode).then(
                                  province => {
                                    setProvince(
                                      province.map(p => {
                                        return {
                                          value: p.province_code,
                                          label: p.province_name
                                        };
                                      })
                                    );
                                  }
                                );
                              }
                            }}
                          />

                          <Dropdown
                            className="z-50"

                            label="Province"
                            name="address_province"
                            value={values.address_province}
                            d
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={addressProvince}
                            affectedInput="address_city"
                            functionToCalled={async code => {
                              if (code) {
                                await cities(code).then(cities => {
                                  setCity(
                                    cities.map(p => {
                                      return {
                                        value: p.city_code,
                                        label: p.city_name
                                      };
                                    })
                                  );
                                });
                              }
                            }}
                          />
                          <Dropdown
                            className="z-50"

                            label="City"
                            name="address_city"
                            // value={values.civilStatus}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={addressCity}
                            affectedInput="address_barangay"
                            functionToCalled={async code => {
                              if (code) {
                                await barangays(code).then(cities => {
                                  setBarangay(
                                    cities.map(p => {
                                      //console.log({ p });
                                      return {
                                        value: p.brgy_code,
                                        label: p.brgy_name
                                      };
                                    })
                                  );
                                });
                              }
                            }}
                          />
                          <Dropdown
                            className="z-50"

                            label="Barangay"
                            name="address_barangay"
                            value={values.address_barangay}

                            onBlur={handleBlur}
                            options={addressBarangay}
                            affectedInput=""
                            functionToCalled={async code => { }}
                            setFieldValue={setFieldValue}
                          />
                        </div>
                        <Radio
                          setFieldValue={setFieldValue}
                          label="Residence Type"
                          name="residence_type"
                          placeholder=""
                          value={values.residence_type}

                          onBlur={handleBlur}
                          options={[
                            {
                              name: 'OWN',
                              displayName: 'Own'
                            }, {
                              name: 'RENT',
                              displayName: 'Rent'
                            }].map(val => {
                              return {
                                value: val.name,
                                label: val.displayName
                              };
                            })}
                        />
                      </Form>
                    </div>
                  ), [currentStep, errors, values, addressRegions, addressProvince, addressCity, addressBarangay]);


                  const AccountDetails = useMemo(() => (
                    <div>


                      <Form className="">
                        {values.loan_type === 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN' && <div>
                          <div class="flex justify-center items-center">
                            <h1 class="text-center">{values.loan_type}</h1>
                          </div>
                          <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">

                            <Dropdown
                              // icons={mdiAccount}
                              label="Work Type"
                              name="work_type"
                              placeholder=""
                              value={values.work_type}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={[
                                {
                                  name: 'Private Employee',
                                  displayName: 'Private Employee'
                                }, {
                                  name: 'Public Employee',
                                  displayName: 'Public Employee'
                                }].map(val => {
                                  return {
                                    value: val.name,
                                    label: val.displayName
                                  };
                                })}

                            />


                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Position"
                              name="position"
                              type="position"

                              value={values.position}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Status"
                              name="status"
                              type="status"

                              value={values.status}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Agency Name"
                              name="agency_name"
                              type="agency_name"

                              value={values.agency_name}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="If a teacher, name of school presently assigned"
                              name="name_of_school"
                              type="name_of_school"

                              value={values.name_of_school}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>

                          <div className="mt-4 z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <div className='mt-2'>
                              <Dropdown
                                // icons={mdiAccount}
                                label="Pensioner"
                                name="pensioner"
                                placeholder=""
                                value={values.pensioner}
                                setFieldValue={setFieldValue}
                                onBlur={handleBlur}
                                options={[
                                  {
                                    name: 'YES',
                                    displayName: 'YES'
                                  }, {
                                    name: 'NO',
                                    displayName: 'NO'
                                  }].map(val => {
                                    return {
                                      value: val.name,
                                      label: val.displayName
                                    };
                                  })}

                              />

                            </div>


                            <InputText

                              isRequired
                              placeholder=""
                              label="Amount of Monthly Pension"
                              name="monthly_pension_amount"
                              type="number"

                              value={values.monthly_pension_amount}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                          <div className="mt-4 z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <div className='mt-2'>
                              <Dropdown
                                // icons={mdiAccount}
                                label="Type of Loan"
                                name="loan_type_specific"
                                placeholder=""
                                value={values.loan_type_specific}

                                onBlur={handleBlur}
                                setFieldValue={setFieldValue}
                                options={[
                                  {
                                    name: 'HOUSING LOAN',
                                    displayName: 'HOUSING LOAN'
                                  },
                                  {
                                    name: 'OTHERS',
                                    displayName: 'OTHERS'
                                  }].map(val => {
                                    return {
                                      value: val.name,
                                      label: val.displayName
                                    };
                                  })}

                              />

                            </div>


                            <InputText

                              isRequired
                              placeholder=""
                              label="Proposed loan amount"
                              name="proposed_loan_amount"
                              type="number"

                              value={values.proposed_loan_amount}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                          <div className="mt-4 z-50 grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <div className='mt-2'>
                              <Dropdown
                                // icons={mdiAccount}
                                label="Installment Duration (Months)"
                                name="installment_duration"
                                placeholder=""
                                value={values.installment_duration}
                                setFieldValue={setFieldValue}
                                onBlur={handleBlur}
                                options={[
                                  {
                                    name: '1',
                                    displayName: '1'
                                  },
                                ].map(val => {
                                  return {
                                    value: val.name,
                                    label: val.displayName
                                  };
                                })}

                              />

                            </div>


                            <InputText

                              isRequired
                              placeholder=""
                              label="No"
                              name="numberField"
                              type="number"

                              value={values.numberField}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-1 mt-2">
                            <InputText
                              isRequired
                              placeholder="ATM/Passbook number"
                              label="Loan Security"
                              name="loan_security"
                              type="text"

                              value={values.loan_security}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                        </div>
                        }

                        {values.loan_type !== 'GOVERNMENT AND PRIVATE EMPLOYEES LOAN' && <div>


                          <div class="flex justify-center items-center">
                            <h1 class="text-center">{values.loan_type}</h1>
                          </div>

                        </div>
                        }

                      </Form>
                    </div>
                  ), [currentStep, errors, values]);



                  const SupportingDocuments = () => {

                    let hasError1 = errors['borrowerValidID'];
                    let hasError2 = errors['bankStatement'];
                    let hasError3 = errors['coMakersValidID'];
                    return (
                      <div className="space-y-4">
                        {/* Borrower's Valid ID */}
                        <h1 className="font-bold text-lg text-center">Upload Supporting Documents</h1>
                        <div

                          className={`${hasError1 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                            }`}>


                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Borrower's Valid ID
                          </label>
                          <DropzoneArea
                            fieldName="borrowerValidID"
                            files={files}
                            dropzoneProps={dropzoneProps("borrowerValidID")}
                            setFieldValue={setFieldValue}
                            errors={errors}
                          />
                          {errors.borrowerValidID && <p className="text-red-500 text-sm mt-2">{errors.borrowerValidID}</p>}
                        </div>

                        {/* Bank Statement */}
                        <div

                          className={`${hasError2 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                            }`}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Statement
                          </label>
                          <DropzoneArea
                            fieldName="bankStatement"
                            files={files}
                            dropzoneProps={dropzoneProps("bankStatement")}
                            setFieldValue={setFieldValue}
                            errors={errors}
                          />
                          {errors.bankStatement && <p className="text-red-500 text-sm mt-2">{errors.bankStatement}</p>}
                        </div>

                        {/* Co-maker's Valid ID */}
                        <div

                          className={`${hasError2 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                            }`}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Co-maker's Valid ID
                          </label>
                          <DropzoneArea
                            fieldName="coMakersValidID"
                            files={files}
                            dropzoneProps={dropzoneProps("coMakersValidID")}
                            setFieldValue={setFieldValue}
                            errors={errors}
                          />

                          {errors.coMakersValidID && <p className="text-red-500 text-sm mt-2">{errors.coMakersValidID}</p>}
                        </div>

                        {/* Submit */}
                        {/* <button
                          type="button"
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => {
                            //console.log({ files })



                          }}
                        >
                          Submit
                        </button> */}
                      </div>
                    );

                  };






                  const Calculator = useMemo(() => (
                    <div>
                      <Form className="">
                        <LoanCalculator
                          values={values}
                          setFieldValue={setFieldValue}
                          handleBlur={handleBlur}
                          calculatorLoanAmmount={values.calculatorLoanAmmount}
                          calculatorInterestRate={values.calculatorInterestRate}
                          calculatorMonthsToPay={values.calculatorMonthsToPay}
                          calculatorTotalAmountToPay={values.calculatorTotalAmountToPay}
                        />
                      </Form>
                    </div>
                  ), [currentStep, errors, values]);


                  const Confirmation = () => {
                    const [isVisible, setIsVisible] = useState(true);
                    const [isChecked, setIsChecked] = useState(false);

                    const closeAlert = () => {
                      if (isChecked) {
                        setIsVisible(false);
                      } else {
                        alert("You must agree to the terms and conditions before proceeding.");
                      }
                    };
                    return <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">Note</h3>
                          <p className="mt-2">Collateral is required for bigger loan amount (such as land title, house and lot, and the likes)</p>
                        </div>
                        <button

                          className="text-yellow-700 hover:text-yellow-900 font-semibold"
                        >

                        </button>
                      </div>
                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={isChecked}
                          onChange={() => setIsChecked(!isChecked)}
                          className="h-5 w-5 text-blue-500"
                        />
                        <label htmlFor="terms" className="ml-2 text-smf text-gray-700">
                          I further certify that the cited information’s are the best of my knowledge tru, correct, and voluntary
                        </label>
                      </div>
                    </div>
                  }

                  const steps = [

                    {
                      label: 'Personal Information', content: () => {
                        return PersonalInfo
                      }
                    },
                    {
                      label: 'Work Details', content: () => {
                        return AccountDetails
                      }
                    },
                    {
                      label: 'Supporting Documents', content: () => {
                        return <SupportingDocuments />
                      }
                    },
                    {
                      label: 'Calculator', content: () => { return Calculator }
                    }
                  ];

                  const nextStep = async () => {

                    // setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                    // return true;
                    const formErrors = await validateForm();



                    //console.log({ currentStep })

                    if (currentStep === 2) {
                      const validateFields = (fields, setFieldError) => {
                        const fieldErrors = {
                          borrowerValidID: "Borrower's Valid ID is required",
                          bankStatement: "Bank Statement is required",
                          coMakersValidID: "Co-maker's Valid ID is required",
                        };

                        // Loop through fields to check and set errors
                        Object.keys(fieldErrors).forEach((field) => {
                          if (!fields[field]) {
                            setFieldError(field, fieldErrors[field]);
                          }
                        });
                      };


                      let { borrowerValidID, bankStatement, coMakersValidID } = values;
                      if (!borrowerValidID || !bankStatement || !coMakersValidID) {

                        validateFields({ borrowerValidID, bankStatement, coMakersValidID }, setFieldError);


                        return true


                      }
                      else {
                        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                      }
                    } else {
                      // Dynamically set errors using setFieldError
                      for (const [field, error] of Object.entries(formErrors)) {

                        setFieldTouched(field, true); // Mark field as touched
                        setFieldError(field, error); // Set error for each field dynamically
                      }

                      if (Object.keys(formErrors).length === 0) {
                        //  handleSubmit(); // Only proceed to next step if there are no errors
                        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                      }
                    }





                  };

                  const prevStep = () => {
                    setCurrentStep((prev) => Math.max(prev - 1, 0));
                  };

                  // const stepContent = useMemo(() => steps[currentStep].content(), [currentStep]);



                  return (
                    <div>
                      <div className="mt-4">
                        <div className="">
                          {/* Step Navigation Menu */}
                          <div className="flex justify-between mb-4">
                            {steps.map((step, index) => (
                              <div
                                key={index}
                                className={`cursor-pointer text-center flex-1 ${currentStep === index ? 'text-customBlue  font-bold' : 'text-gray-400'
                                  }`}
                                onClick={() => index <= currentStep && setCurrentStep(index)}
                              >
                                <span>{step.label}</span>
                                <div
                                  className={`mt-2 h-1 rounded ${currentStep === index ? 'bg-customBlue' : 'bg-transparent'
                                    }`}
                                />
                              </div>
                            ))}
                          </div>

                          {/* <h2 className="text-xl font-bold mb-4">{steps[currentStep].label}</h2> */}


                          {steps[currentStep].content()}
                          <div className="flex justify-between mt-4">
                            {currentStep > 0 && (
                              <button onClick={prevStep} className="btn  bg-gray-200 text-black">
                                Previous
                              </button>
                            )}
                            {currentStep < steps.length - 1 ? (
                              <button onClick={nextStep} className="btn btn-primary bg-buttonPrimary">
                                Next
                              </button>
                            ) : (
                              <button

                                onClick={handleSubmit}

                                disabled={isSubmitting}

                                className="btn btn-success bg-buttonPrimary text-white">

                                {isSubmitting ? (
                                  <span className="w-4 h-4 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mr-2"></span>

                                ) : (
                                  "" // Default text
                                )}
                                Submit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                }}
              </Formik> </div>
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

            <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
              <h1 className="text-xl font-semibold">Loan Details</h1>

            </div>

            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">

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

                  //console.log({ values })


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
          data={(myLoanList || []).map(data => {
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
