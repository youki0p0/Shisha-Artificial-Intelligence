export default function Loading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground"
        aria-hidden="true"
      />
      <span className="lisso-mono text-xs uppercase tracking-[0.18em]">Loading…</span>
    </div>
  );
}
