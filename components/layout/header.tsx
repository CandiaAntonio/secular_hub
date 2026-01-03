export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="font-semibold text-lg">Secular Forum 2026</div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>May 2026</span>
        <div className="h-4 w-[1px] bg-border" />
        <span>FLAR Investment Team</span>
      </div>
    </header>
  );
}
