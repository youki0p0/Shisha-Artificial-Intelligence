/**
 * OCR adapter.
 *
 * MVP ships a MOCK adapter that returns plausible Japanese/English shisha
 * shelf text so the whole photo-import pipeline can be exercised end to end.
 *
 * To use a REAL OCR engine later (Google Cloud Vision, AWS Textract,
 * Tesseract.js, etc.), implement `OcrAdapter.extractText` against that engine
 * and swap the export at the bottom of this file. No other code changes.
 */
import { OcrAdapter, OcrResult, OcrTextBlock } from "@/domain/types";

/** Deterministic mock: returns a fixed shelf listing regardless of image. */
export class MockOcrAdapter implements OcrAdapter {
  async extractText(_imageUrl: string): Promise<OcrResult> {
    const lines: Array<[string, number]> = [
      ["Deus Earl Grey 50g", 0.94],
      ["Al Fakher Mint 250g", 0.91],
      ["Adalya Pear 50g", 0.88],
      ["Blackburn Cola Dragon 100g", 0.83],
      ["Serbetli Exotic Lime", 0.77],
      ["ナゾの新作フレーバー 50g", 0.55],
    ];
    const blocks: OcrTextBlock[] = lines.map(([text, confidence], i) => ({
      text,
      confidence,
      boundingBox: { x: 20, y: 40 + i * 60, width: 320, height: 40 },
    }));
    const rawText = blocks.map((b) => b.text).join("\n");
    const confidence =
      blocks.reduce((a, b) => a + b.confidence, 0) / blocks.length;
    return { rawText, blocks, confidence: Number(confidence.toFixed(2)) };
  }
}

/**
 * Example real adapter skeleton (NOT wired up). Shows the integration shape.
 *
 * export class GoogleVisionOcrAdapter implements OcrAdapter {
 *   constructor(private apiKey: string) {}
 *   async extractText(imageUrl: string): Promise<OcrResult> {
 *     // call Vision API, map annotations -> OcrTextBlock[], compute confidence
 *   }
 * }
 */

export function getOcrAdapter(): OcrAdapter {
  // Swap to a real adapter here (gated behind an env var) when ready.
  return new MockOcrAdapter();
}
