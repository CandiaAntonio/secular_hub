import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; direction: "up" | "down" | "flat" };
  icon?: React.ReactNode;
  className?: string; // Allow className prop
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <span className="text-2xl font-bold">{value}</span>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {change && (
          <div className="mt-4 flex items-center text-sm">
            {change.direction === "up" && (
              <ArrowUp className="mr-1 h-4 w-4 text-success" />
            )}
            {change.direction === "down" && (
              <ArrowDown className="mr-1 h-4 w-4 text-destructive" />
            )}
            {change.direction === "flat" && (
              <ArrowRight className="mr-1 h-4 w-4 text-warning" />
            )}
            <span
              className={cn(
                change.direction === "up" && "text-success",
                change.direction === "down" && "text-destructive",
                change.direction === "flat" && "text-warning"
              )}
            >
              {Math.abs(change.value)}%
            </span>
            <span className="ml-2 text-muted-foreground">vs last year</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
