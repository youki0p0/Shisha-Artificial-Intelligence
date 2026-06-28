"use server";

/**
 * Server actions for mutations. These enforce the "review before confirm"
 * philosophy: OCR / web results are written as *pending candidates*, and only
 * an explicit user action promotes them to confirmed inventory.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  manualInventoryInputSchema,
  masterSubmissionInputSchema,
} from "@/domain/schemas";
import {
  InventoryStatus,
  PhotoDetectedItem,
  UserInventoryItem,
} from "@/domain/types";
import { getRepositories } from "@/repositories";
import {
  getCurrentUser,
  getCurrentUserId,
  isAdmin,
  isCuratorOrAdmin,
} from "@/lib/auth";
import { newId, nowIso } from "@/lib/ids";
import { isMonthKey } from "@/lib/wages";
import { WageEntry } from "@/domain/types";
import { getOcrAdapter } from "@/adapters/ocr";
import { matchText } from "@/engines/matcher";

// --- Manual inventory -------------------------------------------------------

export async function addManualInventoryAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const repos = getRepositories();

  const parsed = manualInventoryInputSchema.parse({
    flavorMasterId: emptyToUndef(formData.get("flavorMasterId")),
    customBrand: emptyToUndef(formData.get("customBrand")),
    customName: emptyToUndef(formData.get("customName")),
    amountGram: emptyToUndef(formData.get("amountGram")),
    status: formData.get("status") || "in_stock",
    purchaseUrl: emptyToUndef(formData.get("purchaseUrl")),
    memo: emptyToUndef(formData.get("memo")),
  });

  const item: UserInventoryItem = {
    id: newId("inv"),
    userId,
    flavorMasterId: parsed.flavorMasterId,
    customBrand: parsed.customBrand,
    customName: parsed.customName,
    amountGram: parsed.amountGram,
    status: parsed.status,
    purchaseUrl: parsed.purchaseUrl || undefined,
    memo: parsed.memo,
    source: "manual",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await repos.inventory.create(item);

  // Optionally submit unknown flavor to the master review queue.
  if (!parsed.flavorMasterId && formData.get("submitMaster") === "on") {
    await repos.masterSubmissions.create({
      id: newId("sub"),
      userId,
      brandName: parsed.customBrand ?? "(unknown)",
      flavorName: parsed.customName ?? "(unknown)",
      purchaseUrl: parsed.purchaseUrl || undefined,
      memo: parsed.memo,
      status: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  revalidatePath("/inventory");
  revalidatePath("/");
}

export async function updateInventoryStatusAction(formData: FormData) {
  const repos = getRepositories();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as InventoryStatus;
  await repos.inventory.update(id, { status });
  revalidatePath("/inventory");
}

export async function removeInventoryAction(formData: FormData) {
  const repos = getRepositories();
  await repos.inventory.remove(String(formData.get("id")));
  revalidatePath("/inventory");
}

// --- Photo import -----------------------------------------------------------

/**
 * Creates a photo-import session, runs the (mock) OCR adapter, matches each
 * line against FlavorMaster, and stores detected items as PENDING. Nothing is
 * added to inventory yet — the review UI handles that.
 */
export async function startPhotoImportAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const repos = getRepositories();
  const imageUrl = String(formData.get("imageUrl") || "mock://uploaded-shelf.jpg");

  const session = await repos.photoImport.createSession({
    id: newId("pis"),
    userId,
    imageUrl,
    status: "processing",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  const ocr = await getOcrAdapter().extractText(imageUrl);
  const [brands, flavors] = await Promise.all([
    repos.brands.list(),
    repos.flavors.list(),
  ]);

  for (const block of ocr.blocks) {
    const match = matchText(block.text, brands, flavors);
    const item: PhotoDetectedItem = {
      id: newId("pdi"),
      sessionId: session.id,
      rawText: block.text,
      detectedBrand: match.detectedBrand,
      detectedFlavorName: match.detectedFlavorName,
      detectedAmountGram: match.detectedAmountGram,
      matchedFlavorMasterId: match.matchedFlavorMasterId,
      // Combine OCR block confidence with DB match confidence.
      matchConfidence: Number(
        ((block.confidence + match.matchConfidence) / 2).toFixed(2),
      ),
      status: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await repos.photoImport.createItem(item);
  }

  await repos.photoImport.updateSession(session.id, {
    status: "review_required",
    detectedText: ocr.rawText,
    ocrConfidence: ocr.confidence,
  });

  redirect(`/photo-import/${session.id}`);
}

/** Approve a detected item -> creates a confirmed inventory item (source=photo_import). */
export async function approveDetectedItemAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const repos = getRepositories();
  const itemId = String(formData.get("itemId"));
  const sessionId = String(formData.get("sessionId"));

  const items = await repos.photoImport.listItemsBySession(sessionId);
  const item = items.find((i) => i.id === itemId);
  if (!item) return;

  // Allow inline edits from the review form to override detection.
  const flavorMasterId =
    emptyToUndef(formData.get("matchedFlavorMasterId")) ??
    item.matchedFlavorMasterId;
  const customName =
    emptyToUndef(formData.get("detectedFlavorName")) ?? item.detectedFlavorName;
  const customBrand =
    emptyToUndef(formData.get("detectedBrand")) ?? item.detectedBrand;
  const amountGram = emptyToUndef(formData.get("detectedAmountGram"));

  await repos.inventory.create({
    id: newId("inv"),
    userId,
    flavorMasterId: flavorMasterId || undefined,
    customBrand: flavorMasterId ? undefined : customBrand,
    customName: flavorMasterId ? undefined : customName,
    amountGram: amountGram ? Number(amountGram) : item.detectedAmountGram,
    status: "in_stock",
    source: "photo_import",
    confidence: item.matchConfidence,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  await repos.photoImport.updateItem(itemId, { status: "approved" });
  revalidatePath(`/photo-import/${sessionId}`);
}

export async function ignoreDetectedItemAction(formData: FormData) {
  const repos = getRepositories();
  const itemId = String(formData.get("itemId"));
  const sessionId = String(formData.get("sessionId"));
  await repos.photoImport.updateItem(itemId, { status: "ignored" });
  revalidatePath(`/photo-import/${sessionId}`);
}

// --- Master submission ------------------------------------------------------

export async function submitMasterAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const repos = getRepositories();
  const parsed = masterSubmissionInputSchema.parse({
    brandName: formData.get("brandName"),
    flavorName: formData.get("flavorName"),
    memo: emptyToUndef(formData.get("memo")),
    purchaseUrl: emptyToUndef(formData.get("purchaseUrl")),
  });
  await repos.masterSubmissions.create({
    id: newId("sub"),
    userId,
    brandName: parsed.brandName,
    flavorName: parsed.flavorName,
    memo: parsed.memo,
    purchaseUrl: parsed.purchaseUrl,
    status: "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  revalidatePath("/admin");
}

// --- Curator: master submission review --------------------------------------

/**
 * Approve a master submission. Only curators/admins may do this. On approval we
 * mark the submission and (optionally) create a FlavorMaster with dataStatus
 * "pending" so a human still sets the taste vector — AI never fills it in.
 */
export async function approveSubmissionAction(formData: FormData) {
  const repos = getRepositories();
  const user = await getCurrentUser();
  if (!isCuratorOrAdmin(user)) throw new Error("forbidden");

  const id = String(formData.get("id"));
  const sub = (await repos.masterSubmissions.list()).find((s) => s.id === id);
  if (!sub) return;

  await repos.masterSubmissions.update(id, {
    status: "approved",
    reviewedBy: user.id,
  });
  revalidatePath("/admin");
}

export async function rejectSubmissionAction(formData: FormData) {
  const repos = getRepositories();
  const user = await getCurrentUser();
  if (!isCuratorOrAdmin(user)) throw new Error("forbidden");
  await repos.masterSubmissions.update(String(formData.get("id")), {
    status: "rejected",
    reviewedBy: user.id,
  });
  revalidatePath("/admin");
}

// --- helpers ----------------------------------------------------------------

function emptyToUndef(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

// --- Internal flavor curation notes (staff only) ----------------------------

export async function addCurationNoteAction(formData: FormData) {
  const repos = getRepositories();
  const user = await getCurrentUser();
  if (!isCuratorOrAdmin(user)) throw new Error("forbidden");

  const flavorMasterId = String(formData.get("flavorMasterId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const field = emptyToUndef(formData.get("field"));
  if (!flavorMasterId || !note) return;

  const ts = nowIso();
  await repos.curationNotes.create({
    id: newId("note"),
    flavorMasterId,
    note,
    field,
    status: "open",
    authorId: user.id,
    createdAt: ts,
    updatedAt: ts,
  });
  revalidatePath("/admin");
}

export async function toggleCurationNoteAction(formData: FormData) {
  const repos = getRepositories();
  const user = await getCurrentUser();
  if (!isCuratorOrAdmin(user)) throw new Error("forbidden");

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("status") ?? "resolved") === "resolved"
    ? "resolved"
    : "open";
  await repos.curationNotes.update(id, { status: next });
  revalidatePath("/admin");
}

export async function deleteCurationNoteAction(formData: FormData) {
  const repos = getRepositories();
  const user = await getCurrentUser();
  if (!isCuratorOrAdmin(user)) throw new Error("forbidden");
  await repos.curationNotes.remove(String(formData.get("id") ?? ""));
  revalidatePath("/admin");
}

// --- User management + staff wages (admin only) -----------------------------

/** Rename a user's display name (e.g. handle "0129ryuusei" -> "さおとめ"). */
export async function renameUserAction(formData: FormData) {
  const repos = getRepositories();
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) throw new Error("forbidden");

  const id = String(formData.get("id") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!id || !displayName) return;

  await repos.users.update(id, { displayName });
  revalidatePath("/admin");
}

/** Add (or replace) an effective-dated hourly wage for a staff member. */
export async function addWageEntryAction(formData: FormData) {
  const repos = getRepositories();
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) throw new Error("forbidden");

  const userId = String(formData.get("userId") ?? "").trim();
  const effectiveFrom = String(formData.get("effectiveFrom") ?? "").trim();
  const hourlyWage = Number(formData.get("hourlyWage"));
  if (!userId || !isMonthKey(effectiveFrom)) return;
  if (!Number.isFinite(hourlyWage) || hourlyWage < 0) return;

  const target = await repos.users.getById(userId);
  if (!target) return;

  // One entry per effective month: replace if the month already exists.
  const others = (target.wages ?? []).filter(
    (w) => w.effectiveFrom !== effectiveFrom,
  );
  const entry: WageEntry = {
    id: newId("wage"),
    effectiveFrom,
    hourlyWage: Math.round(hourlyWage),
  };
  await repos.users.update(userId, { wages: [...others, entry] });
  revalidatePath("/admin");
}

/** Remove one wage entry from a staff member's schedule. */
export async function deleteWageEntryAction(formData: FormData) {
  const repos = getRepositories();
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) throw new Error("forbidden");

  const userId = String(formData.get("userId") ?? "").trim();
  const wageId = String(formData.get("wageId") ?? "").trim();
  if (!userId || !wageId) return;

  const target = await repos.users.getById(userId);
  if (!target) return;
  await repos.users.update(userId, {
    wages: (target.wages ?? []).filter((w) => w.id !== wageId),
  });
  revalidatePath("/admin");
}
