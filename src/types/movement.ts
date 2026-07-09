export type MovementType = "income" | "expense";

export type MovementStatus = "active" | "edited" | "deleted";

export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "otro";

export type Movement = {
  id: string;
  clinicId: string;
  type: MovementType;
  category: string;
  paymentMethod: PaymentMethod;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  status: MovementStatus;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
};

export type CreateMovementInput = {
  type: MovementType;
  category: string;
  paymentMethod: PaymentMethod;
  amount: number;
  description: string;
  notes?: string;
  date: string;
};

export type UpdateMovementInput = Partial<Omit<CreateMovementInput, "type">> & {
  type?: MovementType;
};
