# Plan: Executive Overview Module Updates

> [!IMPORTANT]
> This plan updates the Executive Overview to be fully database-driven for narratives and subtitles, ensures specific ordering for years and themes, and matches the user's specific content requirements.

## 1. Data Storage Approach

Since we only have 8 years of mostly static editorial content, we'll use a simple TypeScript constant rather than a database table. This avoids migration complexity while keeping content easily editable.

### New File: `lib/data/yearly-briefings.ts`

```typescript
export interface YearlyBriefing {
  subtitle: string;
  narrative: string;
}

export const YEARLY_BRIEFINGS: Record<number, YearlyBriefing> = {
  2026: {
    subtitle: "Capex + Policy Equal Growth",
    narrative: "Wall Street is modestly optimistic about 2026, with capital expenditure and supportive policy driving growth expectations.",
  },
  2025: {
    subtitle: "Inflation Watch Continues",
    narrative: "Markets remain focused on inflation trajectory and Fed policy normalization.",
  },
  // ... other years with fallback generation for missing entries
};

export function getYearlyBriefing(year: number): YearlyBriefing | null {
  return YEARLY_BRIEFINGS[year] ?? null;
}
```

## 2. API Updates

### GET /api/overview

Update the `OverviewResponse` interface to include:
1. **yearRange**: Array of available years for selector (2026→2019)
2. **briefing**: Editorial subtitle + narrative from constants
3. **topThemes**: Top 5 themes ordered by rank (using corrected Prisma query)

**Updated Response Interface:**
```typescript
interface OverviewResponse {
  year: number;
  yearRange: number[];                    // [2026, 2025, ..., 2019]
  briefing: {
    subtitle: string;
    narrative: string;
  } | null;
  topThemes: Array<{
    theme: string;
    count: number;
  }>;
  // Existing fields (keep):
  convictionIndex: number;
  convictionLabel: "High Conviction" | "Moderate Consensus" | "Fragmented Views";
  institutionCount: number;
  prevYearInstitutionCount: number | null;
  totalCalls: number;
  // Removed (consolidated into topThemes):
  // - briefingThemes
  // - topSecularTheme
  // - dominantMacroDriver
}
```

**Corrected Prisma Query for topThemes:**
```typescript
// Using groupBy to get distinct themes with proper ordering
const topThemes = await prisma.outlookCall.groupBy({
  by: ['theme'],
  where: { year },
  _count: { theme: true },
  orderBy: { _count: { theme: 'desc' } },
  take: 5,
});
```

## 3. Component Updates

### `components/overview/year-select.tsx`
- **Reverse Order**: Years listed 2026 → 2019 (newest first)
- **Default**: 2026

### `components/overview/executive-briefing.tsx`
- **Eyebrow**: Display year as small label (e.g., "2026")
- **Main Heading**: Display subtitle (e.g., "Capex + Policy Equal Growth")
- **Narrative**: Display paragraph below heading
- **Themes**: Display top 5 themes as badges/tags

**Layout:**
```
[2026]                          <- eyebrow (small, muted)
Capex + Policy Equal Growth     <- main heading (large, bold)

Wall Street is modestly...      <- narrative paragraph

[AI] [Growth] [Bonds] ...       <- theme badges
```

### Fallback Handling
When no briefing exists for a year:
```typescript
const fallbackBriefing = {
  subtitle: `${year} Market Outlook`,
  narrative: `Analysis based on ${totalCalls} outlook calls from ${institutionCount} institutions.`
};
```

## 4. Implementation Steps

1. **Create briefings data file**:
   - Create `lib/data/yearly-briefings.ts` with constants

2. **Update queries**:
   - Modify `lib/db/queries.ts` to update `OverviewResponse` interface
   - Simplify to use `topThemes` instead of multiple theme fields
   - Add `yearRange` to response

3. **Update API route**:
   - Update `app/api/overview/route.ts` to include briefing data

4. **Update components**:
   - Update `ExecutiveBriefing` to use new layout (year eyebrow + subtitle heading)
   - Update `YearSelect` to sort years descending
   - Remove unused analytics tiles (topSecularTheme, dominantMacroDriver)

5. **Verification**:
   - Verify 2026 shows "Capex + Policy Equal Growth"
   - Verify narrative displays correctly
   - Verify top 5 themes match database counts
   - Verify year selector is 2026 → 2019
