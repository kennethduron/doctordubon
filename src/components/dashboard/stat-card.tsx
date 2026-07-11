import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  helper: string;
  tone?: "income" | "expense" | "balance" | "neutral";
  icon?: ReactNode;
  accentIcon?: ReactNode;
};

const toneStyles = {
  income: {
    icon: "bg-mint text-mint-strong",
    value: "text-mint-strong",
    accent: "bg-mint text-mint-strong",
    glow: "hover:shadow-[0_18px_45px_rgba(15,159,110,0.12)]",
  },
  expense: {
    icon: "bg-danger-soft text-danger",
    value: "text-danger",
    accent: "bg-danger-soft text-danger",
    glow: "hover:shadow-[0_18px_45px_rgba(208,69,69,0.12)]",
  },
  balance: {
    icon: "bg-primary-soft text-primary",
    value: "text-primary",
    accent: "bg-primary-soft text-primary",
    glow: "hover:shadow-[0_18px_45px_rgba(15,58,95,0.12)]",
  },
  neutral: {
    icon: "bg-slate-100 text-slate-600",
    value: "text-slate-950",
    accent: "bg-slate-100 text-slate-600",
    glow: "hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]",
  },
};

export function StatCard({ title, value, helper, tone = "neutral", icon, accentIcon }: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card className={cn("group overflow-hidden transition duration-200 hover:-translate-y-0.5", styles.glow)}>
      <CardContent className="relative flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <div className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-full", styles.icon)}>
            {icon ?? <span className="text-lg font-bold">L</span>}
          </div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className={cn("mt-2 text-3xl font-bold tracking-normal", styles.value)}>{value}</p>
          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{helper}</p>
        </div>
        <div className={cn("mt-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition group-hover:scale-105", styles.accent)}>
          {accentIcon ?? "="}
        </div>
      </CardContent>
    </Card>
  );
}
