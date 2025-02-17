import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';

// import LoanApplication from '../../features/loanApplication';


import { FullCalendar } from "@/components/full-calendar"


import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

function InternalPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  useEffect(() => {
    dispatch(setPageTitle({ title: 'Appointments' }));
  }, []);


  console.log({ loggedInUser })
  return <div className="min-h-screen bg-gray-100 py-8">
    <div className="container mx-auto px-4">
      {/* <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Dental Reservation System</h1> */}
      {/* <div className="flex items-center justify-end mb-4">
        <Switch id="admin-mode" checked={isAdmin} onCheckedChange={setIsAdmin} />
        <Label htmlFor="admin-mode" className="ml-2">
          Admin Mode
        </Label>
      </div> */}
      <FullCalendar isAdmin={loggedInUser.role === 'admin' || loggedInUser.role === 'dentist' || loggedInUser.role === 'secretary'} />
      <ToastContainer

      />
    </div>
  </div>
}

export default InternalPage;
