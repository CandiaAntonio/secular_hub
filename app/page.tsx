import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  GitCompare,
  Calendar,
  Building2,
  FileText,
  Tags,
  FolderTree,
  Bookmark,
  Layers
} from "lucide-react";

import { getHomeStats } from "@/lib/db/queries";
import { YEARLY_BRIEFINGS } from "@/lib/data/yearly-briefings";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stats = await getHomeStats();

  // Get year data for timeline
  const yearsData = Object.entries(YEARLY_BRIEFINGS)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, briefing]) => ({
      year: Number(year),
      subtitle: briefing.subtitle,
      narrative: briefing.narrative,
      callCount: stats.years.find(y => y.year === Number(year))?.count || 0
    }));

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Eight Years of Wall Street Consensus
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Secular and cyclical trend context, built from the collection of investment views
              published in annual outlooks by the world&apos;s largest financial institutions.
            </p>
          </div>

          {/* Animated Bull */}
          <div className="flex-shrink-0 hidden md:block">
            <video
              src="/images/Animated_Bull_Eyes_Blink_Only.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-32 w-auto rounded-lg"
            />
          </div>
        </div>

        {/* Key Stats - Macro Top-Down Narrative */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Time Span */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.yearsCount}</span>
            <span className="text-sm text-muted-foreground text-center">Years</span>
            <span className="text-xs text-muted-foreground">2019-2026</span>
          </div>
          {/* Who */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <Building2 className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.institutionsCount}</span>
            <span className="text-sm text-muted-foreground text-center">Institutions</span>
          </div>
          {/* Categories */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <FolderTree className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.themeCategoriesCount}</span>
            <span className="text-sm text-muted-foreground text-center">Categories</span>
          </div>
          {/* Themes */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <Tags className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.themesCount}</span>
            <span className="text-sm text-muted-foreground text-center">Themes</span>
          </div>
          {/* SubThemes */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <Bookmark className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.subThemesCount}</span>
            <span className="text-sm text-muted-foreground text-center">SubThemes</span>
          </div>
          {/* Investment Views */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <FileText className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground text-center">Investment Views</span>
          </div>
        </div>

        {/* Secondary Stats Row - Depth & Participation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="text-xl font-semibold">~{stats.avgViewsPerYear.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Views per Year</div>
            <div className="text-xs text-muted-foreground/70">average</div>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="text-xl font-semibold">~{stats.avgViewsPerInstitution}</div>
            <div className="text-sm text-muted-foreground">per Institution</div>
            <div className="text-xs text-muted-foreground/70">average</div>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="text-xl font-semibold">62</div>
            <div className="text-sm text-muted-foreground">Institutions</div>
            <div className="text-xs text-muted-foreground/70">per year</div>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="text-xl font-semibold">{stats.peakYear}</div>
            <div className="text-sm text-muted-foreground">Peak Coverage</div>
            <div className="text-xs text-muted-foreground/70">{stats.peakYearViews.toLocaleString()} views</div>
          </div>
        </div>
      </section>

      {/* Data Source Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">The Data Source</h2>
        </div>

        <Card className="bg-muted/20">
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Bloomberg&apos;s annual <span className="font-medium text-foreground">&quot;(Almost) Everything Wall Street Expects&quot;</span> compilation
              aggregates investment outlooks from the world&apos;s largest financial institutions.
            </p>

            <div className="bg-background/50 rounded-lg p-4 border">
              <p className="text-sm font-medium mb-3">This is not a prediction model. It&apos;s a historical record of what institutional consensus looked like at each point in time.</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">67 institutions</strong> — Goldman Sachs, BlackRock, JPMorgan, Morgan Stanley, Vanguard, and more</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">~700-900 outlook calls</strong> per year, curated by Bloomberg News</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Editorial conviction ranking</strong> — HIGH, MEDIUM, LOW based on Bloomberg&apos;s assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">8 years of coverage</strong> — 2019 through 2026, capturing multiple market regimes</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Analytical Framework Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">How Consensus is Built</h2>
        </div>

        <div className="space-y-4">
          {/* Pipeline Steps */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Step 1 */}
            <Card className="relative">
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                STEP 1
              </div>
              <CardHeader className="pt-6">
                <CardTitle className="text-lg">Theme Classification</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Every outlook call is tagged to one of <strong className="text-foreground">83 investment themes</strong> —
                AI, Growth, Inflation, Stocks, China, Geopolitics, and more.
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative">
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                STEP 2
              </div>
              <CardHeader className="pt-6">
                <CardTitle className="text-lg">Taxonomy Categorization</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Themes organized into <strong className="text-foreground">6 strategic categories</strong> for structured analysis.
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative">
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                STEP 3
              </div>
              <CardHeader className="pt-6">
                <CardTitle className="text-lg">Conviction Scoring</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Each call rated <strong className="text-foreground">HIGH / MEDIUM / LOW</strong> based on Bloomberg editorial judgment.
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base">The 6 Strategic Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-background rounded-lg border text-center">
                  <div className="font-semibold text-sm">Base Case</div>
                  <div className="text-xs text-muted-foreground mt-1">The consensus scenario</div>
                </div>
                <div className="p-3 bg-background rounded-lg border text-center">
                  <div className="font-semibold text-sm">Topics</div>
                  <div className="text-xs text-muted-foreground mt-1">Macro drivers</div>
                </div>
                <div className="p-3 bg-background rounded-lg border text-center">
                  <div className="font-semibold text-sm">Thematic</div>
                  <div className="text-xs text-muted-foreground mt-1">Secular trends</div>
                </div>
                <div className="p-3 bg-background rounded-lg border text-center">
                  <div className="font-semibold text-sm">Geographies</div>
                  <div className="text-xs text-muted-foreground mt-1">Regional focus</div>
                </div>
                <div className="p-3 bg-background rounded-lg border text-center">
                  <div className="font-semibold text-sm">Asset Classes</div>
                  <div className="text-xs text-muted-foreground mt-1">Allocation signals</div>
                </div>
                <div className="p-3 bg-background rounded-lg border text-center">
                  <div className="font-semibold text-sm">Risks</div>
                  <div className="text-xs text-muted-foreground mt-1">What could go wrong</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold">Consensus Metrics</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-3">
                    <div className="font-medium">Conviction Index</div>
                    <div className="text-sm text-muted-foreground">0-100 score measuring Wall Street alignment</div>
                  </div>
                  <div className="p-3">
                    <div className="font-medium">Theme Concentration</div>
                    <div className="text-sm text-muted-foreground">Where institutional attention clusters</div>
                  </div>
                  <div className="p-3">
                    <div className="font-medium">Year-over-Year Delta</div>
                    <div className="text-sm text-muted-foreground">What&apos;s emerging, fading, or intensifying</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Coverage Timeline Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">Coverage Timeline</h2>
        </div>
        <p className="text-muted-foreground">
          Eight years of market regimes captured — from late-cycle jitters through pandemic shock,
          inflation crisis, and the AI revolution.
        </p>

        <div className="grid gap-3">
          {yearsData.map((yearData, index) => (
            <Link
              key={yearData.year}
              href={`/snapshot?year=${yearData.year}`}
              className="group"
            >
              <Card className={`transition-all hover:bg-muted/50 hover:border-primary/50 ${index === 0 ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardContent className="py-4 px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-bold w-16">{yearData.year}</div>
                      <div className="hidden sm:block h-8 w-px bg-border" />
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {yearData.subtitle}
                        </div>
                        <div className="text-sm text-muted-foreground hidden md:block">
                          {yearData.narrative}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{yearData.callCount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">calls</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">Explore the Data</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Snapshot Module */}
          <Link href="/snapshot" className="group">
            <Card className="h-full transition-all hover:bg-muted/50 hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">Snapshot</CardTitle>
                    <p className="text-sm text-muted-foreground">Single-year deep dive</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore any year&apos;s consensus view — dominant themes, institutional positioning,
                  conviction distribution, and key risks.
                </p>
                <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View Snapshot <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Delta Module */}
          <Link href="/delta" className="group">
            <Card className="h-full transition-all hover:bg-muted/50 hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GitCompare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">Delta</CardTitle>
                    <p className="text-sm text-muted-foreground">Year-over-year comparison</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze how the narrative shifts between years. Identify emerging themes,
                  fading convictions, and institutional pivots.
                </p>
                <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Compare Years <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
