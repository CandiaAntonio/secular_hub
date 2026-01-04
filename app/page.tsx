import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, Quote, TrendingUp, Users } from "lucide-react";
import { MethodologySection } from "@/components/ui/collapsible-methodology";

import { getStats } from "@/lib/db/queries";
import { fallbackHomeStats } from "@/lib/mock-data";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let stats;
  try {
    stats = await getStats();
  } catch (error) {
    console.error("Failed to fetch stats for home page:", error);
    stats = fallbackHomeStats;
  }

  // Calculate changes (mock logic or real if data allows)
  const currentTotal = stats.total_records;
  const institutionCount = stats.institutions.length;
  const themeCount = stats.themes.length;
  const yearsCount = stats.years.length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="flex items-start justify-between gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Here&apos;s (Almost) Everything Wall Street Expects in 2026
          </h1>
          <p className="max-w-3xl text-xl text-muted-foreground">
            A searchable archive of Wall Street&apos;s year-ahead forecasts, curated from Bloomberg&apos;s annual outlook compilations
          </p>
        </div>

        {/* Banner Image */}
        <div className="flex-shrink-0 hidden md:block">
          <img 
            src="/images/bull_debug.gif" 
            alt="AI Bull"
            className="h-32 w-auto rounded-lg"
            loading="eager"
          />
        </div>
      </section>

      {/* Methodology Section */}
      <MethodologySection />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Investment Views"
          value={currentTotal.toLocaleString()}
          icon={<Quote className="h-4 w-4" />}
          change={{ value: 12, direction: "up" }}
        />
        <StatCard
          title="Institutions"
          value={institutionCount.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          change={{ value: 0, direction: "flat" }}
        />
        <StatCard
            title="Themes Tracked"
            value={themeCount.toLocaleString()}
            icon={<TrendingUp className="h-4 w-4" />}
            change={{ value: 8, direction: "up" }}
        />
        <StatCard
            title="Years Covered"
            value={yearsCount.toString()}
            icon={<BookOpen className="h-4 w-4" />}
        />
      </div>

      {/* Modules */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Snapshot Module */}
          <Link href="/snapshot" className="group">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="group-hover:text-accent">Snapshot</CardTitle>
                <CardDescription>The 2026 Consensus View</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Explore the current year's dominant themes, key risks, and
                  institutional positioning across all major asset classes.
                </p>
                <Button variant="link" className="mt-4 h-auto p-0 group-hover:text-accent">
                  Explore Snapshot <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Delta Module */}
          <Link href="/delta" className="group">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="group-hover:text-accent">Delta</CardTitle>
                <CardDescription>Year-over-Year Changes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analyze how the narrative has shifted from 2025 to 2026. Identify
                  emerging themes and fading convictions.
                </p>
                <Button variant="link" className="mt-4 h-auto p-0 group-hover:text-accent">
                  Analyze Delta <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Historical Module */}
          <Link href="/historical" className="group">
            <Card className="h-full transition-colors hover:bg-muted/50 opacity-60">
              <CardHeader>
                <CardTitle>Historical</CardTitle>
                <CardDescription>Eight-Year View (Phase 2)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Longitudinal analysis of secular themes since 2019. Track the
                  evolution of "inflation", "deglobalization", and "AI".
                </p>
                <div className="mt-4 flex items-center text-xs font-medium text-warning">
                  COMING SOON
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Explorer Module */}
          <Link href="/explorer" className="group">
            <Card className="h-full transition-colors hover:bg-muted/50 opacity-60">
              <CardHeader>
                <CardTitle>Explorer</CardTitle>
                <CardDescription>Deep Dive (Phase 2)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Full-text search and semantic exploration of the investment outlook
                  corpus.
                </p>
                <div className="mt-4 flex items-center text-xs font-medium text-warning">
                  COMING SOON
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>


    </div>
  );
}
