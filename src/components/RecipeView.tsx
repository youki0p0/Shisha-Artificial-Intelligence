import { FlavorMaster, Recipe, TasteIntent } from "@/domain/types";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/primitives";

export type MissingAlternative = {
  missing: FlavorMaster;
  alternatives: FlavorMaster[];
};

export function IntentSummary({
  intent,
  aiUsed,
}: {
  intent: TasteIntent;
  aiUsed?: boolean;
}) {
  const conf = Math.round(intent.confidence * 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle>解析結果（TasteIntent）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={conf >= 80 ? "success" : conf >= 50 ? "warn" : "muted"}>
            信頼度 {conf}%
          </Badge>
          <Badge variant={intent.shouldUseAiFallback ? "warn" : "success"}>
            AIフォールバック: {intent.shouldUseAiFallback ? "候補" : "不要"}
          </Badge>
          <Badge variant={aiUsed ? "warn" : "muted"}>
            AI使用: {aiUsed ? "あり" : "なし（ローカルのみ）"}
          </Badge>
        </div>
        {intent.fallbackReason && (
          <p className="text-xs text-muted-foreground">理由: {intent.fallbackReason}</p>
        )}
        <div>
          <span className="text-muted-foreground">一致キーワード: </span>
          {intent.matchedKeywords.join(", ") || "—"}
        </div>
        {intent.unknownTerms.length > 0 && (
          <div>
            <span className="text-muted-foreground">未知の語（弱タグ扱い）: </span>
            {intent.unknownTerms.join(", ")}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {intent.preferredTags.map((t) => (
            <Badge key={t} variant="outline">
              +{t}
            </Badge>
          ))}
          {intent.avoidTags.map((t) => (
            <Badge key={t} variant="muted">
              −{t}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecipeView({
  recipe,
  missingAlternatives = [],
}: {
  recipe: Recipe;
  missingAlternatives?: MissingAlternative[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle>{recipe.title}</CardTitle>
            <Badge variant="success">score {recipe.score}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{recipe.concept}</p>
          <p className="text-sm">合計 {recipe.totalGram}g</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1">フレーバー</th>
                <th>役割</th>
                <th className="text-right">g</th>
                <th className="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {recipe.items.map((it, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1">
                    {it.displayName}{" "}
                    {it.missing && <Badge variant="warn">未所持</Badge>}
                    <div className="text-xs text-muted-foreground">{it.reason}</div>
                  </td>
                  <td>{it.role}</td>
                  <td className="text-right tabular-nums">{it.grams}</td>
                  <td className="text-right tabular-nums">{it.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>レイヤリング</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Layer title="トップ（上）" items={recipe.layers.top} />
            <Layer title="ミドル（中）" items={recipe.layers.middle} />
            <Layer title="ボトム（下）" items={recipe.layers.bottom} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ヒート管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{recipe.heatManagement.templateName}</p>
            <p className="text-muted-foreground">
              {recipe.heatManagement.bowlType} / {recipe.heatManagement.hmdOrFoil} /{" "}
              {recipe.heatManagement.charcoalType}
            </p>
            <p>開始: {recipe.heatManagement.start}</p>
            <p>10分後: {recipe.heatManagement.after10min}</p>
            <p>25分後: {recipe.heatManagement.after25min}</p>
            <p className="text-xs text-muted-foreground">{recipe.heatManagement.notes}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>フレーバータイムライン</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {recipe.flavorTimeline.phases.map((p) => (
            <div key={p.phase}>
              <span className="font-medium">{p.label}: </span>
              <span className="text-muted-foreground">{p.description}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {recipe.troubleshooting.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>トラブルシューティング</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {recipe.troubleshooting.map((t, i) => (
              <div key={i}>
                <span className="font-medium">{t.symptom}: </span>
                <span className="text-muted-foreground">{t.suggestion}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {missingAlternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>未所持フレーバーの代替案</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {missingAlternatives.map((m) => (
              <div key={m.missing.id}>
                <span className="font-medium">
                  {m.missing.displayNameJa ?? m.missing.name}
                </span>{" "}
                の代わりに:{" "}
                <span className="text-muted-foreground">
                  {m.alternatives
                    .map((a) => a.displayNameJa ?? a.name)
                    .join(" / ") || "在庫に近い代替なし"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>スコア内訳</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
            {Object.entries(recipe.scoreBreakdown).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Layer({
  title,
  items,
}: {
  title: string;
  items: { displayName: string; grams: number; reason: string }[];
}) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-xs">—</p>
      ) : (
        items.map((it, i) => (
          <p key={i} className="text-xs text-muted-foreground">
            {it.displayName} ({it.grams}g) — {it.reason}
          </p>
        ))
      )}
    </div>
  );
}
