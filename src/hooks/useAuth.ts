/**
 * useAuth Hook — Authentication state management with Turso
 * Menggantikan localStorage-based auth di AuthGate.tsx
 */

import { useState, useEffect, useCallback } from 'react';
import type { SaaSUser, TransactionReport } from '../types';
import * as api from '../lib/api';

interface UseAuthReturn {
  /** Currently logged-in user */
  currentUser: SaaSUser | null;
  /** Loading state for auth operations */
  isLoading: boolean;
  /** Error message (if any) */
  error: string | null;
  /** All registered users (admin only) */
  allUsers: SaaSUser[];
  /** All transactions (admin only) */
  allTransactions: TransactionReport[];

  // Actions
  login: (email: string, password: string) => Promise<SaaSUser | null>;
  register: (userData: Omit<SaaSUser, 'id' | 'registeredAt'> & { password: string }) => Promise<SaaSUser | null>;
  logout: () => void;
  updatePaymentStatus: (userId: string, status: 'pending' | 'success' | 'failed') => Promise<void>;
  checkSlugAvailable: (slug: string) => Promise<boolean>;
  checkEmailAvailable: (email: string) => Promise<boolean>;
  createTransaction: (tx: Omit<TransactionReport, 'id'>) => Promise<TransactionReport>;
  approveTransaction: (txId: string, userId: string) => Promise<void>;
  rejectTransaction: (txId: string, userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  fetchAdminData: () => Promise<void>;
  setCurrentUser: (user: SaaSUser | null) => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>(() => {
    // Bootstrap from localStorage for instant UI (will be validated later)
    const saved = localStorage.getItem('saas_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<SaaSUser[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionReport[]>([]);

  // Sync currentUser to localStorage (for session persistence across refreshes)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('saas_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('saas_current_user');
    }
  }, [currentUser]);

  const login = useCallback(async (email: string, password: string): Promise<SaaSUser | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await api.verifyUserPassword(email, password);
      if (!user) {
        setError('Email atau password salah. Silakan coba lagi.');
        return null;
      }
      setCurrentUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa koneksi internet.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    userData: Omit<SaaSUser, 'id' | 'registeredAt'> & { password: string }
  ): Promise<SaaSUser | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // Check slug uniqueness
      const slugTaken = await api.checkSlugExists(userData.activeSlug);
      if (slugTaken) {
        setError('Slug nama pasangan sudah digunakan. Silakan modifikasi sedikit.');
        return null;
      }

      // Check email uniqueness
      const emailTaken = await api.checkEmailExists(userData.email);
      if (emailTaken) {
        setError('Email ini sudah pernah mendaftarkan akun. Silakan gunakan menu Sign In.');
        return null;
      }

      const newUser = await api.createUser(userData);
      setCurrentUser(newUser);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Periksa koneksi internet.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('saas_current_user');
  }, []);

  const updatePaymentStatus = useCallback(async (userId: string, status: 'pending' | 'success' | 'failed') => {
    try {
      await api.updateUserPaymentStatus(userId, status);
      setCurrentUser(prev => prev?.id === userId ? { ...prev, paymentStatus: status } : prev);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, paymentStatus: status } : u));
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
    }
  }, []);

  const checkSlugAvailable = useCallback(async (slug: string): Promise<boolean> => {
    try {
      const exists = await api.checkSlugExists(slug, currentUser?.id);
      return !exists;
    } catch {
      return true; // Assume available on error
    }
  }, [currentUser]);

  const checkEmailAvailable = useCallback(async (email: string): Promise<boolean> => {
    try {
      const exists = await api.checkEmailExists(email);
      return !exists;
    } catch {
      return true;
    }
  }, []);

  const createTransaction = useCallback(async (tx: Omit<TransactionReport, 'id'>): Promise<TransactionReport> => {
    const newTx = await api.createTransaction(tx);
    setAllTransactions(prev => [newTx, ...prev]);
    return newTx;
  }, []);

  const approveTransaction = useCallback(async (txId: string, userId: string) => {
    await api.updateTransactionStatus(txId, 'success');
    await api.updateUserPaymentStatus(userId, 'success');
    setAllTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'success' as const } : t));
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, paymentStatus: 'success' as const } : u));
    setCurrentUser(prev => prev?.id === userId ? { ...prev, paymentStatus: 'success' as const } : prev);
  }, []);

  const rejectTransaction = useCallback(async (txId: string, userId: string) => {
    await api.updateTransactionStatus(txId, 'failed');
    await api.updateUserPaymentStatus(userId, 'failed');
    setAllTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'failed' as const } : t));
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, paymentStatus: 'failed' as const } : u));
    setCurrentUser(prev => prev?.id === userId ? { ...prev, paymentStatus: 'failed' as const } : prev);
  }, []);

  const deleteUserAction = useCallback(async (userId: string) => {
    await api.deleteUser(userId);
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    setAllTransactions(prev => prev.filter(t => t.userId !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  }, [currentUser]);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [users, transactions] = await Promise.all([
        api.getAllUsers(),
        api.getAllTransactions(),
      ]);
      setAllUsers(users);
      setAllTransactions(transactions);
    } catch (err: any) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    currentUser,
    isLoading,
    error,
    allUsers,
    allTransactions,
    login,
    register,
    logout,
    updatePaymentStatus,
    checkSlugAvailable,
    checkEmailAvailable,
    createTransaction,
    approveTransaction,
    rejectTransaction,
    deleteUser: deleteUserAction,
    fetchAdminData,
    setCurrentUser,
    clearError,
  };
}
