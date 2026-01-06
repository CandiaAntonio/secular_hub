"use client";

import { PageHeader } from "@/components/layout/page-header";
import { BumpChart } from "@/components/themes/bump-chart";
import { ThemeSpotlight } from "@/components/themes/theme-spotlight";
import { ThemeLegend } from "@/components/themes/theme-legend";
import { useThemeRankings } from "@/lib/hooks/use-theme-rankings";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoricalPage() {
  const {
    data,
    loading,
    error,
    selectedTheme,
    setSelectedTheme
  } = useThemeRankings({ topN: 10 });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Theme Evolution"
          description="How Wall Street's focus shifted over eight years"
        />
        <Skeleton className="h-[500px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] lg:col-span-2" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Theme Evolution"
          description="How Wall Street's focus shifted over eight years"
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Failed to load theme data'}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Theme Evolution"
        description="How Wall Street's focus shifted over eight years (2019-2026)"
      />

      {/* Main Bump Chart */}
      <BumpChart
        rankings={data.rankings}
        years={data.years}
        baseCases={data.baseCases}
        selectedTheme={selectedTheme}
        onThemeSelect={setSelectedTheme}
      />

      {/* Legend and Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Legend */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <ThemeLegend
              rankings={data.rankings}
              selectedTheme={selectedTheme}
              onThemeSelect={setSelectedTheme}
            />
          </CardContent>
        </Card>

        {/* Spotlight Panel */}
        {selectedTheme ? (
          <ThemeSpotlight
            theme={selectedTheme}
            rankings={data.rankings}
            onClose={() => setSelectedTheme(null)}
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="text-sm">Click on a theme line or legend item to see detailed analysis</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Narrative Section */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Reading the Chart</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="mb-2">
                <strong className="text-foreground">Position 0 (Base Case)</strong> represents Bloomberg's
                identified central market scenario for each year - the anchor narrative.
              </p>
              <p>
                <strong className="text-foreground">Lower rank = Higher importance.</strong> Position #1
                is the most discussed theme after the base case.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong className="text-blue-500">Blue lines</strong> are Macro themes (Growth, Recession,
                Monetary Policy, Inflation, Fiscal).
              </p>
              <p>
                <strong className="text-amber-500">Amber lines</strong> are Thematic events (Trade, Elections,
                AI, COVID, Geopolitics).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
