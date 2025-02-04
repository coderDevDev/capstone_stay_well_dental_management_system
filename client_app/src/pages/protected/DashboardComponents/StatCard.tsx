import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  Calendar,
  UserPlus,
  DollarSign,
  type LucideIcon
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
}

const iconMap: { [key: string]: LucideIcon } = {
  Users,
  Calendar,
  UserPlus,
  DollarSign
};

export function StatCard({ title, value, icon }: StatCardProps) {
  const IconComponent = iconMap[icon] || Users;

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <IconComponent className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
