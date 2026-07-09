import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  helper: string;
  tone?: "income" | "expense" | "balance" | "neutral";
  icon?: ReactNode;
};

const tones = {
  income: "bg-mint text-mint-strong",
  expense: "bg-danger-soft text-danger",
  balance: "bg-primary-soft text-primary",
  neutral: "bg-slate-100 text-slate-600",
};

export function StatCard({ title, value, helper, tone = "neutral", icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-bold", tones[tone])}>
          {icon ?? "L"}
        </div>
      </CardContent>
    </Card>
  );
}

