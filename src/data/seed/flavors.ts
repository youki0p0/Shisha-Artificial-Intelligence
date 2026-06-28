/**
 * FlavorMaster seed.
 *
 * The curated LISSO CSV (`src/data/master/flavor_master.csv`) is the single
 * source of truth for the flavor DB. These records are produced deterministically
 * from that CSV by `npm run flavors:build` (see scripts/buildFlavorMaster.ts) and
 * committed as `flavors.generated.ts`. Do not hand-edit the numbers — edit the
 * CSV or `derivation_spec.json` and regenerate.
 */
export { generatedFlavors as seedFlavors } from "./flavors.generated";
