"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  History,
  Compass,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Snapshot", href: "/snapshot", icon: PieChart },
  { name: "Delta", href: "/delta", icon: TrendingUp },
  { name: "Historical", href: "/historical", icon: History },
  { name: "Explorer", href: "/explorer", icon: Compass },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-primary text-primary-foreground">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded bg-accent" /> {/* Logo placeholder */}
          <span>SF Hub</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary/50 hover:text-white"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-primary-foreground/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-primary-foreground/60 hover:text-white hover:bg-primary/50"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Button>
      </div>
    </div>
  );
}
