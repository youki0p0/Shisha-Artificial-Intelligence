import { describe, expect, it } from "vitest";
import { parseIntent } from "./parser";
import { seedTasteWords } from "@/data/seed/tasteWords";

const parse = (input: string) => parseIntent(input, seedTasteWords);

describe("LocalIntentParser", () => {
  it("甘すぎないホテル系: caps sweetness and boosts luxury, no AI", () => {
    const intent = parse("甘すぎないホテル系");
    expect(intent.constraints.sweetnessMax).toBe(3);
    expect(intent.vector.luxury).toBeGreaterThanOrEqual(5);
    expect(intent.preferredTags).toEqual(
      expect.arrayContaining(["hotel"]),
    );
    expect(intent.confidence).toBeGreaterThanOrEqual(0.5);
    expect(intent.shouldUseAiFallback).toBe(false);
  });

  it("水っぽくて軽い: high wetness, low body cap, no AI", () => {
    const intent = parse("水っぽくて軽い");
    expect(intent.vector.wetness).toBeGreaterThanOrEqual(4);
    expect(intent.vector.freshness).toBeGreaterThanOrEqual(2);
    expect(intent.constraints.bodyMax).toBeLessThanOrEqual(3);
    expect(intent.shouldUseAiFallback).toBe(false);
  });

  it("ゲロ甘: maximal sweetness with body, dessert/cream tags", () => {
    const intent = parse("ゲロ甘");
    expect(intent.vector.sweetness).toBeGreaterThanOrEqual(6);
    expect(intent.vector.body).toBeGreaterThanOrEqual(3);
    expect(intent.preferredTags).toEqual(
      expect.arrayContaining(["dessert"]),
    );
  });

  it("コーラドラゴンを活かした大人っぽいやつ: cola preferred, lower sweetness, no AI", () => {
    const intent = parse("コーラドラゴンを活かした大人っぽいやつ");
    expect(intent.preferredRoles).toEqual(expect.arrayContaining(["cola"]));
    expect(intent.constraints.sweetnessMax).toBeLessThanOrEqual(5);
    expect(intent.preferredTags).toEqual(
      expect.arrayContaining(["structure"]),
    );
    expect(intent.shouldUseAiFallback).toBe(false);
  });

  it("冷たくない overrides 清涼感 (avoids cooling)", () => {
    const intent = parse("冷たくない甘いやつ");
    expect(intent.constraints.coolingMax).toBeLessThanOrEqual(2);
    expect(intent.avoidRoles).toEqual(expect.arrayContaining(["cooling"]));
  });

  it("gibberish with no taste words flags AI fallback but still returns a result", () => {
    const intent = parse("ふがほげぴよ");
    expect(intent.matchedKeywords.length).toBe(0);
    expect(intent.confidence).toBeLessThan(0.5);
    expect(intent.shouldUseAiFallback).toBe(true);
    expect(intent.vector).toBeDefined();
  });

  it("high-confidence multi-word request never requests AI", () => {
    const intent = parse("初心者向けの甘いフルーツ系");
    expect(intent.matchedKeywords.length).toBeGreaterThanOrEqual(2);
    expect(intent.shouldUseAiFallback).toBe(false);
  });
});
