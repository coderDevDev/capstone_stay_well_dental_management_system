import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Suppliers from '../../features/suppliers';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Suppliers' }));
  }, []);

  return <Suppliers />;
}

export default InternalPage;
