"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { addSplit, database, deleteSplit, type Split } from "@/lib/db";
import { listSplits } from "@/lib/data/splits";
import { formatMoney, formatSavedAt } from "@/lib/split";
import { useStorageStatus, useStoredQuery } from "@/lib/storage/react";

/** Every split the visitor saved, newest first, each with its own Delete. */
export function SplitHistory() {
  const { data, isLoading } = useStoredQuery(database, listSplits);
  const status = useStorageStatus(database);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved splits</CardTitle>
        <CardDescription>
          Kept in this browser only — nothing leaves the device unless you share it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {status === "memory" ? (
          <Alert>
            <AlertTitle>This browser won&rsquo;t keep your data</AlertTitle>
            <AlertDescription>
              It refused site storage, so splits live only until this tab closes.
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="flex flex-col gap-2" aria-label="Loading saved splits">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved splits yet. Work out a split above, then press &ldquo;Save split&rdquo; and it
            will be listed here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.map((split) => (
              <li key={split.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-lg font-semibold tabular-nums">
                      {formatMoney(split.totalCents, split.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      total · {formatMoney(split.bill, split.currency)} bill ·{" "}
                      {split.tipPercent}% tip · {split.people}{" "}
                      {split.people === 1 ? "person" : "people"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void removeSplit(split)}
                    aria-label={`Delete split of ${formatMoney(split.totalCents, split.currency)}`}
                  >
                    Delete
                  </Button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {split.shareCents
                    .map((share, index) => `P${index + 1} ${formatMoney(share, split.currency)}`)
                    .join(" · ")}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Saved {formatSavedAt(split.savedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** Removes the split at once, with an Undo on the toast in case the press was a slip. */
async function removeSplit(split: Split) {
  try {
    await deleteSplit(split.id);
    toast.success("Split deleted", {
      action: { label: "Undo", onClick: () => void addSplit(split) },
    });
  } catch {
    toast.error("Couldn't delete the split", {
      description: "The browser refused. The list still shows it.",
    });
  }
}