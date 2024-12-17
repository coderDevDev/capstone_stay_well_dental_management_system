import React from 'react';
import { format } from 'date-fns';
import { TimeSlot as TimeSlotType } from './utils_api';

interface TimeSlotProps {
  slot: TimeSlotType;
  onSelect: (slot: TimeSlotType) => void;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ slot, onSelect }) => {
  return (
    <button
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        slot.available
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
      onClick={() => slot.available && onSelect(slot)}
      disabled={!slot.available}>
      {format(slot.start, 'HH:mm')}
    </button>
  );
};
