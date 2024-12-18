import React, { useState, useEffect } from 'react';
import { addDays, setHours, setMinutes, format } from 'date-fns';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  status: string;
}

const formatDateForDB = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short', // Mon
    year: 'numeric', // 2024
    month: 'short', // Dec
    day: 'numeric', // 23
    hour: '2-digit', // 10
    minute: '2-digit', // 30
    second: '2-digit', // 05
    timeZoneName: 'short' // GMT+0800
  });
};

export function getAvailableTimeSlots(
  startDate: Date,
  endDate: Date,
  appointmentList: Array<{ start: string; end: string; status: string }>
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  let currentDate = startDate;

  // Parse the appointment dates into Date objects and format them as per the DB requirement
  const transformedAppointments = appointmentList.map(appointment => ({
    ...appointment,
    start: new Date(appointment.start), // Parse start date
    end: new Date(appointment.end), // Parse end date
    status: appointment.status || 'Confirmed' // Ensure there's a status
  }));

  //console.log({ transformedAppointments });

  // Generate time slots for each day in the range
  while (currentDate <= endDate) {
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const start = setMinutes(setHours(new Date(currentDate), hour), minute);
        const end = setMinutes(
          setHours(new Date(currentDate), hour),
          minute + 30
        );

        // Format start and end for DB storage if needed
        const formattedStart = formatDateForDB(start);
        const formattedEnd = formatDateForDB(end);

        // Check if the generated time slot overlaps with any reserved slots
        const isReservedSlot = transformedAppointments.some(
          reserved =>
            start < reserved.end &&
            end > reserved.start &&
            reserved.status === 'Scheduled' // Only check if status is 'Confirmed'
        );

        // Set status and availability based on reservation and status
        const status = isReservedSlot ? 'Reserved' : 'Available';
        const available = !isReservedSlot;

        slots.push({
          start,
          end,
          available,
          status
        });
      }
    }

    // Move to the next day
    currentDate = addDays(currentDate, 1);
  }

  //console.log({ slots });
  return slots;
}
