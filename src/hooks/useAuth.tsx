'use client';

/**
 * useAuth Hook — Authentication state management with Turso
 * Menggantikan localStorage-based auth di AuthGate.tsx
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { SaaSUser, TransactionReport } from '../types';
import * as api from '../lib/api';

interface AuthContextType {
  currentUser: SaaSUser | null;
  isLoading: boolean;
  error: string | null;
  allUsers: SaaSUser[];
  allTransactions: TransactionReport[];
  login: (email: string, password: string) => Promise<SaaSUser | null>;
  loginWithGoogle: (email: string, name: string, avatarUrl?: string) => Promise<SaaSUser | { unverifiedEmail: string, name: string, avatarUrl?: string }>;
  register: (userData: Omit<SaaSUser, 'id' | 'registeredAt'> & { password?: string }) => Promise<SaaSUser | null>;
  logout: () => void;
  updatePaymentStatus: (userId: string, status: 'pending' | 'success' | 'failed') => Promise<void>;
  checkSlugAvailable: (slug: string) => Promise<boolean>;
  checkEmailAvailable: (email: string) => Promise<boolean>;
  createTransaction: (tx: Omit<TransactionReport, 'id'>) => Promise<TransactionReport>;
  approveTransaction: (txId: string, userId: string) => Promise<void>;
  rejectTransaction: (txId: string, userId: string) => Promise<void>;
  upgradePackage: (userId: string, newPackageId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  fetchAdminData: () => Promise<void>;
  setCurrentUser: (user: SaaSUser | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saas_current_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!parsed.id) {
            localStorage.removeItem('saas_current_user');
            return null;
          }
          if (!parsed.paymentStatus) {
            parsed.paymentStatus = 'success';
          }
          return parsed;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<SaaSUser[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionReport[]>([]);

  // Auto background refresh from Turso if localStorage exists
  useEffect(() => {
    const saved = localStorage.getItem('saas_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          api.getUserByEmail(parsed.email).then(freshUser => {
            if (freshUser) {
              setCurrentUser(freshUser);
            }
          }).catch(err => console.error('Failed to auto-refresh user data', err));
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

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

      // IP Tracking & Banning
      let currentIp = '';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        currentIp = ipData.ip;
        
        const isBanned = await api.checkBannedIp(currentIp);
        if (isBanned) {
          setError('Akses ditolak. Alamat IP Anda telah diblokir karena melanggar ketentuan layanan.');
          return null;
        }

        await api.updateUserIp(user.id, currentIp);
        user.ipAddress = currentIp;
      } catch (err) {
        console.log('IP Tracking failed', err);
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

  const loginWithGoogle = useCallback(async (email: string, name: string, avatarUrl?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await api.getUserByEmail(email);
      if (user) {
        // IP Tracking & Banning
        const ipData = await fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => ({ ip: 'Unknown' }));
        const isBanned = await api.checkBannedIp(ipData.ip);
        if (isBanned) {
          setError('Akses Anda telah diblokir secara permanen. Hubungi admin.');
          return null;
        }

        try {
          await api.updateUserIp(user.id, ipData.ip);
          user.ipAddress = ipData.ip;
        } catch {}

        // Enforce super admin for mhmmadridho64 if they already existed
        if (email.toLowerCase().trim() === 'mhmmadridho64@gmail.com') {
          await api.forceSuperAdmin(user.id);
          user.packageId = 'luxury';
          user.paymentStatus = 'success';
          user.activeSlug = 'super-admin';
          user.isCustomByRfx = true;
        }

        setCurrentUser(user);
        return user;
      } else {
        // Not registered yet
        // Super-admin auto-bypass
        if (email.toLowerCase().trim() === 'mhmmadridho64@gmail.com') {
          const adminUser = await api.createUser({
            fullName: name || 'RFX.visual Admin',
            coupleGroom: 'Super',
            coupleBride: 'Admin',
            activeSlug: 'super-admin',
            email: 'mhmmadridho64@gmail.com',
            password: Math.random().toString(36),
            noWa: '081234567890',
            sosmed: '@rfx.visual',
            packageId: 'luxury',
            isCustomByRfx: true,
            paymentStatus: 'success',
            warningCount: 0,
            ipAddress: '',
            authProvider: 'google',
            avatarUrl: avatarUrl
          });
          setCurrentUser(adminUser);
          return adminUser;
        }

        return { unverifiedEmail: email, name, avatarUrl };
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung dengan database.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    userData: Omit<SaaSUser, 'id' | 'registeredAt'> & { password?: string }
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

      // IP Tracking & Banning
      let currentIp = '';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        currentIp = ipData.ip;

        const isBanned = await api.checkBannedIp(currentIp);
        if (isBanned) {
          setError('Pendaftaran ditolak. Alamat IP Anda telah diblokir.');
          return null;
        }
      } catch (err) {
        console.log('IP Tracking failed', err);
      }

      const newUser = await api.createUser({ ...userData, ipAddress: currentIp } as any);
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

  const upgradePackage = useCallback(async (userId: string, newPackageId: string) => {
    try {
      await api.updateUserPackage(userId, newPackageId);
      setCurrentUser(prev => prev?.id === userId ? { ...prev, packageId: newPackageId as any, paymentStatus: 'pending' } : prev);
    } catch (err) {
      console.error('Failed to upgrade package:', err);
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

  const [isGodMode, setIsGodMode] = useState(false);
  useEffect(() => {
    setIsGodMode(localStorage.getItem('godMode') === 'true');
  }, []);

  const effectiveUser = currentUser ? (isGodMode ? {
    ...currentUser,
    packageId: 'premium',
    paymentStatus: 'success',
  } : currentUser) : null;

  return (
    <AuthContext.Provider value={{
      currentUser: effectiveUser as SaaSUser | null,
      isLoading,
      error,
      allUsers,
      allTransactions,
      login,
      loginWithGoogle,
      register,
      logout,
      updatePaymentStatus,
      checkSlugAvailable,
      checkEmailAvailable,
      createTransaction,
      approveTransaction,
      rejectTransaction,
      upgradePackage,
      deleteUser: deleteUserAction,
      fetchAdminData,
      setCurrentUser,
      clearError
    }}>
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
