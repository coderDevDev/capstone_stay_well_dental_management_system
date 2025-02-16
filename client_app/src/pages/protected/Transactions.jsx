import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Transactions from '../../features/transactions';
import RegisterPage from '@/app/register/page';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

function InternalPage() {
  const dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Patient Record' }));
  }, []);

  return (
    <div>

      <Transactions />
    </div>
  );
}

export default InternalPage;
