"use client";

import { Button } from "@/components/ui/primitives";

/** Triggers the browser print dialog (Save as PDF) for the pay statement. */
export function PrintButton({ label = "印刷 / PDF" }: { label?: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
