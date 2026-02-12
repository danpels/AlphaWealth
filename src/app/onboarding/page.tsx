"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ONBOARDING_SLIDES,
  CURRENCIES,
  PAY_FREQUENCIES,
  US_STATES,
  CA_PROVINCES,
  type OnboardingFormState,
  type OnboardingSlide,
} from "@/config/onboarding";

const defaultState: OnboardingFormState = {
  currency: "USD",
  region: "",
  average_paycheck: null,
  hourly_rate: null,
  pay_frequency: null,
  emergency_fund: null,
  travel_budget_goal: null,
  credit_card_debt: null,
  investment_retirement_goal: null,
  travel_goal: null,
  house_savings_goal: null,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingFormState>(defaultState);
  const [loading, setLoading] = useState(false);

  const slide = ONBOARDING_SLIDES[step];
  const progress = ((step + 1) / ONBOARDING_SLIDES.length) * 100;

  const update = (field: keyof OnboardingFormState, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < ONBOARDING_SLIDES.length - 1) {
      setStep((s) => s + 1);
    } else {
      submitOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  async function submitOnboarding() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    await supabase.from("profiles").update({
      currency: form.currency,
      region: form.region || null,
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    const { error: onboardingError } = await supabase.from("onboarding").upsert({
      user_id: user.id,
      average_paycheck: form.average_paycheck ?? undefined,
      hourly_rate: form.hourly_rate ?? undefined,
      pay_frequency: form.pay_frequency ?? undefined,
      emergency_fund: form.emergency_fund ?? undefined,
      travel_budget_goal: form.travel_budget_goal ?? undefined,
      credit_card_debt: form.credit_card_debt ?? undefined,
      investment_retirement_goal: form.investment_retirement_goal ?? undefined,
      travel_goal: form.travel_goal ?? undefined,
      house_savings_goal: form.house_savings_goal ?? undefined,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    setLoading(false);
    if (onboardingError) {
      console.error(onboardingError);
    }
    router.push("/app");
  }

  const canProceed =
    slide.inputType === "currency_region"
      ? form.currency && (form.currency === "CAD" ? form.region : form.region)
      : true;

  return (
    <main className="min-h-screen flex flex-col p-4 safe-top safe-bottom max-w-lg mx-auto">
      <Progress value={progress} className="mb-6 h-1 rounded-full" />
      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{slide.title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{slide.description}</p>
          </div>
          <SlideInput
            slide={slide}
            form={form}
            update={update}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={loading || (slide.inputType === "currency_region" && !form.region)}
          className={step > 0 ? "flex-1" : "w-full"}
        >
          {loading ? "Saving…" : step < ONBOARDING_SLIDES.length - 1 ? "Continue" : "Finish"}
        </Button>
      </div>
    </main>
  );
}

function SlideInput({
  slide,
  form,
  update,
}: {
  slide: OnboardingSlide;
  form: OnboardingFormState;
  update: (field: keyof OnboardingFormState, value: string | number | null) => void;
}) {
  if (slide.inputType === "currency_region") {
    const regions = form.currency === "CAD" ? CA_PROVINCES : US_STATES;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Currency</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.currency}
            onChange={(e) => update("currency", e.target.value as "USD" | "CAD")}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>{form.currency === "CAD" ? "Province" : "State"}</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
          >
            <option value="">Select…</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (slide.inputType === "frequency") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {PAY_FREQUENCIES.map((f) => (
          <Button
            key={f.value}
            type="button"
            variant={form.pay_frequency === f.value ? "default" : "outline"}
            onClick={() => update("pay_frequency", f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>
    );
  }

  const value = form[slide.field];
  const num = typeof value === "number" ? value : value === "" || value == null ? "" : Number(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={slide.id}>
        Amount ({form.currency})
      </Label>
      <Input
        id={slide.id}
        type="number"
        min={0}
        step={slide.field === "hourly_rate" ? 0.01 : 1}
        placeholder={slide.placeholder ?? "0"}
        value={num === "" ? "" : num}
        onChange={(e) => {
          const v = e.target.value;
          update(slide.field, v === "" ? null : Number(v));
        }}
        className="bg-background text-lg"
      />
    </div>
  );
}
