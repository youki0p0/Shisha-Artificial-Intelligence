/**
 * Web search adapter.
 *
 * MVP ships a MOCK adapter. Results are ALWAYS sent to manual review — never
 * auto-registered as inventory or master data.
 *
 * Later, implement WebSearchAdapter against Brave Search API, Google Custom
 * Search, SerpAPI, or site-specific scrapers. Keep the same interface.
 */
import { SearchResult, SearchSource, WebSearchAdapter } from "@/domain/types";
import { newId, nowIso } from "@/lib/ids";

export const defaultSearchSources: SearchSource[] = [
  {
    id: "src_mock",
    name: "Mock Shop",
    baseUrl: "https://example.com/shop",
    enabled: true,
    priority: 1,
    notes: "MVP mock source. Replace with Brave/Google/SerpAPI adapters.",
  },
];

export class MockWebSearchAdapter implements WebSearchAdapter {
  async search(query: string): Promise<SearchResult[]> {
    const now = nowIso();
    return [
      {
        id: newId("sr"),
        query,
        title: `${query} 50g — Mock Shisha Shop`,
        url: `https://example.com/shop/search?q=${encodeURIComponent(query)}`,
        snippet: `${query} の取り扱いページ（モックデータ）。価格・在庫は要確認。`,
        detectedFlavorName: query,
        detectedSize: "50g",
        detectedPrice: 1800,
        detectedStockStatus: "unknown",
        confidence: 0.5,
        status: "new",
        createdAt: now,
      },
    ];
  }
}

export function getWebSearchAdapter(): WebSearchAdapter {
  return new MockWebSearchAdapter();
}
