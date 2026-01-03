import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function SnapshotPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Snapshot: The 2026 Consensus"
        description="Current year's dominant themes and institutional positioning."
      >
        <Button>Download Report</Button>
      </PageHeader>
      
      <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <h3 className="text-xl font-semibold text-primary">Snapshot Module</h3>
        <p className="mt-2 text-muted-foreground">Detailed visualizations coming soon.</p>
        <div className="mt-8 flex gap-4">
             {/* Placeholders for chart shells */}
             <div className="h-32 w-48 rounded bg-muted animate-pulse" />
             <div className="h-32 w-48 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
