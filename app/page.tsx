import { TipSplitter } from "@/components/tip-splitter";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Tip splitter
        </h1>
        <p className="mt-1 text-muted-foreground">
          Enter the bill, the tip and how many people — see exactly what everyone owes, down to the
          cent.
        </p>
      </header>
      <TipSplitter />
    </main>
  );
}
