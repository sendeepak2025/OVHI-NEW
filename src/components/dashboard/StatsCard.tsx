
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    positive: boolean;
  };
  description?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  description,
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 p-2 xs:p-3 sm:p-4 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">{title}</CardTitle>
        <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 ml-1">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-2 xs:p-3 sm:p-4 pt-0 sm:pt-0">
        <div className="text-lg xs:text-xl sm:text-2xl font-bold line-clamp-1">{value}</div>
        
        {change && (
          <div className="flex items-center gap-1 mt-1">
            <div className={cn(
              "flex items-center text-xs",
              change.positive ? "text-health-green-dark" : "text-health-red-dark"
            )}>
              {change.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{Math.abs(change.value)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        )}
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
