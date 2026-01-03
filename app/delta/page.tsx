"use client";

import { useDeltaData } from "@/lib/hooks/use-delta-data";
import { YearSelector } from "@/components/delta/year-selector";
import { DeltaStatRow } from "@/components/delta/delta-stat-row";
import { AiDeltaNarrative } from "@/components/delta/ai-delta-narrative";
import { ThemeSankey } from "@/components/delta/theme-sankey";
import { ConvictionShift } from "@/components/delta/conviction-shift";
import { InstitutionPivots } from "@/components/delta/institution-pivots";
import { useCompareYears } from "@/lib/hooks/use-compare-years";

export default function DeltaPage() {
  const { year1, year2 } = useCompareYears();
  const { comparison, institutions, aiNarrative, isLoading, error } = useDeltaData();

  // Construct stats for the row
  // In a real app, this would come from the API or be calculated from comparison data
  // Using mocks or derived data for now if API structure isn't fully known
  const stats = [
    { label: "Total Calls", value: "+198", subValue: "+26% YoY", trend: "up" as const },
    { label: "New Themes", value: "12", subValue: `in ${year2}`, trend: "up" as const },
    { label: "Extinct Themes", value: "8", subValue: `from ${year1}`, trend: "down" as const },
    { label: "Pivoting Inst.", value: "24", subValue: "Changed Top Conviction", trend: "neutral" as const },
  ];

  // Mocking detailed data if hook returns null (waiting for backend)
  // so we can see the UI structure
  const mockSankeyData = {
    nodes: [
        { name: "Inflation" }, { name: "Growth" }, { name: "Geopolitics" }, 
        { name: "Inflation" }, { name: "Growth" }, { name: "AI Infra" }, { name: "De-globalization" }
    ],
    links: [
        { source: 0, target: 3, value: 40 }, // Inflation -> Inflation
        { source: 0, target: 4, value: 20 }, // Inflation -> Growth
        { source: 1, target: 4, value: 50 }, // Growth -> Growth
        { source: 2, target: 6, value: 30 }, // Geopolitics -> De-globalization
        { source: 1, target: 5, value: 10 }, // Growth -> AI Infra
    ]
  };

  const mockShifts = [
      { theme: "AI", rankYear1: 10, rankYear2: 2, delta: 8 },
      { theme: "Recession", rankYear1: 15, rankYear2: 5, delta: 10 },
      { theme: "Inflation", rankYear1: 1, rankYear2: 3, delta: -2 },
      { theme: "Trade War", rankYear1: 5, rankYear2: 20, delta: -15 },
  ];

  const mockPivots = [
      { institution: "Goldman Sachs", themeYear1: "Inflation", themeYear2: "Growth", isPivot: true },
      { institution: "JPMorgan", themeYear1: "Rates", themeYear2: "Credit", isPivot: true },
      { institution: "BlackRock", themeYear1: "AI", themeYear2: "AI", isPivot: false },
      { institution: "Morgan Stanley", themeYear1: "Cyclicals", themeYear2: "Quality", isPivot: true },
  ];

  // Use API data if available, else mock
  const displaySankey = comparison?.sankey || mockSankeyData; 
  const displayShifts = comparison?.shifts || mockShifts;
  const displayPivots = institutions?.pivots || mockPivots; 
  const displayNarrative = aiNarrative?.data || null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Year-over-Year Delta</h1>
            <p className="text-muted-foreground">Comparative analysis of outlooks from {year1} to {year2}</p>
        </div>
        <YearSelector />
      </div>

      {/* Stats Row */}
      <DeltaStatRow stats={stats} />

      {/* AI Narrative */}
      <AiDeltaNarrative narrative={displayNarrative} isLoading={isLoading && !displayNarrative} />

      {/* Theme Migration Flow */}
      <ThemeSankey data={displaySankey} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConvictionShift shifts={displayShifts} />
        <InstitutionPivots pivots={displayPivots} />
      </div>
    </div>
  );
}
