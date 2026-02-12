"use client";

export function AppContentHeader() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const dateStr = now.toLocaleDateString("en-US", options);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur safe-top md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <span className="font-semibold text-foreground">AlphaWealth</span>
        <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          BETA
        </span>
      </div>
      <div className="hidden md:block" />
      <p className="text-sm text-muted-foreground">{dateStr}</p>
    </header>
  );
}
