import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import FaceFrownIcon from '@heroicons/react/24/solid/FaceFrownIcon';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: '' }));
  }, []);

  return (
    <div className="hero h-4/5 bg-base-200">
      <div className="hero-content  text-center">
        <div className="max-w-md">

          <h1 className="text-2xl font-bold">This page is under construction</h1>
        </div>
      </div>
    </div>
  );
}

export default InternalPage;
