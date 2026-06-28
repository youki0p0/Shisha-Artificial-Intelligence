/**
 * Minimal, dependency-free CSV parser for the curated flavor master file.
 *
 * The curated CSV uses no embedded commas (descriptors are separated with
 * " / " or spaces), but we still handle RFC-4180 quoting defensively so an
 * edited file with quoted cells keeps loading.
 */
import {
  CSV_ROLE,
  FADE_SPEED,
  FlavorProfile,
  flavorProfileSchema,
  HEAT_RESISTANCE,
  LEVELS,
  OPENING_SPEED,
  PEAK_TIME,
  REALISM,
} from "./flavorProfile";

/** Split a single CSV line into fields, honoring double-quote escaping. */
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function cell(value: string | undefined): string | null {
  const v = (value ?? "").trim();
  return v === "" ? null : v;
}

function num(value: string | undefined): number | null {
  const v = cell(value);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Constrain a raw cell to one of an allowed set, else null. */
function oneOf<T extends readonly string[]>(
  value: string | undefined,
  allowed: T,
): T[number] | null {
  const v = cell(value);
  return v !== null && (allowed as readonly string[]).includes(v)
    ? (v as T[number])
    : null;
}

/**
 * Parse the curated flavor-master CSV text into validated FlavorProfile rows.
 * Rows missing both brand and flavor are skipped (trailing blank lines).
 */
export function parseFlavorMasterCsv(text: string): FlavorProfile[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const header = splitLine(lines[0]).map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const col = {
    brand: idx("brand"),
    flavor: idx("flavor"),
    nicotine: idx("nicotine"),
    intensity: idx("intensity"),
    main_notes: idx("main_notes"),
    sub_notes: idx("sub_notes"),
    volatility: idx("volatility"),
    syrup: idx("syrup"),
    heat_resistance: idx("heat_resistance"),
    role: idx("role"),
    memo: idx("memo"),
    opening_speed: idx("opening_speed"),
    peak_time: idx("peak_time"),
    fade_speed: idx("fade_speed"),
    heat_style: idx("heat_style"),
    texture: idx("texture"),
    nose_finish: idx("nose_finish"),
    sweetness_type: idx("sweetness_type"),
    salinity_type: idx("salinity_type"),
    realism: idx("realism"),
    expanded_role: idx("expanded_role"),
    notes: idx("notes"),
  };

  const rows: FlavorProfile[] = [];
  for (let i = 1; i < lines.length; i++) {
    const f = splitLine(lines[i]);
    const brand = cell(f[col.brand]);
    const flavor = cell(f[col.flavor]);
    if (!brand || !flavor) continue;

    const profile: FlavorProfile = {
      brand,
      flavor,
      nicotine: num(f[col.nicotine]),
      intensity: num(f[col.intensity]),
      main_notes: cell(f[col.main_notes]),
      sub_notes: cell(f[col.sub_notes]),
      volatility: oneOf(f[col.volatility], LEVELS),
      syrup: oneOf(f[col.syrup], LEVELS),
      heat_resistance: oneOf(f[col.heat_resistance], HEAT_RESISTANCE),
      role: oneOf(f[col.role], CSV_ROLE),
      memo: cell(f[col.memo]),
      opening_speed: oneOf(f[col.opening_speed], OPENING_SPEED),
      peak_time: oneOf(f[col.peak_time], PEAK_TIME),
      fade_speed: oneOf(f[col.fade_speed], FADE_SPEED),
      heat_style: cell(f[col.heat_style]),
      texture: cell(f[col.texture]),
      nose_finish: cell(f[col.nose_finish]),
      sweetness_type: cell(f[col.sweetness_type]),
      salinity_type: cell(f[col.salinity_type]),
      realism: oneOf(f[col.realism], REALISM),
      expanded_role: cell(f[col.expanded_role]),
      notes: cell(f[col.notes]),
    };
    rows.push(flavorProfileSchema.parse(profile));
  }
  return rows;
}
