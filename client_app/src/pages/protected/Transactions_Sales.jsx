import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Transactions_Sales from '../../features/transaction_sales';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Transactions' }));
  }, []);

  return <Transactions_Sales />;
}

export default InternalPage;
