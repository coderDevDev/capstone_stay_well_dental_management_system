'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AttendanceCalendarViewProps {
  employeeName: string;
  attendanceRecords: Array<{
    id: string;
    date: string;
    status: string;
  }>;
  onUpdateAttendance: (data: { id: string; status: string }) => Promise<void>;
}

export default function AttendanceCalendarView({
  employeeName,
  attendanceRecords,
  onUpdateAttendance
}: AttendanceCalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    date: string;
    status: string;
  } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Function to get event color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return '#22c55e'; // green-500
      case 'Absent':
        return '#ef4444'; // red-500
      case 'Late':
        return '#eab308'; // yellow-500
      case 'Half Day':
        return '#f97316'; // orange-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // Convert attendance records to FullCalendar events
  const events = attendanceRecords.map(record => ({
    id: record.id,
    title: record.status,
    date: record.date.split('T')[0],
    backgroundColor: getStatusColor(record.status),
    borderColor: getStatusColor(record.status),
    textColor: '#ffffff',
    allDay: true,
    extendedProps: { status: record.status }
  }));

  const handleEventClick = (info: any) => {
    const record = attendanceRecords.find(r => r.id === info.event.id);
    if (record) {
      setSelectedEvent(record);
      setIsEditDialogOpen(true);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedEvent) return;

    try {
      await onUpdateAttendance({
        id: selectedEvent.id,
        status: newStatus
      });
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Attendance status updated successfully');
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance status');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Attendance Calendar</CardTitle>
        <CardDescription>{employeeName}'s attendance records</CardDescription>
        {/* <div className="flex gap-2 mt-2">
          {['Present', 'Absent', 'Late', 'Half Day'].map(status => (
            <Badge
              key={status}
              style={{
                backgroundColor: getStatusColor(status),
                color: 'white'
              }}>
              {status}
            </Badge>
          ))}
        </div> */}
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            height="100%"
            eventClick={handleEventClick}
            eventContent={eventInfo => (
              <div className="w-full text-center px-2 py-1">
                {eventInfo.event.title}
              </div>
            )}
          />
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Attendance Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Date: {selectedEvent?.date.split('T')[0]}
              </p>
              <p className="text-sm font-medium">
                Current Status: {selectedEvent?.status}
              </p>
              <Select
                defaultValue={selectedEvent?.status}
                onValueChange={handleStatusUpdate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
