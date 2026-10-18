/**
 * The tip-splitting arithmetic, kept out of the components so it can be reasoned about on its own.
 * Everything is worked in integer cents: no floating-point pennies are ever dropped or invented.
 */

/** The four currencies the app offers, as the symbols shown beside every amount. */
export const CURRENCIES = ["$", "£", "€", "¥"] as const;

/** The preset tip percentages, offered as one-tap buttons beside the custom input. */
export const TIP_PRESETS = [10, 12.5, 15, 18, 20, 25] as const;

/** The most people a single split can name. Beyond that the list stops being useful to anyone. */
export const MAX_PEOPLE = 100;

/** Rounds a value to whole cents. A bill typed with more precision (19.999) lands on the nearest cent. */
export function toCents(value: number): number {
  return Math.round(value * 100);
}

/** "$2,335.00" — always two decimals, thousands separators, the chosen symbol in front. */
export function formatMoney(cents: number, symbol: string): string {
  return symbol + (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type SplitInputs = { bill: number; tipPercent: number; people: number };

export type SplitResult = SplitInputs & {
  /** Bill rounded to the nearest cent, in cents. */
  billCents: number;
  tipCents: number;
  totalCents: number;
  /** Each person's share in cents; the extra pennies sit on the earlier people. */
  shareCents: number[];
  /** How many people pay a penny more than the rest. */
  extraPennyCount: number;
};

export type Parsed =
  | { ok: true; inputs: SplitInputs }
  | { ok: false; error: string };

/**
 * Reads the three fields as typed. An empty field is empty, not zero; a bill with more than two
 * decimals is rounded to the nearest cent rather than rejected; anything genuinely out of range
 * is an error with a sentence that says which field and why.
 */
export function parseInputs(billText: string, tipText: string, peopleText: string): Parsed {
  if (billText.trim() === "") return { ok: false, error: "Enter the bill amount." };
  if (tipText.trim() === "") return { ok: false, error: "Enter a tip percentage, or pick a preset." };
  if (peopleText.trim() === "") return { ok: false, error: "Enter how many people are splitting the bill." };

  const bill = Number(billText);
  const tipPercent = Number(tipText);
  const people = Number(peopleText);

  if (!Number.isFinite(bill)) return { ok: false, error: "The bill amount doesn't read as a number." };
  if (!Number.isFinite(tipPercent)) return { ok: false, error: "The tip percentage doesn't read as a number." };
  if (!Number.isFinite(people)) return { ok: false, error: "The number of people doesn't read as a number." };

  if (bill <= 0) return { ok: false, error: "The bill has to be more than zero." };
  if (tipPercent < 0) return { ok: false, error: "The tip percentage can't be below zero." };
  if (!Number.isInteger(people) || people < 1) return { ok: false, error: "Split the bill between at least one whole person." };
  if (people > MAX_PEOPLE) return { ok: false, error: `Keep the party to ${MAX_PEOPLE} people or fewer.` };

  return { ok: true, inputs: { bill: toCents(bill) / 100, tipPercent, people } };
}

/** The whole calculation, in cents, from validated inputs. */
export function computeSplit({ bill, tipPercent, people }: SplitInputs): SplitResult {
  const billCents = toCents(bill);
  const tipCents = Math.round((billCents * tipPercent) / 100);
  const totalCents = billCents + tipCents;

  const shareCents: number[] = [];
  const baseShare = Math.floor(totalCents / people);
  const extraPennyCount = totalCents - baseShare * people;
  for (let i = 0; i < people; i++) {
    shareCents.push(baseShare + (i < extraPennyCount ? 1 : 0));
  }

  return { bill, tipPercent, people, billCents, tipCents, totalCents, shareCents, extraPennyCount };
}

/** "18 Oct 2026, 14:05" — one fixed locale, so the server and the client agree. */
export function formatSavedAt(millis: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(millis));
}
