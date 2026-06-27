# LISSO Mixology Knowledge

> The design philosophy behind ShishaOS. This document is the human-readable
> ontology that the **CSV flavor master** (`src/data/master/flavor_master.csv`)
> and the **deterministic derivation spec** (`src/data/master/derivation_spec.json`)
> encode as data. ShishaOS is a port of the "Lisso Mixology GPT" to a **no-AI,
> weight-based, DB-driven, login-gated multi-user** web service: the same
> mixology intelligence, expressed as scored vectors instead of an LLM.

ShishaOS treats a shisha not as a flavor but as a medium that reproduces
**space, memory, temperature, humidity, time-evolution, texture, nose_finish,
salinity and realism** as smoke.

A Mix is designed by **"what space does it make you inhale"**, not "what flavor".

**Design priority:** 1. space → 2. temperature → 3. texture → 4. nose_finish →
5. salinity → 6. realism → 7. time-evolution → 8. taste.

---

## Inventory constraint (the DB is the only flavor source)

- Always select from inventory that exists in the CSV master.
- Never invent a flavor that is not in the DB.
- Out-of-inventory flavors are usable only when the user explicitly allows it.

The inventory CSV is the **single source of truth** for flavors.

---

## Brand policy

**Preferred (everyday mixes)** — used as `body` / `top` / `binder` / `booster`:
Al Fakher, LIRRA, Serbetli, JiBiAR.

**De-emphasized (only on explicit request)** — high nicotine load, heavy
texture, strong realism, harder for general guests: BONCHE, Troffimofs,
BLACKBURN, Satyr, DarkSide, MustHave, and other dark / cigar lines.

**Adoption order when proposing a mix:** AF → Serbetli → LIRRA → JiBiAR → others.

Dark / cigar lines may be used actively only for: competition, gastronomy,
"heavy", "Russian-style", "cigar", "dark blend", "concept", or
"realism-focused" requests.

### Brand roles

- **Al Fakher** — the standard / foundation / clarity: citrus, mint, fruit, classic.
- **Serbetli** — bright juice, humidity, drink-like: juice, soda, dessert.
- **LIRRA** — texture, bakery, cream: biscuit, ice cream, caramel.
- **JiBiAR** — accent, beverage reproduction, freshness.

### Usage limits

- **BONCHE** — salinity / texture / realism support only, ~0.2–1.5g. Never the lead.
- **Troffimofs / cigar leaf** — realism / roast / nicotine too strong; only for
  competition, gastro, reproduction mixes.

---

## texture (body of the smoke — density, viscosity, air)

- **airy** — light, airy, hotel lobby, cool air.
- **oily** — fat, egg yolk, nuts, weight.
- **watery** — transparency, water, juice, humidity.
- **sticky** — viscosity, syrup, condensed milk, caramel.
- **powdery** — powder, baked goods, dryness.
- **dry** — dryness, wood, tea, smoke.
- **silky** — soft smoke, milk fat, luxury.

## nose_finish (the final impression on the nose — more important than taste)

- **white floral** — white flowers, hotel, perfume.
- **mineral** — mineral, air-conditioning, metal.
- **wet salt** — wet salt, sea breeze, olive.
- **roast** — roast, char, coffee.
- **green herb** — green plants, leaves, stems.
- **dry tea** — dry tea leaf, high-end hotel.
- **citrus peel** — citrus peel, sour finish.

## sweetness_type (plain "sweet" is forbidden)

- **fruit sugar** — fructose, juice.
- **condensed milk** — condensed milk, pudding, milk fat.
- **burnt sugar** — caramel, char.
- **candy** — cheap candy, artificial.
- **syrup** — syrup, heavy sweetness.
- **artificial sweetener** — energy drink, soda.
- **baked sweetness** — baked goods, cookies.

## salinity (salt = outline / mineral / sweetness-reset / 3D of the smoke)

- **wet sea salt** — seawater, olive.
- **dry mineral** — dry mineral.
- **green mineral** — green-plant mineral.
- **roast mineral** — roasted bitter mineral.
- **acid mineral** — acidity-derived outline.

## realism (degree of real-world reproduction)

- **realistic** — close to the real thing.
- **semi-real** — between real and flavoring.
- **flavoring** — flavoring-leaning.
- **perfume** — perfume, spatial.

## heat_style (reaction to heat)

- **top burst** — early-onset. · **quick heat burst** — high-temp instant.
- **low heat stable** — low-temp sustain. · **heat stable** — stable.
- **cooling burst** — cool instant. · **late opener** — blooms late.

---

## Time-evolution & layers

A mix must change across **opening** (first impression / clarity), **middle**
(the body / worldview) and **late** (memory / lingering / competition score).

- **Bottom layer** — roast, base, salinity, realism (the foundation of time-evolution).
- **Middle layer** — body, binder, humidity (the mix body).
- **Top layer** — top, cooling, spark, floral (first impression).

## role (a function in the mix, not a taste)

booster (acid / outline / stimulus) · binder (glue) · body · salinity ·
humidity · texture · floral · roast · spark (opening stimulus) ·
shadow (depth / darkness) · air · cooling · realism.

---

## Style doctrines

- **Hotel** — Earl Grey, Jasmine, Olive, Pear, Basil. The point is the
  "air-conditioning feel": white florals, mineral, cool air, tea, stillness.
- **Gastro** — prioritise salinity, roast, bitterness, humidity, texture.
  Sweetness is a support.
- **Competition** — opening clear, middle changes, late stays in memory.
- **Pudding** — not "egg" but cold milk-fat, custard humidity, caramel, egg
  membrane, refrigerator feel.

## Prohibitions

Sweet-only · parallel fruits · too many duplicate roles · all-opening type ·
all high-volatility · excessive cooling · no salinity · no texture design.

## Final principle

A mix makes you inhale **memory, space and time** — not flavor.
