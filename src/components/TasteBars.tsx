import { FlavorMaster, TasteVector } from "@/domain/types";
import { flavorToVector } from "@/domain/taste";

const LABELS: Record<keyof TasteVector, string> = {
  sweetness: "甘味",
  sourness: "酸味",
  cooling: "清涼",
  bitterness: "苦味",
  body: "ボディ",
  wetness: "水分",
  freshness: "爽快",
  luxury: "高級感",
  heaviness: "重さ",
  aftertaste: "余韻",
  structure: "骨格",
};

export function TasteBars({
  flavor,
  vector,
}: {
  flavor?: FlavorMaster;
  vector?: TasteVector;
}) {
  const v = vector ?? (flavor ? flavorToVector(flavor) : undefined);
  if (!v) return null;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {(Object.keys(LABELS) as (keyof TasteVector)[]).map((dim) => (
        <div key={dim} className="flex items-center gap-2 text-xs">
          <span className="w-12 text-muted-foreground">{LABELS[dim]}</span>
          <div className="flex-1 h-[3px] rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-olive-500"
              style={{ width: `${Math.max(0, Math.min(10, v[dim])) * 10}%` }}
            />
          </div>
          <span className="lisso-mono w-5 text-right text-muted-foreground">
            {Math.round(v[dim])}
          </span>
        </div>
      ))}
    </div>
  );
}
