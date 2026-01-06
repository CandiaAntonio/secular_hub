"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThemeRanking } from '@/lib/db/queries';

// Color scheme: MACRO = Blue tones, THEMATIC = Amber/Orange tones
const MACRO_COLORS: Record<string, string> = {
  'BASE CASE': '#64748b',      // slate-500
  'GROWTH': '#22c55e',         // green-500
  'RECESSION': '#ef4444',      // red-500
  'MONETARY POLICY': '#8b5cf6', // violet-500
  'INFLATION': '#f97316',      // orange-500
  'FISCAL': '#6366f1',         // indigo-500
  'RISKS': '#71717a',          // zinc-500
  'VOLATILITY': '#a855f7',     // purple-500
  'SLOWDOWN': '#eab308',       // yellow-500
  'RATE CUTS': '#06b6d4',      // cyan-500
  'HIGH RATES': '#0ea5e9',     // sky-500
  'PIVOT': '#14b8a6',          // teal-500
  'NEGATIVE RATES': '#3b82f6', // blue-500
  'LIQUIDITY': '#2563eb',      // blue-600
  'SOFT LANDING': '#10b981',   // emerald-500
  'DISINFLATION': '#fb923c',   // orange-400
  'QUANTITATIVE TIGHTENING': '#1d4ed8', // blue-700
  'WAGES': '#f59e0b',          // amber-500
};

const THEMATIC_COLORS: Record<string, string> = {
  'TRADE': '#c026d3',          // fuchsia-600
  'POLITICS': '#db2777',       // pink-600
  'ELECTIONS': '#e11d48',      // rose-600
  'AI': '#7c3aed',             // violet-600
  'COVID': '#dc2626',          // red-600
  'ESG': '#16a34a',            // green-600
  'SUPPLY CHAIN': '#ca8a04',   // yellow-600
  'TARIFFS': '#ea580c',        // orange-600
  'GEOPOLITICS': '#be185d',    // pink-700
  'WAR': '#991b1b',            // red-800
  'BREXIT': '#0284c7',         // sky-600
  'RESHORING': '#059669',      // emerald-600
  'REGULATION': '#4f46e5',     // indigo-600
};

interface BumpChartProps {
  rankings: ThemeRanking[];
  years: number[];
  baseCases: { year: number; subtitle: string }[];
  onThemeSelect?: (theme: string | null) => void;
  selectedTheme?: string | null;
  className?: string;
}

export function BumpChart({
  rankings,
  years,
  baseCases,
  onThemeSelect,
  selectedTheme,
  className
}: BumpChartProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // Build grid data: for each year, get theme at each rank position
  const { gridData, allThemes } = useMemo(() => {
    const gridData: Record<number, Record<number, ThemeRanking | null>> = {};
    const allThemes = new Set<string>();

    years.forEach(year => {
      gridData[year] = {};
      const yearRankings = rankings.filter(r => r.year === year);
      yearRankings.forEach(r => {
        gridData[year][r.rank] = r;
        allThemes.add(r.theme);
      });
    });

    return { gridData, allThemes: Array.from(allThemes) };
  }, [rankings, years]);

  // Get color for a theme
  const getThemeColor = (theme: string, type: 'MACRO' | 'THEMATIC'): string => {
    if (type === 'MACRO') {
      return MACRO_COLORS[theme] || '#3b82f6';
    }
    return THEMATIC_COLORS[theme] || '#f59e0b';
  };

  // Find connections between years for a theme
  const getThemeConnections = (theme: string) => {
    const connections: { fromYear: number; fromRank: number; toYear: number; toRank: number }[] = [];

    for (let i = 0; i < years.length - 1; i++) {
      const year1 = years[i];
      const year2 = years[i + 1];

      const r1 = rankings.find(r => r.year === year1 && r.theme === theme);
      const r2 = rankings.find(r => r.year === year2 && r.theme === theme);

      if (r1 && r2) {
        connections.push({
          fromYear: year1,
          fromRank: r1.rank,
          toYear: year2,
          toRank: r2.rank
        });
      }
    }

    return connections;
  };

  const maxRank = 10;
  const cellWidth = 120;
  const cellHeight = 44;
  const headerHeight = 60;
  const rankLabelWidth = 50;

  const svgWidth = rankLabelWidth + years.length * cellWidth;
  const svgHeight = headerHeight + (maxRank + 1) * cellHeight + 40;

  const getX = (yearIndex: number) => rankLabelWidth + yearIndex * cellWidth + cellWidth / 2;
  const getY = (rank: number) => headerHeight + rank * cellHeight + cellHeight / 2;

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Theme Rankings Over Time</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Bloomberg editorial ranking by relevance (0 = Base Case anchor)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              <span className="text-muted-foreground">Macro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span className="text-muted-foreground">Thematic</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto pb-4">
        <svg width={svgWidth} height={svgHeight} className="min-w-full">
          {/* Header row with years and base cases */}
          {years.map((year, i) => {
            const bc = baseCases.find(b => b.year === year);
            return (
              <g key={year}>
                <text
                  x={getX(i)}
                  y={20}
                  textAnchor="middle"
                  className="fill-foreground font-bold text-sm"
                >
                  {year}
                </text>
                {bc && (
                  <text
                    x={getX(i)}
                    y={38}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {bc.subtitle.length > 16 ? bc.subtitle.slice(0, 16) + '...' : bc.subtitle}
                  </text>
                )}
              </g>
            );
          })}

          {/* Rank labels */}
          {Array.from({ length: maxRank + 1 }, (_, rank) => (
            <text
              key={rank}
              x={rankLabelWidth - 10}
              y={getY(rank) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              {rank === 0 ? 'BASE' : `#${rank}`}
            </text>
          ))}

          {/* Grid lines */}
          {Array.from({ length: maxRank + 1 }, (_, rank) => (
            <line
              key={rank}
              x1={rankLabelWidth}
              y1={getY(rank)}
              x2={svgWidth - 10}
              y2={getY(rank)}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray={rank === 0 ? "none" : "2,2"}
            />
          ))}

          {/* Connection lines for all themes */}
          {allThemes.map(theme => {
            const connections = getThemeConnections(theme);
            const themeData = rankings.find(r => r.theme === theme);
            if (!themeData || connections.length === 0) return null;

            const color = getThemeColor(theme, themeData.type);
            const isHighlighted = selectedTheme === theme || hoveredTheme === theme;
            const isDimmed = (selectedTheme || hoveredTheme) && !isHighlighted;

            return (
              <g key={`connections-${theme}`}>
                {connections.map((conn, i) => {
                  const x1 = getX(years.indexOf(conn.fromYear));
                  const y1 = getY(conn.fromRank);
                  const x2 = getX(years.indexOf(conn.toYear));
                  const y2 = getY(conn.toRank);

                  // Create curved path
                  const midX = (x1 + x2) / 2;

                  return (
                    <path
                      key={i}
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={isHighlighted ? 4 : 2}
                      strokeOpacity={isDimmed ? 0.15 : 0.7}
                      className="transition-all duration-200"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Theme blocks */}
          {years.map((year, yearIndex) => (
            <g key={year}>
              {Array.from({ length: maxRank + 1 }, (_, rank) => {
                const ranking = gridData[year]?.[rank];
                if (!ranking) return null;

                const color = getThemeColor(ranking.theme, ranking.type);
                const isHighlighted = selectedTheme === ranking.theme || hoveredTheme === ranking.theme;
                const isDimmed = (selectedTheme || hoveredTheme) && !isHighlighted;

                const x = getX(yearIndex);
                const y = getY(rank);
                const boxWidth = cellWidth - 12;
                const boxHeight = cellHeight - 8;

                return (
                  <g
                    key={`${year}-${rank}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTheme(ranking.theme)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    onClick={() => onThemeSelect?.(selectedTheme === ranking.theme ? null : ranking.theme)}
                  >
                    <rect
                      x={x - boxWidth / 2}
                      y={y - boxHeight / 2}
                      width={boxWidth}
                      height={boxHeight}
                      rx={4}
                      fill={color}
                      fillOpacity={isDimmed ? 0.2 : isHighlighted ? 1 : 0.85}
                      stroke={isHighlighted ? '#fff' : 'none'}
                      strokeWidth={2}
                      className="transition-all duration-200"
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        "text-[10px] font-semibold pointer-events-none select-none",
                        isDimmed ? "fill-muted-foreground" : "fill-white"
                      )}
                      style={{ textShadow: isDimmed ? 'none' : '0 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {ranking.theme.length > 14 ? ranking.theme.slice(0, 12) + '..' : ranking.theme}
                    </text>
                    {/* Call count badge */}
                    <text
                      x={x + boxWidth / 2 - 4}
                      y={y - boxHeight / 2 + 8}
                      textAnchor="end"
                      className={cn(
                        "text-[8px] pointer-events-none",
                        isDimmed ? "fill-muted-foreground" : "fill-white/70"
                      )}
                    >
                      {ranking.count}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}
