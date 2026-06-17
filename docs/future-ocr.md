# Future: connecting a real OCR adapter

The app depends only on the `OcrAdapter` interface (`src/domain/types.ts`):

```ts
interface OcrAdapter {
  extractText(imageUrl: string): Promise<OcrResult>;
}
type OcrResult = {
  rawText: string;
  blocks: OcrTextBlock[]; // { text, confidence, boundingBox? }
  confidence: number;
};
```

`src/adapters/ocr.ts` currently exports `MockOcrAdapter` via `getOcrAdapter()`.
To use a real engine, implement the interface and return it from
`getOcrAdapter()` (ideally gated behind an env var so the mock stays available
for tests).

## Example: Google Cloud Vision

```ts
import vision from "@google-cloud/vision";
import { OcrAdapter, OcrResult } from "@/domain/types";

export class GoogleVisionOcrAdapter implements OcrAdapter {
  private client = new vision.ImageAnnotatorClient();

  async extractText(imageUrl: string): Promise<OcrResult> {
    const [res] = await this.client.textDetection(imageUrl);
    const annotations = res.textAnnotations ?? [];
    const full = annotations[0]; // first entry is the whole block
    const blocks = annotations.slice(1).map((a) => ({
      text: a.description ?? "",
      confidence: a.confidence ?? 0.8,
      boundingBox: toBox(a.boundingPoly),
    }));
    return {
      rawText: full?.description ?? "",
      blocks,
      confidence: avg(blocks.map((b) => b.confidence)),
    };
  }
}
```

```ts
// getOcrAdapter()
export function getOcrAdapter(): OcrAdapter {
  if (process.env.OCR_PROVIDER === "google") return new GoogleVisionOcrAdapter();
  return new MockOcrAdapter();
}
```

## Notes

- The downstream pipeline (`matchText`, the review UI, approval) is unchanged —
  it already treats every block as a low-trust candidate.
- For Japanese labels, prefer `DOCUMENT_TEXT_DETECTION` and pass a language hint
  (`ja`, `en`).
- File upload: add a real upload route (e.g. Vercel Blob / S3) and pass the
  resulting URL to `startPhotoImportAction` instead of the mock URL.
- Keep OCR confidence × DB-match confidence combined (already done in
  `startPhotoImportAction`) so the review UI can sort the riskiest items first.
