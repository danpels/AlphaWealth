import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 safe-top safe-bottom">
      <div className="max-w-md text-center space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">AlphaWealth</h1>
          <p className="text-muted-foreground mt-2">
            Household finance & investing. Track income, spending, and projections.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-md">
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-md">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
