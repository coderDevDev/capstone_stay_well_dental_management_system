import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import {
  setAppSettings,
  getFeatureList
} from '../../features/settings/appSettings/appSettingsSlice';
import CodeGenerator from '../../features/code_generator/components/index';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill
} from './DataTables/Table'; // new

function InternalPage() {
  const dispatch = useDispatch();

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(setPageTitle({ title: 'Code Generator' }));
    dispatch(getFeatureList()).then(() => {
      setIsLoaded(true);
    });
    // get app settings
    // dispatch(
    //   setAppSettings({
    //     packageList: [],
    //     codeTypeList: []
    //   })
    // );
  }, []);
  const columns = useMemo(
    () => [
      {
        Header: 'QR Code',
        accessor: 'name',
        Cell: AvatarCell,
        imgAccessor: 'imgUrl',
        emailAccessor: 'email'
      },
      {
        Header: 'Type',
        accessor: 'title',
        Filter: SelectColumnFilter // new
      },

      {
        Header: 'Package',
        accessor: 'role',
        Filter: SelectColumnFilter, // new
        filter: 'includes'
      },
      {
        Header: 'Date Created',
        accessor: 'date_created'
      },
      {
        Header: 'Approval Date',
        accessor: 'approval_date'
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: StatusPill,
        Filter: SelectColumnFilter
      }
    ],
    []
  );

  // return <CodeGenerator />;

  return (
    !!isLoaded && (
      <div>
        <CodeGenerator />
      </div>
    )
  );
}

export default InternalPage;
