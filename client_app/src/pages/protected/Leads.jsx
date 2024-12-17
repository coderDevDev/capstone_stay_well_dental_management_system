import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Leads from '../../features/leads';
import {
  setAppSettings,
  getFeatureList
} from '../../features/settings/appSettings/appSettingsSlice';
function InternalPage() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState([]);
  useEffect(() => {
    dispatch(setPageTitle({ title: 'Child Registration' }));
    dispatch(getFeatureList())
      .then(result => {
        setIsLoaded(true);
      })
      .catch(err => {});
  }, []);

  return isLoaded && <Leads />;
}

export default InternalPage;
