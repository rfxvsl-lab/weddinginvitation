'use client';

/**
 * useAuth — state autentikasi di browser.
 *
 * Sumber kebenaran adalah cookie session httpOnly yang dibuat server.
 * Hook ini hanya menyimpan salinan data user untuk ditampilkan; tidak ada
 * identitas, peran, atau status bayar yang ditentukan di sini.
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { SaaSUser, TransactionReport } from '../types';
import * as api from '../lib/api';
import * as authActions from '../lib/authActions';
import type { RegisterInput } from '../lib/authActions';

export interface GoogleSignupPrefill {
  unverifiedEmail: string;
  name: string;
  avatarUrl?: string;
  /** Google ID token, dikirim ulang ke server saat registrasi untuk diverifikasi. */
  credential: string;
}

interface AuthContextType {
  currentUser: SaaSUser | null;
  /** true sampai session awal selesai dibaca dari server */
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  allUsers: SaaSUser[];
  allTransactions: TransactionReport[];
  login: (email: string, password: string) => Promise<SaaSUser | null>;
  loginWithGoogle: (credential: string) => Promise<SaaSUser | GoogleSignupPrefill | null>;
  register: (input: RegisterInput) => Promise<SaaSUser | null>;
  logout: () => Promise<void>;
  /** Baca ulang data user dari server (mis. setelah pembayaran dikonfirmasi). */
  refreshUser: () => Promise<SaaSUser | null>;
  checkSlugAvailable: (slug: string) => Promise<boolean>;
  checkEmailAvailable: (email: string) => Promise<boolean>;
  approveTransaction: (txId: string) => Promise<void>;
  rejectTransaction: (txId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  fetchAdminData: () => Promise<void>;
  /** Hanya memperbarui salinan lokal untuk tampilan; tidak mengubah apa pun di server. */
  setCurrentUser: (user: SaaSUser | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Kunci lama yang dulu menyimpan data user di browser; dibersihkan sekali saat dimuat. */
const LEGACY_STORAGE_KEY = 'saas_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<SaaSUser[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionReport[]>([]);

  const refreshUser = useCallback(async (): Promise<SaaSUser | null> => {
    try {
      const user = await authActions.getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Gagal memuat session:', err);
      return null;
    }
  }, []);

  // Pulihkan session dari cookie saat aplikasi dimuat.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* storage tidak tersedia */
    }
    let cancelled = false;
    authActions
      .getCurrentUser()
      .then((user) => {
        if (!cancelled) setCurrentUser(user);
      })
      .catch((err) => console.error('Gagal memuat session:', err))
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<SaaSUser | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authActions.loginAction(email, password);
      if (result.ok === false) {
        setError(result.error);
        return null;
      }
      setCurrentUser(result.user);
      return result.user;
    } catch {
      setError('Gagal login. Periksa koneksi internet.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authActions.googleLoginAction(credential);
      if (result.ok === false) {
        setError(result.error);
        return null;
      }
      if ('needsSignup' in result) {
        return {
          unverifiedEmail: result.needsSignup.email,
          name: result.needsSignup.name,
          avatarUrl: result.needsSignup.avatarUrl,
          credential,
        };
      }
      setCurrentUser(result.user);
      return result.user;
    } catch {
      setError('Gagal terhubung dengan server.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<SaaSUser | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authActions.registerAction(input);
      if (result.ok === false) {
        setError(result.error);
        return null;
      }
      setCurrentUser(result.user);
      return result.user;
    } catch {
      setError('Gagal mendaftar. Periksa koneksi internet.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    setAllUsers([]);
    setAllTransactions([]);
    try {
      await authActions.logoutAction();
    } catch (err) {
      console.error('Gagal logout:', err);
    }
  }, []);

  const checkSlugAvailable = useCallback(async (slug: string): Promise<boolean> => {
    try {
      return await authActions.checkSlugAvailable(slug);
    } catch {
      return true; // pengecekan final tetap dilakukan server saat registrasi
    }
  }, []);

  const checkEmailAvailable = useCallback(async (email: string): Promise<boolean> => {
    try {
      return await authActions.checkEmailAvailable(email);
    } catch {
      return true;
    }
  }, []);

  const applyTransactionStatus = useCallback(async (txId: string, status: 'success' | 'failed') => {
    const { userId } = await api.adminSetTransactionStatus(txId, status);
    setAllTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status } : t)));
    // Paket/status user bisa berubah (upgrade), jadi ambil ulang daftar user.
    try {
      setAllUsers(await api.adminListUsers());
    } catch {
      setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, paymentStatus: status } : u)));
    }
  }, []);

  const approveTransaction = useCallback(
    (txId: string) => applyTransactionStatus(txId, 'success'),
    [applyTransactionStatus]
  );
  const rejectTransaction = useCallback(
    (txId: string) => applyTransactionStatus(txId, 'failed'),
    [applyTransactionStatus]
  );

  const deleteUserAction = useCallback(async (userId: string) => {
    await api.adminDeleteUser(userId);
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    setAllTransactions((prev) => prev.filter((t) => t.userId !== userId));
  }, []);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [users, transactions] = await Promise.all([api.adminListUsers(), api.adminListTransactions()]);
      setAllUsers(users);
      setAllTransactions(transactions);
    } catch (err) {
      // Bukan admin atau session berakhir: jangan tampilkan data apa pun.
      setAllUsers([]);
      setAllTransactions([]);
      console.error('Gagal memuat data admin:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isInitializing,
        isLoading,
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
