"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShareButton } from "@/components/share-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { identity } from "@/app/identity";
import { addSplit, newId, type Split } from "@/lib/db";
import { renderShareCard } from "@/lib/share";
import {
  CURRENCIES,
  TIP_PRESETS,
  computeSplit,
  formatMoney,
  parseInputs,
} from "@/lib/split";
import { SplitHistory } from "@/components/split-history";

/**
 * The whole product: the form, the figures, saving and sharing. The page stays a server
 * component; this is the interactive island.
 */
export function TipSplitter() {
  const [billText, setBillText] = useState("");
  const [tipText, setTipText] = useState("15");
  const [peopleText, setPeopleText] = useState("2");
  const [currency, setCurrency] = useState<string>("$");
  const [calculated, setCalculated] = useState(false);

  const parsed = useMemo(
    () => parseInputs(billText, tipText, peopleText),
    [billText, tipText, peopleText],
  );
  // Once Calculate has been pressed the figures follow the inputs live — including
  // switching to the error message when an input goes out of range.
  const result = calculated && parsed.ok ? computeSplit(parsed.inputs) : null;

  const tipNumber = tipText.trim() === "" ? NaN : Number(tipText);
  const activePreset = (preset: number) => tipNumber === preset;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCalculated(true);
  };

  const saveSplit = async () => {
    if (!result) return;
    const split: Split = {
      id: newId(),
      bill: result.bill,
      tipPercent: result.tipPercent,
      people: result.people,
      currency,
      tipCents: result.tipCents,
      totalCents: result.totalCents,
      shareCents: result.shareCents,
      savedAt: Date.now(),
    };
    try {
      await addSplit(split);
      toast.success("Split saved", {
        description: `${formatMoney(split.totalCents, currency)} across ${split.people}.`,
      });
    } catch {
      toast.error("Couldn't save the split", {
        description: "The browser refused to write it. Nothing was stored.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Split a bill</CardTitle>
            <CardDescription>
              Enter the bill, pick a tip and say how many are sharing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bill">Bill amount</Label>
                <Input
                  id="bill"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  placeholder="100.00"
                  value={billText}
                  onChange={(event) => setBillText(event.target.value)}
                  className="h-11 text-lg"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="people">People</Label>
                <Input
                  id="people"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="1"
                  placeholder="3"
                  value={peopleText}
                  onChange={(event) => setPeopleText(event.target.value)}
                  className="h-11 text-lg"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tip">Tip percentage</Label>
              <div
                role="group"
                aria-label="Preset tip percentages"
                className="grid grid-cols-3 gap-2"
              >
                {TIP_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    aria-pressed={activePreset(preset)}
                    onClick={() => setTipText(String(preset))}
                    className={
                      activePreset(preset)
                        ? "border-primary border-2 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        : undefined
                    }
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
              <Input
                id="tip"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                placeholder="Custom percentage, e.g. 17.5"
                value={tipText}
                onChange={(event) => setTipText(event.target.value)}
                className="h-11 text-lg"
                aria-describedby="tip-hint"
              />
              <p id="tip-hint" className="text-sm text-muted-foreground">
                Tap a preset above or type your own.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" className="h-11 w-full text-lg">
                  <SelectValue aria-label="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((symbol) => (
                    <SelectItem key={symbol} value={symbol} className="text-lg">
                      <span className="font-medium">{symbol}</span>
                      <span className="text-muted-foreground">
                        {" "}— {symbol === "$" ? "dollar" : symbol === "£" ? "pound" : symbol === "€" ? "euro" : "yen"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" size="lg" className="h-12 w-full text-base">
              Calculate
            </Button>
          </CardContent>
        </Card>
      </form>

      {calculated && !parsed.ok ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Check your numbers</AlertTitle>
          <AlertDescription>{parsed.error}</AlertDescription>
        </Alert>
      ) : null}

      {result ? <SplitResultCard result={result} currency={currency} onSave={saveSplit} /> : null}

      <SplitHistory />
    </div>
  );
}

/** The figures for the current split, with Save and Share. */
function SplitResultCard({
  result,
  currency,
  onSave,
}: {
  result: ReturnType<typeof computeSplit>;
  currency: string;
  onSave: () => Promise<void>;
}) {
  const { tipCents, totalCents, shareCents, extraPennyCount, people, tipPercent, bill } = result;

  const shareCard = () =>
    renderShareCardBlob({
      billCents: result.billCents,
      tipCents,
      totalCents,
      shareCents,
      people,
      tipPercent,
      currency,
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>The split</CardTitle>
        <CardDescription>
          {formatMoney(result.billCents, currency)} bill · {tipPercent}% tip ·{" "}
          {people} {people === 1 ? "person" : "people"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <figure className="rounded-lg border bg-muted/50 p-3">
            <dt className="text-sm text-muted-foreground">Tip amount</dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {formatMoney(tipCents, currency)}
            </dd>
          </figure>
          <figure className="rounded-lg border bg-muted/50 p-3">
            <dt className="text-sm text-muted-foreground">Total with tip</dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {formatMoney(totalCents, currency)}
            </dd>
          </figure>
          <figure className="rounded-lg border bg-muted/50 p-3">
            <dt className="text-sm text-muted-foreground">Each person&rsquo;s share</dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {formatMoney(shareCents[shareCents.length - 1], currency)}
            </dd>
          </figure>
        </dl>

        {extraPennyCount > 0 ? (
          <p className="text-sm text-muted-foreground">
            The total doesn&rsquo;t divide evenly, so the first {extraPennyCount}{" "}
            {extraPennyCount === 1 ? "person pays" : "people pay"} one cent more.
          </p>
        ) : null}

        <div>
          <h3 className="mb-2 text-sm font-medium">Who owes what</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {shareCents.map((share, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm text-muted-foreground">Person {index + 1}</span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(share, currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <Button type="button" onClick={() => void onSave()} className="h-11">
            Save split
          </Button>
          <ShareButton
            label="Share split"
            title="Our tip split"
            text={`Bill ${formatMoney(result.billCents, currency)} with a ${tipPercent}% tip: ${formatMoney(
              totalCents,
              currency,
            )} total, ${formatMoney(shareCents[shareCents.length - 1], currency)} each.`}
            filename="tip-split.png"
            cacheKey={`${result.billCents}/${tipCents}/${people}/${currency}`}
            makeImage={shareCard}
            className="sm:flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

async function renderShareCardBlob(args: {
  billCents: number;
  tipCents: number;
  totalCents: number;
  shareCents: number[];
  people: number;
  tipPercent: number;
  currency: string;
}) {
  const each = args.shareCents[args.shareCents.length - 1];
  return renderShareCard({
    title: `${args.currency}${formatMoney(args.totalCents, "")}`,
    subtitle: `${args.tipPercent}% tip on ${formatMoney(args.billCents, args.currency)}`,
    lines: [
      `${args.people} ${args.people === 1 ? "person" : "people"} · ${formatMoney(each, args.currency)} each`,
      `Tip ${formatMoney(args.tipCents, args.currency)} · Total ${formatMoney(args.totalCents, args.currency)}`,
    ],
    footer: identity.name,
    format: "square",
  });
}