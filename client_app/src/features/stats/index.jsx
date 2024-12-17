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

import BarChart from './../../features/dashboard/components/BarChart';

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
      label: 'Undernutrition Children',
      value: 'UN'
    },
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
        {/* <button
          className="btn btn-sm mt-2 justify-end 
           float-right"
          onClick={generatePDF}>
          <i class="fa-solid fa-print text-warning"></i>
          Print
        </button> */}
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
        if (values.report_type) {
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

  return (
    isLoaded && (
      <div>
        {/** ---------------------- Select Period Content ------------------------- */}
        {/* <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} /> */}
        <TitleCard
          title="Statistics"
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
                    label="Most Barangay with *"
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

          <BarChart />
        </TitleCard>
      </div>
    )
  );
}

export default Dashboard;
