import DashboardStats from './components/DashboardStats';
import AmountStats from './components/AmountStats';
import SummaryStats from './components/SummaryStats';
import PageStats from './components/PageStats';

import React, { PureComponent } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { useDispatch } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import DoughnutChart from './components/DoughnutChart';
import { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import { formatAmount } from './helpers/currencyFormat';

import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

const data = [
  {
    name: 'Normal',
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: 'Overweight',
    uv: 3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: 'Underweight',
    uv: 2000,
    pv: 9800,
    amt: 2290
  },
  {
    name: 'Obese',
    uv: 2780,
    pv: 3908,
    amt: 2000
  }
];

function Dashboard() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(true);
  const [barangayList, setbarangayList] = useState([]);
  const [activeIncomeType, setActiveIncomeType] = useState('');
  const [breakdownOfIncomeModal, setbreakdownOfIncomeModal] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const getDashboardStats = async () => {
    // let res = await axios({
    //   method: 'POST',
    //   url: 'transaction/getDashboardStats'
    // });
    // let data = res.data.data;
    // setIsLoaded(true);
    // setDashboardData(data);
  };
  useEffect(() => {
    // getDashboardStats();
  }, []);

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
  };
  useEffect(() => {
    getBarangayList();
    setIsLoaded(true);
  }, []);

  const getDashboardDatePerBarangay = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getDashboardDatePerBarangay',
      data: {
        barangay: null
      }
    }).then(res => {
      setDashboardData(res.data.data);

      return res;
    });
  };
  useEffect(() => {
    getDashboardDatePerBarangay();
    setIsLoaded(true);
  }, []);

  const updateDashboardPeriod = newRange => {
    // Dashboard range changed, write code to refresh your values
    dispatch(
      showNotification({
        message: `Period updated to ${newRange.startDate} to ${newRange.endDate}`,
        status: 1
      })
    );
  };

  const formikConfig = {
    initialValues: {
      barangay: ''
    },
    validationSchema: Yup.object({
      barangay: Yup.string()
    }),
    validateOnMount: true,
    validateOnChange: false,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      console.log('dex');
      try {
        let res = await axios({
          method: 'POST',
          url: 'user/getDashboardDatePerBarangay',
          data: {
            barangay: values.barangay
          }
        }).then(res => {
          setDashboardData(res.data.data);
          setSubmitting(false);
          return res;
        });
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
                  label="Select Barangay Here "
                  name="barangay"
                  placeholder=""
                  value={values.barangay}
                  setFieldValue={setFieldValue}
                  onBlur={handleBlur}
                  options={barangayList}
                  functionToCalled={async () => {
                    handleSubmit();
                  }}
                />
              </div>
            );
          }}
        </Formik>

        {/** ---------------------- Different charts ------------------------- */}
        <div className="grid lg:grid-cols-2 mt-0 grid-cols-1 gap-6">
          {/* <DoughnutChart /> */}
          {/* <DoughnutChart /> */}
          {/* <LineChart />
          <BarChart /> */}
        </div>
        {/* <div className="grid lg:grid-cols-3 mt-4 grid-cols-1 gap-6">
          <DoughnutChart />
        </div> */}

        {/** ---------------------- Different stats content 2 ------------------------- */}

        <div className="grid lg:grid-cols-3 mt-10 grid-cols-1 gap-6">
          <AmountStats
            color="orange"
            title="Total Number of Childrens"
            icon={
              <i className="fa-solid fa-circle-info fa-2xl text-blue-900"></i>
            }
            type=""
            showModal={(type, isBreakDownActive) => {}}
            totalAmount={dashboardData.totalNumOfChildren}
          />
          <AmountStats
            color="orange"
            title="Children Affected by Undernutrition"
            icon={
              <i className="fa-solid fa-circle-info fa-2xl text-blue-900"></i>
            }
            type=""
            showModal={(type, isBreakDownActive) => {}}
            totalAmount={dashboardData.childrenAffectedByUnderNutrition}
          />
          <AmountStats
            color="orange"
            totalAmount={
              dashboardData.WFA?.Obese.length +
              dashboardData.WFA?.OverweightChildren.length
            }
            title="Children with Overweight or Obesity"
            icon={
              <i className="fa-solid fa-circle-info fa-2xl text-blue-900"></i>
            }
            type=""
            showModal={(type, isBreakDownActive) => {}}
          />
        </div>
        <div className="my-4 divider mt-10" />
        <div className="grid lg:grid-cols-3 mt-10 grid-cols-1 gap-6">
          <SummaryStats
            totalAmount={6}
            title="Weight for Age"
            icon={
              <i className="fa-solid fa-circle-info fa-2xl text-blue-900"></i>
            }
            type="WFA"
            showModal={(type, isBreakDownActive) => {}}
            color="green"
            data={dashboardData?.WFA}
          />
          <SummaryStats
            type="HFA"
            totalAmount={6}
            title="Height for Age"
            icon={
              <i className="fa-solid fa-circle-info fa-2xl text-blue-900"></i>
            }
            color="green"
            showModal={(type, isBreakDownActive) => {}}
            data={dashboardData?.HFA}
          />
          {/* <SummaryStats
            totalAmount={6}
            title="Weight for Length/Height"
            icon={
              <i className="fa-solid fa-circle-info fa-2xl text-blue-900"></i>
            }
            color="green"
            showModal={(type, isBreakDownActive) => {}}
            data={dashboardData?.HFA}
          /> */}
        </div>

        <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="pv"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* <PageStats /> */}
        {/** ---------------------- User source channels table  ------------------------- */}
      </div>
    )
  );
}

export default Dashboard;
