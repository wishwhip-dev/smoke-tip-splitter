/**
 * This application's database.
 *
 * The reusable half of the setup is in `lib/storage/` and is not edited. This file is the half
 * that describes the product: which tables exist, what is indexed, how the schema has changed over
 * time, and what a first visit starts with.
 */
import { defineDatabase } from "@/lib/storage/database";

/** One saved split: the inputs as typed, the currency, and the calculated figures. */
export type Split = {
  id: string;
  /** Bill before tip, in the currency's main unit. */
  bill: number;
  tipPercent: number;
  people: number;
  /** One of the four supported currency symbols: $ £ € ¥. */
  currency: string;
  /** Calculated at save time, in cents, so history never re-derives them. */
  tipCents: number;
  totalCents: number;
  /** Each person's share, in cents, extra pennies already handed to the named people. */
  shareCents: number[];
  /** Epoch millis. Indexed, because the list is ordered by it. */
  savedAt: number;
};

/** Ids are generated here so the data layer never depends on an auto-increment round trip. */
export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const database = defineDatabase<{ splits: Split }>({
  // Part of the origin's storage identity. Renaming it does not migrate anything — it points the
  // application at a different, empty database and abandons the old one in place. That is exactly
  // what you want on a first build, and never what you want afterwards.
  name: "tip-splitter",
  versions: [
    // Only the primary key and the properties queried on. `savedAt` is indexed because the history
    // list is ordered by it; everything else is stored but never filtered or sorted by.
    { version: 1, stores: { splits: "id, savedAt" } },
  ],
});
