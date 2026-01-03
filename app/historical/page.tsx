import { PageHeader } from "@/components/layout/page-header";

export default function HistoricalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Analysis"
        description="Longitudinal view of themes (2019-2026)."
      />

      <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <h3 className="text-xl font-semibold text-muted-foreground">Phase 2</h3>
        <p className="mt-2 text-muted-foreground">Historical data exploration will be available in the next release.</p>
      </div>
    </div>
  );
}
