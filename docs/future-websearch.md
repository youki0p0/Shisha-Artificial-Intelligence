# Future: connecting a Web Search API

Web search is used only to help users **find purchase URLs / availability /
candidate product pages**. Results are **always** sent to manual review and are
**never** auto-registered as inventory or master data.

## Where it plugs in

- Interface: `WebSearchAdapter` in `src/domain/types.ts`:
  ```ts
  interface WebSearchAdapter { search(query: string): Promise<SearchResult[]>; }
  ```
- Default: `MockWebSearchAdapter` (`src/adapters/webSearch.ts`).
- Sources are described by `SearchSource` (id/name/baseUrl/enabled/priority).

## Example: Brave Search API

```ts
import { SearchResult, WebSearchAdapter } from "@/domain/types";
import { newId, nowIso } from "@/lib/ids";

export class BraveSearchAdapter implements WebSearchAdapter {
  constructor(private apiKey = process.env.BRAVE_API_KEY!) {}

  async search(query: string): Promise<SearchResult[]> {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
      { headers: { "X-Subscription-Token": this.apiKey } },
    );
    const data = await res.json();
    return (data.web?.results ?? []).map((r: any) => ({
      id: newId("sr"),
      query,
      title: r.title,
      url: r.url,
      snippet: r.description,
      confidence: 0.4, // raw web result — low trust until reviewed
      status: "new",
      createdAt: nowIso(),
    }));
  }
}
```

Swap `getWebSearchAdapter()` to return the real adapter (behind an env flag).

## Other providers

- **Google Custom Search API** — needs `key` + `cx`; map `items[]`.
- **SerpAPI** — `engine=google`; map `organic_results[]`.
- **Site-specific adapters** — for known shisha shops, parse product pages to
  fill `detectedBrand / detectedFlavorName / detectedSize / detectedPrice /
  detectedStockStatus`, then run them through `matchText` for a match candidate.

## Rules

- Run every result through `matchText` (`src/engines/matcher.ts`) to attach a
  `matchedExistingFlavorId` candidate + confidence.
- Present results in a review UI exactly like photo import; require an explicit
  user action to add anything to inventory.
- Respect provider rate limits and terms; cache where allowed.
