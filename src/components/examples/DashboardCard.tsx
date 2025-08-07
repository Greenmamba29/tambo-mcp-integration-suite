import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, BarChart3 } from 'lucide-react';

export interface DashboardCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
}

const iconMap = {
  'DollarSign': DollarSign,
  'Users': Users,
  'Activity': Activity,
  'BarChart3': BarChart3,
  'TrendingUp': TrendingUp,
  'TrendingDown': TrendingDown,
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'default',
  description
}) => {
  const Icon = icon ? iconMap[icon as keyof typeof iconMap] : null;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-success/20 bg-success/5';
      case 'warning':
        return 'border-warning/20 bg-warning/5';
      case 'danger':
        return 'border-destructive/20 bg-destructive/5';
      default:
        return 'gradient-card';
    }
  };

  const getChangeColor = () => {
    if (change === undefined) return '';
    return change >= 0 ? 'text-success' : 'text-destructive';
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const ChangeIcon = getChangeIcon();

  return (
    <Card className={`shadow-card hover:shadow-elegant transition-smooth ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 gradient-accent rounded-lg">
            <Icon className="h-4 w-4 text-white" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
          {change !== undefined && (
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getChangeColor()}`}
            >
              {ChangeIcon && <ChangeIcon className="h-3 w-3" />}
              {Math.abs(change)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};