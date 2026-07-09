"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getFirebaseErrorMessage } from "@/lib/firebase";
import { getMonthDateRange } from "@/lib/finance";
import {
  createMovement as createMovementDocument,
  getMovementsByDateRange,
  softDeleteMovement,
  updateMovement as updateMovementDocument,
} from "@/lib/movements";
import { canCreateMovements, canDeleteMovements, canEditMovements } from "@/lib/roles";
import type { CreateMovementInput, Movement, UpdateMovementInput } from "@/types/movement";

type UseMovementsOptions = {
  autoLoad?: boolean;
  initialStartDate?: string;
  initialEndDate?: string;
};

function getInitialRange(options?: UseMovementsOptions) {
  const monthRange = getMonthDateRange();

  return {
    startDate: options?.initialStartDate ?? monthRange.startDate,
    endDate: options?.initialEndDate ?? monthRange.endDate,
  };
}

export function useMovements(options?: UseMovementsOptions) {
  const { userProfile, role } = useAuth();
  const initialRange = getInitialRange(options);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(Boolean(options?.autoLoad ?? true));
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  const canUseProfile = Boolean(userProfile && userProfile.status === "active" && role);

  const refreshMovements = useCallback(async () => {
    if (!userProfile?.clinicId || !canUseProfile) {
      setMovements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await getMovementsByDateRange(userProfile.clinicId, startDate, endDate);
      setMovements(results);
    } catch (refreshError) {
      setError(getFirebaseErrorMessage(refreshError));
    } finally {
      setLoading(false);
    }
  }, [canUseProfile, endDate, startDate, userProfile?.clinicId]);

  useEffect(() => {
    if (options?.autoLoad === false) {
      setLoading(false);
      return;
    }

    void refreshMovements();
  }, [options?.autoLoad, refreshMovements]);

  async function createMovement(data: CreateMovementInput) {
    if (!userProfile || userProfile.status !== "active" || !canCreateMovements(role)) {
      throw new Error("No tienes permiso para crear movimientos.");
    }

    try {
      await createMovementDocument(data, userProfile);
      await refreshMovements();
    } catch (createError) {
      const message = getFirebaseErrorMessage(createError);
      setError(message);
      throw new Error(message);
    }
  }

  async function updateMovement(movementId: string, data: UpdateMovementInput) {
    if (!userProfile || userProfile.status !== "active" || !canEditMovements(role)) {
      throw new Error("No tienes permiso para editar movimientos.");
    }

    try {
      await updateMovementDocument(movementId, data, userProfile);
      await refreshMovements();
    } catch (updateError) {
      const message = getFirebaseErrorMessage(updateError);
      setError(message);
      throw new Error(message);
    }
  }

  async function deleteMovement(movementId: string) {
    if (!userProfile || userProfile.status !== "active" || !canDeleteMovements(role)) {
      throw new Error("No tienes permiso para eliminar movimientos.");
    }

    try {
      await softDeleteMovement(movementId, userProfile);
      await refreshMovements();
    } catch (deleteError) {
      const message = getFirebaseErrorMessage(deleteError);
      setError(message);
      throw new Error(message);
    }
  }

  async function filterByDateRange(nextStartDate: string, nextEndDate: string) {
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);

    if (!userProfile?.clinicId || !canUseProfile) {
      setMovements([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await getMovementsByDateRange(userProfile.clinicId, nextStartDate, nextEndDate);
      setMovements(results);
    } catch (filterError) {
      setError(getFirebaseErrorMessage(filterError));
    } finally {
      setLoading(false);
    }
  }

  return {
    movements,
    loading,
    error,
    startDate,
    endDate,
    createMovement,
    updateMovement,
    deleteMovement,
    refreshMovements,
    filterByDateRange,
  };
}
