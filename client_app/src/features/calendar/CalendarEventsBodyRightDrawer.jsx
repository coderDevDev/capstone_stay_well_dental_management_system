import globalConstantUtil from '../../components/CalendarView/util.js';

const { RIGHT_DRAWER_TYPES, CALENDAR_EVENT_STYLE } = globalConstantUtil;
const THEME_BG = 'red';

function CalendarEventsBodyRightDrawer({ filteredEvents }) {
  return (
    <>
      {filteredEvents.map((e, k) => {
        return (
          <div
            key={k}
            className={`grid mt-3 card  rounded-box p-3 ${
              THEME_BG[e.theme] || ''
            }`}>
            {e.title}
          </div>
        );
      })}
    </>
  );
}

export default CalendarEventsBodyRightDrawer;
