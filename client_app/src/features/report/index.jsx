import { useDispatch } from 'react-redux';
import { showNotification } from '../common/headerSlice';

import { useEffect, useState, useRef, useMemo } from 'react';

import axios from 'axios';

import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import TitleCard from '../../components/Cards/TitleCard';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill
} from './../../pages/protected/DataTables/Table'; // ne

import { useReactToPrint } from 'react-to-print';

function Dashboard() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [barangayList, setbarangayList] = useState([]);
  const [activeIncomeType, setActiveIncomeType] = useState('');
  const [breakdownOfIncomeModal, setbreakdownOfIncomeModal] = useState(false);
  const [tableData, setDashboardData] = useState([]);

  const componentPDF = useRef();
  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: 'Report'
    // onAfterPrint: () => alert('Data saved in PDF')
  });

  let DropdownOptions = [
    {
      label: 'Underweight Children',
      value: 'UW'
    },
    {
      label: 'Severely Underweight Children',
      value: 'SUW'
    },
    {
      label: 'Stunted Children',
      value: 'St'
    },
    {
      label: 'Severely Stunted Children',
      value: 'SSt'
    }
  ];

  const [activeFilterLabel, setactiveFilterLabel] = useState(
    DropdownOptions[0].label
  );
  const getBarangayList = async () => {
    let res = await axios({
      method: 'GET',
      url: 'user/getBarangayList'
    });
    setbarangayList(
      res.data.data.map(b => {
        return {
          label: b,
          value: b
        };
      })
    );
    setIsLoaded(true);
  };
  useEffect(() => {
    getBarangayList();
  }, []);

  const getReportPerBarangay = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getReportPerBarangay',
      data: {
        barangay: 'DAYAP',
        report_type: 'UW'
      }
    }).then(res => {
      setDashboardData(res.data.data);
      setIsLoaded(true);
      return res;
    });
  };
  useEffect(() => {
    getReportPerBarangay();
  }, []);

  const TopSideButtons = () => {
    const dispatch = useDispatch();

    const openAddNewModal = () => {
      document.getElementById('createCodeModal').showModal();
    };

    return (
      <div className="inline-block float-right ">
        <button
          className="btn btn-sm mt-2 justify-end 
           float-right"
          onClick={generatePDF}>
          <i class="fa-solid fa-print text-warning"></i>
          Print
        </button>
      </div>
    );
  };

  const formikConfig = {
    initialValues: {
      barangay: 'DAYAP',
      report_type: 'UW'
    },
    validationSchema: Yup.object({
      barangay: Yup.string()
    }),
    validateOnMount: true,
    validateOnChange: false,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      console.log({ values });

      try {
        if (values.barangay && values.report_type) {
          let res = await axios({
            method: 'POST',
            url: 'user/getReportPerBarangay',
            data: {
              barangay: values.barangay,
              report_type: values.report_type
            }
          }).then(res => {
            let activeFilter = DropdownOptions.find(
              a => a.value === values.report_type
            );

            console.log({ activeFilter });
            setactiveFilterLabel(activeFilter && activeFilter.label);
            setDashboardData(res.data.data);
            setSubmitting(false);
            return res;
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Child Seq',
        accessor: 'Child_Seq',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: 'Address',
        accessor: 'Address_or_Location',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: 'Name of Mother or Caregiver',
        accessor: 'Name_of_Mother_or_Caregiver',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: 'Full Name of Child',
        accessor: 'Full_Name_of_Child',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: 'Sex',
        accessor: 'Sex',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: 'Age in Mos.',
        accessor: 'Age_in_Months',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: 'Weight for Age Classfn',
        accessor: 'Weight_for_Lt_or_Ht_Status',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: 'Weight (kg)',
        accessor: 'Weight',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: '1',
        accessor: '',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: '2',
        accessor: '',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      },
      {
        Header: '3',
        accessor: '',
        Cell: ({ value }) => {
          return <span className="font-bold text-slate-700">{value}</span>;
        }
      }
    ],
    []
  );

  return (
    isLoaded && (
      <div>
        {/** ---------------------- Select Period Content ------------------------- */}
        {/* <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} /> */}
        <TitleCard
          title="Reports"
          topMargin="mt-2"
          TopSideButtons={TopSideButtons()}>
          <Formik {...formikConfig}>
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
              return (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                  <Dropdown
                    // icons={mdiAccount}
                    label="Select Barangay"
                    name="barangay"
                    placeholder=""
                    value={values.barangay}
                    default
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={barangayList}
                    functionToCalled={async () => {
                      handleSubmit();
                    }}
                  />
                  <Dropdown
                    // icons={mdiAccount}
                    label="Select Report To Generate"
                    name="report_type"
                    placeholder=""
                    value={values.report_type}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={DropdownOptions}
                    functionToCalled={async () => {
                      handleSubmit();
                    }}
                  />
                </div>
              );
            }}
          </Formik>
          <div
            ref={componentPDF}
            className="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-xl dark:bg-gray-800">
            {/* <!-- Grid --> */}
            <div className="flex justify-between">
              <div className="text-end">
                <h4 className="text-1xl md:text-1xl font-semibold text-gray-900 dark:text-gray-200">
                  No. of {activeFilterLabel} Children: {tableData.length}
                </h4>
              </div>
              <div>
                <img
                  className="mask mask-squircle w-20 "
                  src="/system_logo.jpg"
                  alt="Logo"></img>
                {/* <h1 className="mt-2 text-lg md:text-xl font-semibold text-base-600 dark:text-white font-bold">
                    Amulet
                  </h1> */}
              </div>
            </div>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              <div>
                <h4 className="text-1xl md:text-1xl font-semibold text-gray-900 dark:text-gray-200 font-bold uppercase">
                  LIST OF {activeFilterLabel} CHILDREN 0-59 MONTHS OLD
                </h4>
              </div>
            </div>
            <div className="my-4 divider mt-2" />
            <div className="overflow-x-auto ">
              <Table columns={columns} data={tableData} />
            </div>
          </div>
        </TitleCard>
      </div>
    )
  );
}

export default Dashboard;
