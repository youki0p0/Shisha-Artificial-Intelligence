import { ImageResponse } from "next/og";
import { getRepositories } from "@/repositories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ShishaOS recipe";

/**
 * Load a Japanese font subset (just the glyphs we draw) from Google Fonts so the
 * recipe title renders. Returns null on any failure — the image then falls back
 * to a Latin-only layout instead of throwing.
 */
async function loadJaFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const api = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@600&text=${encodeURIComponent(text)}`;
    const css = await (
      await fetch(api, { headers: { "User-Agent": "Mozilla/5.0" } })
    ).text();
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const recipe = await getRepositories().recipes.getByShareId(shareId);

  const title = recipe?.title ?? "Shisha Recipe";
  const concept = recipe?.concept ?? "";
  const score = recipe?.score ?? 0;
  const flavors = (recipe?.items ?? []).slice(0, 4).map((i) => i.displayName);

  const jaText = title + concept + flavors.join("") + "レシピスコア在庫共有";
  const font = await loadJaFont(jaText);
  const fontFamily = font ? "Noto Sans JP, sans-serif" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(120% 120% at 100% 0%, #16314d 0%, #0c0d0f 55%)",
          color: "#EEF0F1",
          fontFamily,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 30, letterSpacing: 10, fontWeight: 600 }}>LISSO</span>
            <span
              style={{
                width: 16,
                height: 16,
                background: "linear-gradient(140deg,#8aa8cc,#3c6592)",
                transform: "rotate(45deg)",
              }}
            />
            <span style={{ fontSize: 22, letterSpacing: 6, color: "#8fb0d6" }}>SHISHAOS</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid #2a3a4d",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 30,
            }}
          >
            <span style={{ color: "#9DA06F" }}>SCORE</span>
            <span style={{ fontWeight: 600 }}>{score}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: title.length > 22 ? 56 : 72, fontWeight: 600, lineHeight: 1.15 }}>
            {title}
          </div>
          {concept && (
            <div style={{ fontSize: 30, color: "#9aa3ab", display: "flex" }}>{concept}</div>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {flavors.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                fontSize: 24,
                color: "#c9d2da",
                border: "1px solid #2a3a4d",
                borderRadius: 6,
                padding: "8px 16px",
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Noto Sans JP", data: font, weight: 600, style: "normal" }]
        : undefined,
    },
  );
}
