import type { CreateMovementInput } from "@/types/movement";
import { MovementForm } from "./movement-form";

type ExpenseFormProps = {
  disabled?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
  onSubmit: (data: CreateMovementInput) => Promise<void>;
};

export function ExpenseForm(props: ExpenseFormProps) {
  return <MovementForm mode="expense" {...props} />;
}
