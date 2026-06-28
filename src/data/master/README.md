# Flavor master DB (the core of ShishaOS)

This directory is the **single source of truth** for the flavor database. It
stores flavors in the curated LISSO CSV shape and projects them — with **no AI,
purely by weighted rules** — into the engine's taste model.

## Files

| File | Role |
| --- | --- |
| `flavor_master.csv` | Curated master. 22 sensory columns per flavor (see `docs/mixology_knowledge.md` for the ontology). **Edit this** to change flavor data. |
| `flavorProfile.ts` | Type + Zod schema mirroring the CSV columns 1:1. |
| `parseCsv.ts` | Dependency-free CSV → `FlavorProfile[]` parser (validates each row). |
| `derivation_spec.json` | The weight table: how each CSV column contributes to each engine field / role / tag. Produced by a 4-member design council + judge, then anchor-calibrated. **Tune this** to change the mapping. |
| `derivationSpec.ts` | Types for the spec. |
| `deriveFlavorMaster.ts` | Deterministic `FlavorProfile` → `FlavorMaster` projection (taste vector, roles, tags, layers). |

## Pipeline

```
flavor_master.csv ──parse──▶ FlavorProfile[] ──derive(spec)──▶ FlavorMaster[]
                                                                     │
                            npm run flavors:build  writes  ◀─────────┘
                            src/data/seed/flavors.generated.ts   (committed)
```

The app imports `flavors.generated.ts`, so there is **no filesystem access at
runtime** (serverless-safe) and the result is 100% deterministic: same CSV +
same spec ⇒ same DB, every time.

## Regenerating

After editing `flavor_master.csv` or `derivation_spec.json`:

```bash
npm run flavors:build   # rewrites src/data/seed/flavors.generated.ts
npm run test            # validates bounds, determinism, anchor calibration
```

## Why a derivation spec instead of hand-tuned numbers

The CSV captures *what a curator perceives* (texture, nose_finish, salinity_type,
realism…). The engine needs *numbers* (an 11-dim taste vector + derived fields).
Keeping the mapping as a transparent, hand-tunable weight table means:

- the curator edits the CSV in human terms, never raw vectors;
- the projection is auditable and reproducible (the "weight" the product runs on);
- no LLM is in the loop — the intelligence lives in the data + weights.
