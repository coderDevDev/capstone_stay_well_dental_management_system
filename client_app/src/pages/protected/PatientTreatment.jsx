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

function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
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


  return <div>
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Dental Management Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {dentalStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AppointmentOverview />
          <TreatmentStats />
          <RecentActivities />
        </div>
      </div>

    </div>
  </div>;
}

export default InternalPage;
