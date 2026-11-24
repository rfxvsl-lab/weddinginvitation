"use client";

/**
 * useAuth — state autentikasi di client.
 *
 * Sumber kebenaran adalah cookie sesi httpOnly yang ditandatangani server
 * (`/api/auth/*`). Dashboard baru dibuka setelah identitas server diverifikasi.
 * Cache lama tidak dipakai untuk memberi akses pada akun yang belum disetujui.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import type { SaaSUser, TransactionReport } from "../types";
import * as api from "../lib/api";

const CACHE_KEY = "saas_current_user";

export type ClientUser = SaaSUser & {
  isAdmin?: boolean;
  accountStatus?: "pending" | "approved" | "rejected";
};

export interface GoogleSignupInfo {
  unverifiedEmail: string;
  name: string;
  avatarUrl?: string;
  signupToken: string;
}

export interface AccountApplication {
  accountStatus: "pending" | "rejected";
  application?: { fullName?: string; email?: string };
}

export type RegisterInput = Omit<SaaSUser, "id" | "registeredAt"> & {
  eventDate?: string;
  city?: string;
  referralSource?: string;
  password?: string;
  googleSignupToken?: string;
};

interface AuthContextType {
  currentUser: ClientUser | null;
  application: AccountApplication | null;
  clearApplication: () => void;
  isLoading: boolean;
  /** true setelah sesi server selesai diverifikasi */
  isReady: boolean;
  error: string | null;
  allUsers: SaaSUser[];
  allTransactions: TransactionReport[];
  login: (email: string, password: string) => Promise<ClientUser | null>;
  loginWithGoogle: (
    credential: string,
  ) => Promise<ClientUser | GoogleSignupInfo | null>;
  register: (userData: RegisterInput) => Promise<ClientUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<ClientUser | null>;
  checkSlugAvailable: (slug: string) => Promise<boolean>;
  checkEmailAvailable: (email: string) => Promise<boolean>;
  approveTransaction: (txId: string, userId: string) => Promise<void>;
  rejectTransaction: (txId: string, userId: string) => Promise<void>;
  upgradePackage: (userId: string, newPackageId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  fetchAdminData: () => Promise<void>;
  setCurrentUser: (user: ClientUser | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function postJson<T = any>(
  url: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<ClientUser | null>(null);
  const [application, setApplication] = useState<AccountApplication | null>(
    null,
  );
  const clearApplication = useCallback(() => setApplication(null), []);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<SaaSUser[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionReport[]>(
    [],
  );

  const setCurrentUser = useCallback((user: ClientUser | null) => {
    setCurrentUserState(user);
    try {
      if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
      else localStorage.removeItem(CACHE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) {
        setCurrentUser(null);
        return null;
      }
      const data = await res.json();
      if (
        data?.user &&
        (!data.user.accountStatus ||
          data.user.accountStatus === "approved" ||
          data.user.isAdmin === true)
      ) {
        setCurrentUser(data.user);
        return data.user as ClientUser;
      }
      setCurrentUser(null);
      return null;
    } catch {
      // Never enter the dashboard from an unverified local cache.
      setCurrentUser(null);
      return null;
    } finally {
      setIsReady(true);
    }
  }, [setCurrentUser]);

  // Verifikasi sesi server sekali saat aplikasi dimuat.
  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      setApplication(null);
      try {
        const { ok, data } = await postJson("/api/auth/login", {
          email,
          password,
        });
        if (
          data?.accountStatus === "pending" ||
          data?.accountStatus === "rejected"
        ) {
          setApplication({
            accountStatus: data.accountStatus,
            application: data.application,
          });
          setCurrentUser(null);
          return null;
        }
        if (
          !ok ||
          !data?.user ||
          (data.user.accountStatus &&
            data.user.accountStatus !== "approved" &&
            data.user.isAdmin !== true)
        ) {
          setCurrentUser(null);
          setError(data?.error || "Email atau password salah.");
          return null;
        }
        setCurrentUser(data.user);
        return data.user as ClientUser;
      } catch {
        setError("Gagal terhubung. Periksa koneksi internet Anda.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentUser],
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      setIsLoading(true);
      setError(null);
      setApplication(null);
      try {
        const { ok, data } = await postJson("/api/auth/google", { credential });
        if (
          data?.accountStatus === "pending" ||
          data?.accountStatus === "rejected"
        ) {
          setApplication({
            accountStatus: data.accountStatus,
            application: data.application,
          });
          setCurrentUser(null);
          return null;
        }
        if (!ok) {
          setError(data?.error || "Masuk dengan Google gagal.");
          return null;
        }
        if (data?.needsSignup) {
          return {
            unverifiedEmail: data.email,
            name: data.name,
            avatarUrl: data.avatarUrl,
            signupToken: data.signupToken,
          } as GoogleSignupInfo;
        }
        if (
          !data?.user ||
          (data.user.accountStatus &&
            data.user.accountStatus !== "approved" &&
            data.user.isAdmin !== true)
        ) {
          setCurrentUser(null);
          setError(
            "Akun belum dapat digunakan. Silakan periksa status pendaftaran.",
          );
          return null;
        }
        setCurrentUser(data.user);
        return data.user as ClientUser;
      } catch {
        setError("Gagal terhubung. Periksa koneksi internet Anda.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentUser],
  );

  const register = useCallback(
    async (userData: RegisterInput) => {
      setIsLoading(true);
      setError(null);
      setApplication(null);
      try {
        const { ok, data } = await postJson("/api/auth/register", userData);
        if (ok && data?.accountStatus === "pending") {
          setApplication({
            accountStatus: "pending",
            application: data.application,
          });
          setCurrentUser(null);
          return null;
        }
        // Registration never activates a dashboard session; approval is a server action.
        setCurrentUser(null);
        setError(
          data?.error || "Pendaftaran belum dapat diproses. Silakan coba lagi.",
        );
        return null;
      } catch {
        setError("Gagal terhubung. Periksa koneksi internet Anda.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentUser],
  );

  const logout = useCallback(async () => {
    setCurrentUser(null);
    try {
      await postJson("/api/auth/logout");
    } catch {
      /* ignore */
    }
  }, [setCurrentUser]);

  const checkSlugAvailable = useCallback(async (slug: string) => {
    try {
      return !(await api.checkSlugExists(slug));
    } catch {
      return true;
    }
  }, []);

  const checkEmailAvailable = useCallback(async (email: string) => {
    try {
      return !(await api.checkEmailExists(email));
    } catch {
      return true;
    }
  }, []);

  // ---------- Admin (semua dijaga requireAdmin di server) ----------

  const approveTransaction = useCallback(
    async (txId: string, userId: string) => {
      await api.updateTransactionStatus(txId, "success");
      await api.updateUserPaymentStatus(userId, "success");
      setAllTransactions((prev) =>
        prev.map((t) =>
          t.id === txId ? { ...t, status: "success" as const } : t,
        ),
      );
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, paymentStatus: "success" as const } : u,
        ),
      );
    },
    [],
  );

  const rejectTransaction = useCallback(
    async (txId: string, userId: string) => {
      await api.updateTransactionStatus(txId, "failed");
      await api.updateUserPaymentStatus(userId, "failed");
      setAllTransactions((prev) =>
        prev.map((t) =>
          t.id === txId ? { ...t, status: "failed" as const } : t,
        ),
      );
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, paymentStatus: "failed" as const } : u,
        ),
      );
    },
    [],
  );

  const upgradePackage = useCallback(
    async (userId: string, newPackageId: string) => {
      await api.updateUserPackage(userId, newPackageId);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, packageId: newPackageId as any } : u,
        ),
      );
    },
    [],
  );

  const deleteUserAction = useCallback(async (userId: string) => {
    await api.deleteUser(userId);
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    setAllTransactions((prev) => prev.filter((t) => t.userId !== userId));
  }, []);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [users, transactions] = await Promise.all([
        api.getAllUsers(),
        api.getAllTransactions(),
      ]);
      setAllUsers(users);
      setAllTransactions(transactions);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        application,
        clearApplication,
        isLoading,
        isReady,
        error,
        allUsers,
        allTransactions,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        checkSlugAvailable,
        checkEmailAvailable,
        approveTransaction,
        rejectTransaction,
        upgradePackage,
        deleteUser: deleteUserAction,
        fetchAdminData,
        setCurrentUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
