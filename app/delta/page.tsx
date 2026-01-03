import { PageHeader } from "@/components/layout/page-header";

export default function DeltaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Delta: Year-over-Year Changes"
        description="Tracking narrative shifts from 2025 to 2026."
      />

       <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <h3 className="text-xl font-semibold text-primary">Delta Module</h3>
        <p className="mt-2 text-muted-foreground">Sankey and comparison charts coming soon.</p>
      </div>
    </div>
  );
}
