'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { dentalServices, mockAppointments } from '@/lib/mock-data';

export default function BookAppointment() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [service, setService] = useState('');
  const [time, setTime] = useState('');
  const router = useRouter();

  const availableTimes = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !service || !time) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    // Check for conflicts
    const selectedDateTime = new Date(
      date.setHours(
        Number.parseInt(time.split(':')[0]),
        Number.parseInt(time.split(':')[1])
      )
    );
    const conflict = mockAppointments.some(
      appointment => appointment.date.getTime() === selectedDateTime.getTime()
    );

    if (conflict) {
      toast({
        title: 'Error',
        description:
          'This time slot is already booked. Please choose another time.',
        variant: 'destructive'
      });
      return;
    }

    // In a real application, you would save the appointment to the database here
    toast({
      title: 'Success',
      description: 'Your appointment has been booked successfully!'
    });
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Select a date:</label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <div>
          <label htmlFor="service" className="block mb-2">
            Select a service:
          </label>
          <Select onValueChange={setService}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {dentalServices.map(service => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="time" className="block mb-2">
            Select a time:
          </label>
          <Select onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {availableTimes.map(t => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">
          Book Appointment
        </Button>
      </form>
    </div>
  );
}
