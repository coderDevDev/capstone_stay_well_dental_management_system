import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import TitleCard from '../../components/Cards/TitleCard';
// import { RECENT_LoanApplication } from '../../utils/dummyData';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SearchBar from '../../components/Input/SearchBar';
import { NavLink, Routes, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import 'react-tooltip/dist/react-tooltip.css'


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




// import LoanCalculator from "./../loanApplication/loanCalculator";
// import Image from 'next/image';
import {
  CheckCircle, XCircle, Info, AlertTriangle, Briefcase, Home, MapPin, School,
  Banknote, User, FileText, BanknoteIcon
} from 'lucide-react';




const Alert = ({ type = "info", title, description, onClose }) => {
  const typeStyles = {
    success: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    },
    error: {
      color: "bg-red-100 text-red-800",
      icon: <XCircle className="w-6 h-6 text-red-500" />,
    },
    info: {
      color: "bg-blue-100 text-blue-800",
      icon: <Info className="w-6 h-6 text-blue-500" />,
    },
    warning: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    },
  };

  const { color, icon } = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`flex items-center p-4 rounded-md shadow-md ${color} border-l-4`}
    >
      {/* Icon */}
      <div className="mr-4">{icon}</div>

      {/* Content */}
      <div className="flex-1">
        {title && <h3 className="font-bold">{title}</h3>}
        {description && <p className="text-sm mt-4">{description}</p>}
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onClose}
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};




function LoanManagementTabs({ loanDetails, formikProps }) {




  const [activeTab, setActiveTab] = useState("user-details");
  const [selectedImage, setSelectedImage] = useState('');

  const userDetails = loanDetails;



  const documents = [
    { src: loanDetails.borrowers_valid_id, label: 'Borrowers Valid ID' },
    {
      src: loanDetails.co_makers_valid_id, label: 'Co-Maker Valid ID'
    },
    { src: loanDetails.bank_statement, label: 'Bank Statement' },
  ];

  // const loanDetails = {
  //   amount: '$50,000',
  //   term: '5 years',
  //   interestRate: '3.5%',
  //   monthlyPayment: '$909.66',
  //   totalInterest: '$4,579.60',
  // };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="grid w-full grid-cols-3 bg-gray-100">
          {[
            { key: "user-details", label: "User Details", icon: <User className="w-4 h-4 mr-2" /> },
            { key: "uploaded-documents", label: "Uploaded Documents", icon: <FileText className="w-4 h-4 mr-2" /> },
            { key: "loan-details", label: "Loan Details", icon: <BanknoteIcon className="w-4 h-4 mr-2" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center py-2 text-center ${activeTab === tab.key ? "bg-customBlue text-white font-bold" : "bg-gray-100"
                }`}
            >
              {tab.icon}
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "user-details" && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Section title="Personal Information">
                <InfoGrid>
                  <InfoItem label="Full Name" value={`${userDetails.first_name} ${userDetails.middle_name} ${userDetails.last_name}`} />
                  <InfoItem label="Age" value={userDetails.age} />
                  <InfoItem label="Gender" value={userDetails.gender} />
                  <InfoItem label="Date of Birth" value={new Date(userDetails.date_of_birth).toLocaleDateString()} />
                  <InfoItem label="Contact Number" value={userDetails.contact_number} />
                  <InfoItem label="Email" value={userDetails.email} />
                  <InfoItem label="Nationality" value={userDetails.nationality} />
                  <InfoItem label="Religion" value={userDetails.religion} />
                </InfoGrid>
              </Section>

              {/* Address Information */}
              <Section title="Address Information" icon={<MapPin className="w-5 h-5 mr-2" />}>
                <InfoGrid>
                  <InfoItem label="Street" value={userDetails.street} />
                  <InfoItem label="Province" value={userDetails.province} />
                  <InfoItem label="Municipality" value={userDetails.municipality} />
                  <InfoItem label="Barangay" value={userDetails.barangay} />
                  <InfoItem label="Zip Code" value={userDetails.zip_code} />
                </InfoGrid>
              </Section>

              {/* Employment Information */}
              <Section title="Employment Information" icon={<Briefcase className="w-5 h-5 mr-2" />}>
                <InfoGrid>
                  <InfoItem label="Employment Status" value={userDetails.employment_status} />
                  <InfoItem label="Monthly Income" value={`₱${parseFloat(userDetails.monthly_income).toLocaleString()}`} />
                  <InfoItem label="Credit Score" value={userDetails.credit_score} />
                </InfoGrid>
              </Section>

              {/* Loan Information */}
              {/* <Section title="Loan Information" icon={<Banknote className="w-5 h-5 mr-2" />}>
                <InfoGrid>
                  <InfoItem label="Appointment ID" value={userDetails.loan_application_id} />
                  <InfoItem label="Loan Type" value={userDetails.loan_type_value} />
                  <InfoItem label="Loan Amount" value={`₱${parseFloat(userDetails.loan_amount).toLocaleString()}`} />
                  <InfoItem label="Interest Rate" value={`${userDetails.interest_rate}%`} />
                  <InfoItem label="Loan Status" value={userDetails.loan_status} />
                  <InfoItem label="Application Date" value={new Date(userDetails.application_date).toLocaleDateString()} />
                  {userDetails.approval_date && (
                    <InfoItem label="Approval Date" value={new Date(userDetails.approval_date).toLocaleDateString()} />
                  )}
                  <InfoItem label="Purpose" value={userDetails.purpose} />
                </InfoGrid>
              </Section> */}


            </div>
          )}

          {activeTab === "uploaded-documents" && (
            <Section title="Uploaded Documents">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents.map((doc, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => setSelectedImage(doc.src)}
                    >
                      <img
                        src={doc.src}
                        alt={doc.label}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="mt-2 text-sm text-gray-600">{doc.label}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {activeTab === "loan-details" && (
            <Section title="Loan Details">

              <LoanCalculator
                {...formikProps}
                isReadOnly={true}
                calculatorLoanAmmount={formikProps.values.calculatorLoanAmmount}
                calculatorInterestRate={formikProps.values.calculatorInterestRate}
                calculatorMonthsToPay={formikProps.values.calculatorMonthsToPay}
              />
              {/* <div className="space-y-3">
                {Object.entries(loanDetails).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className="w-40 text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="text-gray-800 font-medium">{value}</span>
                  </div>
                ))}
              </div> */}
            </Section>
          )}
        </div>
      </div>
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageSrc={selectedImage}
        />
      )}
    </div>
  );
}

function Section({ title, children, icon }) {
  return (
    <section>
      <h3 className="text-2xl font-bold mb-4 flex items-center text-gray-700">
        {icon}
        {title}
      </h3>
      <hr className="border-gray-300 mb-4" />
      {children}
    </section>
  );
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex items-center">
      {icon}
      <span className="font-medium mr-2">{label}:</span>
      <span>{value || 'N/A'}</span>
    </div>
  );
}

function ImageModal({ isOpen, onClose, imageSrc }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white-600 hover:text-white-900 text-blue-700"
        >
          ✖
        </button>
        <img src={imageSrc} alt="Document" className="max-w-full max-h-[80vh] mt-4" />
      </div>
    </div>
  );
}


const TopSideButtons = ({ removeFilter, applyFilter, applySearch,
  faqList, formikProps }) => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleButtonClick = (action) => {

    if (action === "approve") {
      formikProps.setFieldValue('status', 'Approved')
    } else {
      formikProps.setFieldValue('status', 'Rejected')
    }
    setModalMessage(
      action === "approve"
        ? "Are you sure you want to approve this loan?"
        : "Are you sure you want to decline this loan?"
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  return (
    <div className="inline-block float-right">


      <div className="flex space-x-4">
        {/* Approve Button */}
        <button
          className="btn flex items-center font-bold text-white bg-customBlue rounded-md 
      "
          onClick={() => {
            // handleButtonClick("approve")
            formikProps.setFieldValue('status', 'Approved')
            document.getElementById('confirmationModal').showModal()
          }}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Approve
        </button>

        {/* Decline Button */}
        <button
          className="btn items-center px-4 py-2 font-bold text-white bg-red-500 rounded-md 
          "
          onClick={() => {
            // handleButtonClick("decline") 
            formikProps.setFieldValue('status', 'Rejected')
            document.getElementById('confirmationModal').showModal()
          }}
        >
          <XCircle className="w-5 h-5 mr-2" />
          Reject
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="p-3 bg-white rounded-md shadow-md">

              <div className="modal-header flex items-center justify-between p-4 
              bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
                <h1 className="text-xl font-semibold">{modalMessage}</h1>

              </div>
              <TextAreaInput
                isRequired
                label="Remarks"
                name="remarks"
                type="text"
                // hasTextareaHeight={true}
                placeholder=""
                value={formikProps.values.remarks}

              />
              <div className="flex justify-end mt-4 space-x-4">
                <button
                  className="btn rounded-md hover:bg-gray-600 
                  focus:outline-none"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className="btn text-white bg-customBlue rounded-md "
                  onClick={() => {
                    formikProps.handleSubmit()
                    // alert("Action Confirmed!");
                    // closeModal();
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

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
    </div >
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
  const { loanId } = useParams();
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

  const [loanDetails, setLoanDetails] = useState([]);

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
    await provinces().then(province => console.log(province));
    await provincesByCode('01').then(province => console.log(province));
    await provinceByName('Rizal').then(province =>
      console.log(province.province_code)
    );
    await cities().then(city => console.log(city));
    await barangays().then(barangays => console.log(barangays));
  };

  const getLoanDetails = async () => {

    let res = await axios({
      method: 'get',
      url: `/loan/${loanId}/details`,
      data: {

      }
    });
    let details = res.data.data;

    setLoanDetails(details)


  };

  useEffect(() => {


    prepareAddress();
    getLoanDetails()
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
                  setselectedLoan(loan);

                  document.getElementById('viewLoan').showModal();
                  // setFieldValue('Admin_Fname', 'dex');
                }}>
                  <i className="fa-solid fa-eye"></i>
                </button>

                {/* <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {


                    setactiveChildID(l.id);

                  }}>
                  <i className="fa-solid fa-archive"></i>
                </button> */}
              </div>
            )
          );
        }
      },

    ],
    []
  );



  const [currentStep, setCurrentStep] = useState(0);

  const formikConfig = () => {




    return {
      initialValues: {

        calculatorLoanAmmount: 20000,
        calculatorInterestRate: 36,
        calculatorMonthsToPay: 6,
        calculatorTotalAmountToPay: 0,
        remarks: '',
        status: ''

      },
      validationSchema: Yup.object({

        remarks: Yup.string().required('Required'),
      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);





        try {

          let updatedData = {
            loanId: loanId,
            loan_status: values.status,
            remarks: values.remarks
          }

          let res = await axios({
            method: 'post',
            url: `admin/loan/${loanId}/updateStatus/confirmation`,
            data: updatedData
          })


          getLoanDetails();
          toast.success('Successfully updated', {
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


          document.getElementById("confirmationModal").close()
          resetForm()
        } catch (error) {
          //console.log({ error });
        } finally {
        }




      }
    };
  };




  return (
    <Formik {...formikConfig()}>
      {(formikProps) => {
        return <TitleCard
          titleBadge={true}
          title={loanDetails.loan_status}
          topMargin="mt-2"
          TopSideButtons={
            <TopSideButtons
              applySearch={applySearch}
              applyFilter={applyFilter}
              removeFilter={removeFilter}
              faqList={faqList}
              formikProps={formikProps}
            />
          }
        >
          <div>




            <LoanManagementTabs
              loanDetails={loanDetails}
              formikProps={formikProps} />

          </div>
          <ToastContainer />







          <dialog id="confirmationModal" className="modal">
            <div className="modal-box w-11/12 max-w-2xl">

              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {

                  document.getElementById("confirmationModal").close()
                }}


              >✕</button>

              {/* <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
                <h1 className="text-xl font-semibold">Confirmation</h1>

              </div> */}

              <p className="text-sm text-gray-500 mt-1 font-bold"></p>
              <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
                <Alert
                  type={
                    formikProps.values.status === 'Approved' ? 'success' : 'warning'
                  } // Can be "success", "error", "info", "warning"
                  title="Approval Confirmation"
                  description="Are you sure you want to approve this Appointment?"

                />
                <TextAreaInput
                  isRequired
                  label="Remarks"
                  name="remarks"
                  type="text"
                  // hasTextareaHeight={true}
                  placeholder=""
                  value={formikProps.values.remarks}

                />

                <button
                  type="submit"
                  onClick={() => formikProps.handleSubmit()}
                  className={`btn mt-2 justify-end float-right 
                    ${formikProps.values.status === 'Approved' ? "bg-customBlue text-white" : "bg-red-500 text-white"
                    }`}
                  disabled={isSubmitting}>
                  {formikProps.values.status === 'Approved' ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </dialog >

        </TitleCard >


      }}</Formik>


  );
}

export default LoanApplication;
