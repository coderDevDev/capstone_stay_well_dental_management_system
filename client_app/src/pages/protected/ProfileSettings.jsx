import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import ProfileSettings from '../../features/settings/profilesettings';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: 'User Profile' }));
  }, []);

  return <ProfileSettings />;
}

export default InternalPage;
