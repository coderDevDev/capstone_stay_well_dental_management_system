import { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Dashboard from '../../features/dashboard/index';
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { FaCheckCircle } from 'react-icons/fa'; // Add any icons you want to use
import axios from 'axios';
import { format, startOfToday } from 'date-fns';
import { formatAmount } from './../../features/dashboard/helpers/currencyFormat';

import DatePicker from "react-tailwindcss-datepicker";
import { DateTime } from 'luxon';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table'; // new


import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";

import { StatCard } from "./DashboardComponents/StatCard"
import { AppointmentOverview } from "./DashboardComponents/AppointmentOverview"
import { TreatmentStats } from "./DashboardComponents/TreatmentStats"
import { RecentActivities } from "./DashboardComponents/RecentActivities"
import { dentalStats } from "./DashboardComponents/mockData"



import PatientTreatment from "./PatientTreatment/index"

function InternalPage() {

  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  console.log({ loggedInUser })

  let role = loggedInUser.role;
  console.log({ role })
  // Set today's date as default for the DatePicker
  const today = startOfToday(); // Get today's date
  const [value, setValue] = useState({
    startDate: today,
    endDate: today
  });

  const navigate = useNavigate();
  const [resultData, setResultData] = useState([]);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const handleFilterClick = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleFilterChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedFilter(selectedValue);
    // Perform any filtering action here based on selectedValue
    //console.log('Selected Filter:', selectedValue);
    // Optionally close the dropdown after selection
    // setDropdownVisible(false);
  };




  useEffect(() => {
    dispatch(setPageTitle({ title: 'Dashboard' }));
  }, []);



  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const fetchAppointments = async () => {
    let res = await axios.get('appointment/list', {
      // customerId: userId,
      // type: orderType
    });
    let list = res.data.data.map(other => {
      // const phDateStart = addHours(parseISO(other.start), 8);
      // const phDateEnd = addHours(parseISO(other.end), 8);

      // let options = { timeZone: 'Asia/Manila', timeZoneName: 'long' };

      return {
        ...other,
        serviceId: other.service_id,
        patientId: other.patient_id,
        start: new Date(other.start),
        end: new Date(other.end)
      };
    });
    console.log({ list });
    setAppointments(list);
  };



  const fetchPatients = async () => {
    let res = await axios.get('user/patients/all', {
      // customerId: userId,
      // type: orderType
    });

    let patients = res.data.data.map(u => {
      return {
        id: u.patient_id,
        name:
          u.patient_first_name + ' ' + u.patient_last_name + ' - ' + u.email,
        emai: u.email,
        created_at: u.created_at
      };
    });

    setPatients(patients);
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients()
  }, []);



  let mappedStats = dentalStats;

  const todaysDate = new Date().toISOString().split('T')[0];
  // Filter appointments by today's date
  const todaysAppointments = appointments.filter(appointment => appointment.date === todaysDate);

  if (role === 'patient') {
    mappedStats = [
      { title: 'Total Transaction', value: appointments.length, icon: 'UserPlus' },
      { title: 'Appointments Today', value: todaysAppointments.length, icon: 'Calendar' },
      // { title: 'New Patients (This Month)', value: 56, icon: 'UserPlus' },
      { title: 'Total Treatments', value: 0, icon: 'UserPlus' },
      { title: 'Total Payment', value: '₱0', icon: 'PesoSign' }
    ]

  } else {


    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // January is 0, February is 1, etc.

    // Filter patients who were born in the current month
    const newPatientsThisMonth = patients.filter(patient => {
      const dob = new Date(patient.created_at);
      return dob.getFullYear() === currentYear && dob.getMonth() === currentMonth;
    });


    console.log({ patients, newPatientsThisMonth })

    mappedStats = [
      { title: 'Total Patients', value: patients.length, icon: 'Users' },
      { title: 'Appointments Today', value: todaysAppointments.length, icon: 'Calendar' },
      { title: 'New Patients (This Month)', value: newPatientsThisMonth.length, icon: 'UserPlus' },
      { title: 'Revenue (This Month)', value: '₱0', icon: 'PesoSign' }
    ];

  }

  return <div>
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* <h1 className="text-3xl font-bold mb-6">Dental Management Dashboard</h1> */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {mappedStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <AppointmentOverview />
          <TreatmentStats />
          {/* 
          {
            role !== 'patient' && <RecentActivities />
          } */}


        </div>
        {/* <PatientTreatment /> */}
      </div>

    </div>
  </div>;
}

export default InternalPage;
