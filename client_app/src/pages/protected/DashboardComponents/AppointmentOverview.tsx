import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appointmentData } from './mockData';

export function AppointmentOverview() {
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
