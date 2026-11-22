'use client';

/**
 * useAuth — state autentikasi di client.
 *
 * Sumber kebenaran adalah cookie sesi httpOnly yang ditandatangani server
 * (`/api/auth/*`). localStorage hanya dipakai sebagai cache tampilan agar
 * dashboard tidak berkedip saat refresh — selalu diverifikasi ulang ke `/api/auth/me`.
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { SaaSUser, TransactionReport } from '../types';
import * as api from '../lib/api';

const CACHE_KEY = 'saas_current_user';

export type ClientUser = SaaSUser & { isAdmin?: boolean };

export interface GoogleSignupInfo {
  unverifiedEmail: string;
  name: string;
  avatarUrl?: string;
  signupToken: string;
}

export type RegisterInput = Omit<SaaSUser, 'id' | 'registeredAt'> & {
  password?: string;
  googleSignupToken?: string;
};

interface AuthContextType {
  currentUser: ClientUser | null;
  isLoading: boolean;
  /** true setelah sesi server selesai diverifikasi */
  isReady: boolean;
  error: string | null;
  allUsers: SaaSUser[];
  allTransactions: TransactionReport[];
  login: (email: string, password: string) => Promise<ClientUser | null>;
  loginWithGoogle: (credential: string) => Promise<ClientUser | GoogleSignupInfo | null>;
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

async function postJson<T = any>(url: string, body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function readCache(): ClientUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<ClientUser | null>(() => readCache());
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<SaaSUser[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionReport[]>([]);

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
      const res = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
      if (res.status === 401) {
        setCurrentUser(null);
        return null;
      }
      const data = await res.json();
      if (data?.user) {
        setCurrentUser(data.user);
        return data.user as ClientUser;
      }
      return null;
    } catch {
      // Offline: pertahankan cache tampilan, server tetap menolak aksi tanpa sesi.
      return readCache();
    } finally {
      setIsReady(true);
    }
  }, [setCurrentUser]);

  // Verifikasi sesi server sekali saat aplikasi dimuat.
  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { ok, data } = await postJson('/api/auth/login', { email, password });
      if (!ok || !data?.user) {
        setError(data?.error || 'Email atau password salah.');
        return null;
      }
      setCurrentUser(data.user);
      return data.user as ClientUser;
    } catch {
      setError('Gagal terhubung. Periksa koneksi internet Anda.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentUser]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { ok, data } = await postJson('/api/auth/google', { credential });
      if (!ok) {
        setError(data?.error || 'Masuk dengan Google gagal.');
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
      setCurrentUser(data.user);
      return data.user as ClientUser;
    } catch {
      setError('Gagal terhubung. Periksa koneksi internet Anda.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentUser]);

  const register = useCallback(async (userData: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const { ok, data } = await postJson('/api/auth/register', userData);
      if (!ok || !data?.user) {
        setError(data?.error || 'Pendaftaran gagal. Silakan coba lagi.');
        return null;
      }
      setCurrentUser(data.user);
      return data.user as ClientUser;
    } catch {
      setError('Gagal terhubung. Periksa koneksi internet Anda.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentUser]);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    try {
      await postJson('/api/auth/logout');
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

  const approveTransaction = useCallback(async (txId: string, userId: string) => {
    await api.updateTransactionStatus(txId, 'success');
    await api.updateUserPaymentStatus(userId, 'success');
    setAllTransactions(prev => prev.map(t => (t.id === txId ? { ...t, status: 'success' as const } : t)));
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, paymentStatus: 'success' as const } : u)));
  }, []);

  const rejectTransaction = useCallback(async (txId: string, userId: string) => {
    await api.updateTransactionStatus(txId, 'failed');
    await api.updateUserPaymentStatus(userId, 'failed');
    setAllTransactions(prev => prev.map(t => (t.id === txId ? { ...t, status: 'failed' as const } : t)));
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, paymentStatus: 'failed' as const } : u)));
  }, []);

  const upgradePackage = useCallback(async (userId: string, newPackageId: string) => {
    await api.updateUserPackage(userId, newPackageId);
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, packageId: newPackageId as any } : u)));
  }, []);

  const deleteUserAction = useCallback(async (userId: string) => {
    await api.deleteUser(userId);
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    setAllTransactions(prev => prev.filter(t => t.userId !== userId));
  }, []);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [users, transactions] = await Promise.all([api.getAllUsers(), api.getAllTransactions()]);
      setAllUsers(users);
      setAllTransactions(transactions);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
