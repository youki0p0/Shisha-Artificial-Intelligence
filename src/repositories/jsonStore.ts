/**
 * Low-level JSON-file store for the MVP.
 *
 * - Bootstraps from seed data on first run (writes .data/db.json).
 * - Holds an in-memory copy and persists on every write.
 * - Single-process only (fine for MVP / single Vercel instance dev).
 *
 * To migrate to a real DB, replace this file's read/write with SQL calls and
 * keep the repository interfaces in types.ts unchanged.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildSeedDatabase, Database } from "@/data/seed";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");

let cache: Database | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function loadFromDisk(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    const seeded = buildSeedDatabase();
    await persist(seeded);
    return seeded;
  }
}

async function persist(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

/** Get the (lazily loaded) in-memory database. */
export async function getDb(): Promise<Database> {
  if (!cache) {
    cache = await loadFromDisk();
  }
  return cache;
}

/**
 * Mutate the database safely and persist. Writes are serialised so concurrent
 * server actions don't clobber the file.
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
