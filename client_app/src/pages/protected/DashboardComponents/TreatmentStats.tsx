import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { treatmentData } from './mockData';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export function TreatmentStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Treatment Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={treatmentData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
