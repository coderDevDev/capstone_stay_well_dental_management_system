import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { recentActivities } from './mockData';
import {
  Calendar,
  CheckCircle,
  UserPlus,
  FileText,
  Bell,
  type LucideIcon
} from 'lucide-react';

const iconMap: { [key: string]: LucideIcon } = {
  Calendar,
  CheckCircle,
  UserPlus,
  FileText,
  Bell
};

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {recentActivities.map(activity => {
            const IconComponent = iconMap[activity.icon] || Calendar;
            return (
              <li key={activity.id} className="flex items-center space-x-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.patient}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.activity}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
