/**
 * Low-level JSON-file store for the MVP.
 *
 * - Bootstraps from seed data on first run.
 * - Holds an in-memory copy and best-effort persists to disk on writes.
 *
 * Serverless note (Vercel et al.): the deployment filesystem is read-only
 * except for a temp dir, and instances are ephemeral. So:
 *   - we write to a writable location (os.tmpdir() on serverless, ./.data locally), and
 *   - persistence is BEST-EFFORT: if the FS is read-only, we keep an in-memory
 *     DB seeded from src/data/seed instead of crashing. Reads work; writes live
 *     only for the lifetime of the instance. For durable multi-user storage,
 *     migrate to Postgres/Supabase (see docs/future-db-migration.md).
 *
 * To migrate to a real DB, replace this file's read/write with SQL calls and
 * keep the repository interfaces in types.ts unchanged.
 */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildSeedDatabase, Database } from "@/data/seed";

/**
 * Choose a writable data directory:
 *  - explicit override via SFOS_DATA_DIR
 *  - a temp dir on serverless (Vercel sets process.env.VERCEL)
 *  - ./.data for local dev
 */
const DATA_DIR =
  process.env.SFOS_DATA_DIR ??
  (process.env.VERCEL
    ? path.join(os.tmpdir(), "sfos-data")
    : path.join(process.cwd(), ".data"));
const DB_PATH = path.join(DATA_DIR, "db.json");

let cache: Database | null = null;
let writeQueue: Promise<void> = Promise.resolve();
/** Set to false once we learn the filesystem isn't writable. */
let persistenceAvailable = true;

async function loadFromDisk(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    // No file yet (or unreadable): start from seed and TRY to persist. If the
    // filesystem is read-only (serverless), fall back to in-memory only.
    const seeded = buildSeedDatabase();
    await persist(seeded);
    return seeded;
  }
}

/** Best-effort persist. Never throws — a read-only FS just disables writes. */
async function persist(db: Database): Promise<void> {
  if (!persistenceAvailable) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // Read-only filesystem (e.g. Vercel) — degrade gracefully to in-memory.
    persistenceAvailable = false;
  }
}

/** Get the (lazily loaded) in-memory database. */
export async function getDb(): Promise<Database> {
  if (!cache) {
    cache = await loadFromDisk();
  }
  return cache;
}

/**
 * Mutate the database safely and best-effort persist. Writes are serialised so
 * concurrent server actions don't clobber the file.
 */
export async function mutate<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const db = await getDb();
  const result = await fn(db);
  writeQueue = writeQueue.then(() => persist(db)).catch(() => {});
  await writeQueue;
  return result;
}

/** Force a reseed (used by scripts/seed.ts and tests). */
export async function reseed(): Promise<void> {
  cache = buildSeedDatabase();
  await persist(cache);
}
