import moment from 'moment';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TitleCard from '../../components/Cards/TitleCard';
import { openModal } from '../common/modalSlice';
import { deleteLead, getLeadsContent } from './leadSlice';
// import {
//   CONFIRMATION_MODAL_CLOSE_TYPES,
//   MODAL_BODY_TYPES
// } from '../../utils/globalConstantUtil';
// import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
// import { showNotification } from '../common/headerSlice';

import Register from '../user/Register';

function Leads() {
  const { leads } = useSelector(state => state.lead);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getLeadsContent());
  }, []);

  return (
    <>
      <div className="overflow-x-auto w-full">
        <Register />
      </div>
    </>
  );
}

export default Leads;
