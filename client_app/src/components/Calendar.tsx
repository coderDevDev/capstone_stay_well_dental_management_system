import React, { useState } from 'react';
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { TimeSlot as TimeSlotType } from './utils_api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameDay, format } from 'date-fns';

moment.locale('en-GB');
const localizer = momentLocalizer(moment);

interface CalendarProps {
  timeSlots: TimeSlotType[];
  onSelectSlot: (slot: TimeSlotType) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  timeSlots,
  onSelectSlot
}) => {
  const [view, setView] = useState<string>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Reserved dates with start and end times
  const reservedSlots: { start: Date; end: Date }[] = [
    {
      start: new Date('2024-12-17T10:30:00'),
      end: new Date('2024-12-17T12:30:00')
    },
    {
      start: new Date('2024-12-17T14:30:00'),
      end: new Date('2024-12-17T14:23:08')
    }
  ];

  // Convert time slots to events
  const events = timeSlots.map(slot => ({
    start: slot.start,
    end: slot.end,
    title: slot.available ? 'Available' : 'Booked',
    available: slot.available
  }));

  const isDateFullyReserved = (date: Date) => {
    const daySlots = timeSlots.filter(slot => isSameDay(slot.start, date));
    return daySlots.length > 0 && daySlots.every(slot => !slot.available);
  };

  // Check if the selected date falls within any reserved slot
  const isSlotReserved = (start: Date, end: Date) => {
    return reservedSlots.some(
      reserved =>
        (start >= reserved.start && start < reserved.end) ||
        (end > reserved.start && end <= reserved.end)
    );
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(currentDate);
    if (action === 'PREV') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (action === 'NEXT') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setTime(Date.now());
    }
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  return (
    <div className="h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            onClick={() => handleNavigate('PREV')}
            className="mr-2 p-2 border border-gray-300 rounded hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavigate('TODAY')}
            className="mr-2 p-2 border border-gray-300 rounded hover:bg-gray-100">
            Today
          </button>
          <button
            onClick={() => handleNavigate('NEXT')}
            className="p-2 border border-gray-300 rounded hover:bg-gray-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <span className="text-lg font-semibold">
          {format(
            currentDate,
            view === Views.MONTH ? 'MMMM yyyy' : 'MMMM d, yyyy'
          )}
        </span>
        <div>
          <button
            onClick={() => handleViewChange(Views.MONTH)}
            className={`mr-2 p-2 border ${
              view === Views.MONTH ? 'bg-blue-500 text-white' : 'bg-white'
            } rounded hover:bg-blue-100`}>
            Month
          </button>
          <button
            onClick={() => handleViewChange(Views.DAY)}
            className={`p-2 border ${
              view === Views.DAY ? 'bg-blue-500 text-white' : 'bg-white'
            } rounded hover:bg-blue-100`}>
            Day
          </button>
        </div>
      </div>
      <BigCalendar
        toolbar={false}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.DAY]}
        view={view as any}
        onView={handleViewChange}
        date={currentDate}
        onNavigate={date => setCurrentDate(date)}
        onSelectEvent={event => {
          if (event.available) {
            const selectedSlot = timeSlots.find(
              slot => slot.start.getTime() === event.start.getTime()
            );
            if (selectedSlot) {
              onSelectSlot(selectedSlot);
            }
          }
        }}
        onSelectSlot={slotInfo => {
          if (view === Views.MONTH) {
            setCurrentDate(slotInfo.start);
            setView(Views.DAY);
          }
        }}
        selectable={view === Views.MONTH}
        eventPropGetter={event => ({
          className: event.available
            ? 'bg-blue-100 text-blue-800 border-blue-200 cursor-pointer'
            : 'bg-gray-100 text-gray-500 border-gray-200'
        })}
        dayPropGetter={date => {
          if (isDateFullyReserved(date)) {
            return {
              className: 'bg-red-50',
              style: {
                cursor: 'not-allowed'
              }
            };
          }
          return {};
        }}
        components={{
          dateCellWrapper: ({ children, value }) => (
            <div className="relative h-full">{children}</div>
          )
        }}
        className="rounded-lg shadow-sm border border-gray-200"
      />
    </div>
  );
};
