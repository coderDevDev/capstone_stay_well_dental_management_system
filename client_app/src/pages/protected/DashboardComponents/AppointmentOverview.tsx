import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { appointmentData } from './mockData';
import { useState, useEffect } from 'react';
import axios from 'axios';

export function AppointmentOverview() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    let res = await axios.get('appointment/list', {
      // customerId: userId,
      // type: orderType
    });
    let list = res.data.data.map(other => {
      // const phDateStart = addHours(parseISO(other.start), 8);
      // const phDateEnd = addHours(parseISO(other.end), 8);

      // let options = { timeZone: 'Asia/Manila', timeZoneName: 'long' };

      return {
        ...other,
        serviceId: other.service_id,
        patientId: other.patient_id,
        start: new Date(other.start),
        end: new Date(other.end)
      };
    });
    console.log({ list });
    setAppointments(list);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);
  const appointmentData = [
    {
      status: 'Scheduled',
      count: appointments.filter(a => a.status === 'Confirmed').length,
      color: 'bg-blue-500'
    },
    {
      status: 'Pending',
      count: appointments.filter(a => a.status === 'Pending').length,
      color: 'bg-yellow-500'
    },
    {
      status: 'Completed',
      count: appointments.filter(a => a.status === 'Completed').length,
      color: 'bg-green-500'
    },
    {
      status: 'Cancelled',
      count: appointments.filter(a => a.status === 'Cancelled').length,
      color: 'bg-red-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {appointmentData.map(item => (
            <div key={item.status} className="flex items-center space-x-2">
              <div className={`h-4 w-4 rounded-full ${item.color}`} />
              <div>
                <p className="text-sm font-medium">{item.status}</p>
                <p className="text-2xl font-bold">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
