import type { CreateMovementInput } from "@/types/movement";
import { MovementForm } from "./movement-form";

type IncomeFormProps = {
  disabled?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
  onSubmit: (data: CreateMovementInput) => Promise<void>;
};

export function IncomeForm(props: IncomeFormProps) {
  return <MovementForm mode="income" {...props} />;
}
