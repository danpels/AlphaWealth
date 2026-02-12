"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CURRENCIES, US_STATES, CA_PROVINCES } from "@/config/onboarding";

interface ProfileData {
  full_name: string | null;
  email: string | null;
  currency: "USD" | "CAD";
  region: string | null;
}

export function ProfileSettingsView({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [name, setName] = useState(profile.full_name ?? "");
  const [currency, setCurrency] = useState<"USD" | "CAD">(profile.currency);
  const [region, setRegion] = useState(profile.region ?? "");
  const [saving, setSaving] = useState(false);

  const regions = currency === "CAD" ? CA_PROVINCES : US_STATES;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        full_name: name || null,
        currency,
        region: region || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    router.refresh();
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-medium">Profile</CardTitle>
        <p className="text-sm text-muted-foreground">Update your name, currency, and region for tax and projections.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email ?? ""} readOnly className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Email is managed by your account provider.</p>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "USD" | "CAD")}
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{currency === "CAD" ? "Province" : "State"}</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Select…</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
