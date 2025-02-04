import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patientData } from './mockData';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export function PatientStatistics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={patientData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Bar dataKey="newPatients" name="New Patients" fill="#8884d8" />
            <Bar
              dataKey="returningPatients"
              name="Returning Patients"
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
