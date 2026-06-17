/**
 * Reseed the JSON store from src/data/seed. Run with: npm run seed
 * Safe to run anytime; it overwrites .data/db.json with fresh seed data.
 */
import { reseed } from "../src/repositories/jsonStore";

reseed()
  .then(() => {
    console.log("Seeded .data/db.json from src/data/seed.");
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
