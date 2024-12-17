import { useState } from 'react';
import CalendarView from '../../components/CalendarView';
import moment from 'moment';
// import { CALENDAR_INITIAL_EVENTS } from '../../utils/dummyData';
import { useDispatch } from 'react-redux';
import { openRightDrawer } from '../common/rightDrawerSlice';
import globalConstantUtil from '../../utils/globalConstantUtil';

let { RIGHT_DRAWER_TYPES } = globalConstantUtil;
import { showNotification } from '../common/headerSlice';

// const INITIAL_EVENTS = CALENDAR_INITIAL_EVENTS;

function Calendar() {
  const dispatch = useDispatch();

  const [events, setEvents] = useState([]);

  return (
    <>
      <div></div>
    </>
  );
}

export default Calendar;
