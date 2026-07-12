"use client";

import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CLINIC_ID } from "@/lib/constants";
import { logout as firebaseLogout } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import type { Role } from "@/types/role";
import type { UserProfile, UserStatus } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  userProfile: UserProfile | null;
  profileError: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PROFILE_ERROR_MESSAGE =
  'No se pudo cargar tu perfil de usuario. Verifica tu conexión o contacta al encargado del sistema.';

function dateValueToString(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return typeof value === "string" ? value : new Date().toISOString();
}

function normalizeStatus(status: unknown): UserStatus {
  if (status === "active" || status === "pending" || status === "disabled") {
    return status;
  }

  if (status === "activo") return "active";
  if (status === "pendiente") return "pending";
  if (status === "inactivo") return "disabled";

  return "pending";
}

function normalizeRole(role: unknown): Role {
  if (role === "technical_owner" || role === "business_owner" || role === "admin") {
    return role;
  }

  return "admin";
}

function fallbackUsername(currentUser: User) {
  const emailPrefix = currentUser.email?.split("@")[0] ?? "";
  const cleanPrefix = emailPrefix.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 30);

  if (cleanPrefix.length >= 3) return cleanPrefix;
  return `usuario-${currentUser.uid.slice(0, 8).toLowerCase()}`;
}

function normalizeProfile(data: Record<string, unknown>, fallbackUser: User): UserProfile {
  return {
    id: typeof data.id === "string" ? data.id : fallbackUser.uid,
    clinicId: typeof data.clinicId === "string" ? data.clinicId : CLINIC_ID,
    name: typeof data.name === "string" ? data.name : fallbackUser.displayName ?? "Usuario del consultorio",
    username: typeof data.username === "string" && data.username.trim()
      ? data.username.trim().toLowerCase()
      : fallbackUsername(fallbackUser),
    email: typeof data.email === "string" ? data.email : fallbackUser.email ?? "",
    role: normalizeRole(data.role),
    status: normalizeStatus(data.status),
    createdAt: dateValueToString(data.createdAt),
    updatedAt: dateValueToString(data.updatedAt),
  };
}

async function getOrCreateUserProfile(currentUser: User) {
  const userRef = doc(db, "users", currentUser.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return normalizeProfile(snapshot.data(), currentUser);
  }

  const now = new Date().toISOString();
  const profile: UserProfile = {
    id: currentUser.uid,
    clinicId: CLINIC_ID,
    name: currentUser.displayName ?? "Usuario del consultorio",
    username: fallbackUsername(currentUser),
    email: currentUser.email ?? "",
    role: "admin",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  // Seguridad: el primer Técnico operativo debe configurarse manualmente en Firestore
  // o mediante un seed controlado en una fase posterior. No se eleva ningún usuario automáticamente.
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setUserProfile(null);
      setProfileError(null);
      return;
    }

    setProfileError(null);

    try {
      const profile = await getOrCreateUserProfile(auth.currentUser);
      setUserProfile(profile);
    } catch {
      setUserProfile(null);
      setProfileError(PROFILE_ERROR_MESSAGE);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      setProfileError(null);

      try {
        if (currentUser) {
          const profile = await getOrCreateUserProfile(currentUser);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch {
        setUserProfile(null);
        setProfileError(PROFILE_ERROR_MESSAGE);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userProfile,
      profileError,
      loading,
      isAuthenticated: Boolean(user),
      role: userProfile?.role ?? null,
      logout: firebaseLogout,
      refreshUserProfile,
    }),
    [loading, profileError, refreshUserProfile, user, userProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
