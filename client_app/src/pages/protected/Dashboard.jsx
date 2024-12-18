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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl px-4">
        {[{
          label: 'NEW DENTAL APPOINTMENT',
          color: '#98C1D9',
          thumbnail: 'https://img.freepik.com/free-vector/people-protecting-their-cash_74855-5553.jpg?t=st=1730798676~exp=1730802276~hmac=6444e79e04969490ea47f8bba6bad15b02b968e56310cd7d0a95640037b0735c&w=1060'
        },
        {
          label: 'View Payment History',
          thumbnail: 'https://img.freepik.com/free-vector/flat-woman-paying-by-pos-terminal-refund-cashback_88138-785.jpg?t=st=1730798777~exp=1730802377~hmac=7775c8fe89e725c21b7adbd6c6e8349079ff970fc46e13320262235231339d78&w=996'
        },
        {
          label: 'Account History',
          thumbnail: 'https://img.freepik.com/free-vector/e-wallet-money-transfer-concept-mobile-wallet-internet-banking-e-wallet-credit-card-mobile-app-accounting-investments-safe-online-internet-transaction-vector-illustration_1150-55440.jpg?t=st=1730798913~exp=1730802513~hmac=b379287bb875fbc5a65c9e607337be452b1941a19df992be6f137501f69c078f&w=996'
        }].map((item, index) => (
          <div

            onClick={() => {
              navigate("/app/appointments"); // Navigate to the desired route
            }}
            key={index}
            className={`cursor-pointer max-w-sm mx-auto rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 ease-in-out  hover:scale-105 hover:shadow-lg`}
          >
            <div className="card ">
              <figure>
                <img
                  src={item.thumbnail}
                  alt="Shoes" />
              </figure>
              <div className="card-body">
                <h2 className="card-title uppercase text-slate-900 font-bold">{item.label}</h2>


              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

export default InternalPage;
