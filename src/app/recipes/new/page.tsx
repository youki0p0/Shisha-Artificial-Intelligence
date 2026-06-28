"use client";

import { useState } from "react";
import { Recipe, RecipeMode, TasteIntent } from "@/domain/types";
import {
  IntentSummary,
  MissingAlternative,
  RecipeView,
} from "@/components/RecipeView";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui/primitives";

const EXAMPLES = [
  "甘すぎないホテル系で水っぽいやつ",
  "コーラドラゴンを活かした大人っぽいミックス",
  "初心者向けの甘いフルーツ系",
  "在庫だけで作れる一番うまいやつ",
];

const MODES: { value: RecipeMode; label: string }[] = [
  { value: "inventory_only", label: "在庫のみで作る" },
  { value: "allow_missing", label: "不足品も許可（購入候補を表示）" },
  { value: "beginner", label: "初心者向け" },
  { value: "advanced", label: "上級者 / シーシャ屋モード" },
];

type GenResult = {
  recipe: Recipe;
  intent: TasteIntent;
  missingAlternatives: MissingAlternative[];
  aiUsed: boolean;
};

export default function RecipeGeneratorPage() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [mode, setMode] = useState<RecipeMode>("inventory_only");
  const [totalGram, setTotalGram] = useState(15);
  const [result, setResult] = useState<GenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, mode, totalGram }),
      });
      if (!res.ok) throw new Error(`生成に失敗しました (${res.status})`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!result) return;
    const res = await fetch("/api/recipes/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.recipe),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mixology"
        title="レシピ生成"
        description="日本語のリクエストをローカル解析して、在庫からレシピを生成します（通常はAI不使用）。"
      />

      <Card>
        <CardHeader>
          <CardTitle>リクエスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex}
                size="sm"
                variant="outline"
                onClick={() => setInput(ex)}
                type="button"
              >
                {ex}
              </Button>
            ))}
          </div>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>モード</Label>
              <Select
                value={mode}
                onChange={(e) => setMode(e.target.value as RecipeMode)}
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>合計量 (g)</Label>
              <Select
                value={String(totalGram)}
                onChange={(e) => setTotalGram(Number(e.target.value))}
              >
                {[10, 12, 15, 18, 20].map((g) => (
                  <option key={g} value={g}>
                    {g}g
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button onClick={generate} disabled={loading} type="button">
            {loading ? "生成中..." : "レシピを生成"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <>
          <IntentSummary intent={result.intent} aiUsed={result.aiUsed} />
          <RecipeView
            recipe={result.recipe}
            missingAlternatives={result.missingAlternatives}
          />
          <div className="flex items-center gap-3">
            <Button onClick={save} type="button" disabled={saved}>
              {saved ? "保存しました" : "このレシピを保存"}
            </Button>
            {saved && result.recipe.shareId && (
              <a
                className="text-sm text-primary underline"
                href={`/r/${result.recipe.shareId}`}
              >
                共有リンクを開く
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
