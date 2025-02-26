import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import { FullCalendar } from "@/components/full-calendar";
import { branchService } from '@/services/api';
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'react-toastify';

// import LoanApplication from '../../features/loanApplication';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

function InternalPage() {
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Appointments' }));
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await branchService.getAll();
      if (response.success) {
        setBranches(response.data);
        if (response.data.length > 0) {
          setSelectedBranchId(response.data[0].id); // Select first branch by default
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      Loading...
    </div>;
  }

  return <div className="min-h-screen bg-gray-100 py-8">
    <div className="container mx-auto px-4">
      {/* <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Dental Reservation System</h1> */}
      {/* <div className="flex items-center justify-end mb-4">
        <Switch id="admin-mode" checked={isAdmin} onCheckedChange={setIsAdmin} />
        <Label htmlFor="admin-mode" className="ml-2">
          Admin Mode
        </Label>
      </div> */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Select Branch</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className={`bg-white p-4 cursor-pointer transition-all ${selectedBranchId === branch.id
                ? 'border-2 border-blue-500 shadow-lg'
                : 'hover:shadow-md'
                }`}
              onClick={() => setSelectedBranchId(branch.id)}
            >
              <div className="flex flex-col">
                <h3 className="font-semibold text-lg">{branch.name}</h3>
                <p className="text-sm text-gray-600">{branch.address}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {branch.operating_hours}
                </p>
                <span className={`mt-2 text-xs px-2 py-1 rounded-full w-fit ${branch.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {branch.status}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile/Responsive Branch Selector */}
        <div className="md:hidden mt-4">
          <Select
            value={selectedBranchId}
            onValueChange={setSelectedBranchId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar */}
      {selectedBranchId ? (
        <FullCalendar
          isAdmin={loggedInUser.role === 'admin' || loggedInUser.role === 'dentist' || loggedInUser.role === 'secretary'}
          selectedBranchId={selectedBranchId}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Please select a branch to view appointments
        </div>
      )}
      <ToastContainer

      />
    </div>
  </div>
}

export default InternalPage;
