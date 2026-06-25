'use client';

/**
 * useWeddingData Hook â€” Wedding data management with Turso
 * Menggantikan semua localStorage read/write di App.tsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  WeddingData,
  Guest,
  RSVP,
  WeddingAnalytics,
  VisitorLog,
  SaaSUser,
} from '../types';
import { DEFAULT_THEMES, DEFAULT_WEDDING_DATA, INITIAL_ANALYTICS } from '../data/defaultData';
import { getLimits } from '../lib/packageLimits';
import * as api from '../lib/api';
import { toastSingleton } from './useToast';

interface InvitationRecord {
  id: string;
  userId: string;
  title: string;
  slug?: string | null;
  themeId: string;
  weddingData: WeddingData;
  isPublished: boolean;
  publishedAt: string | null;
  activatedAt?: string | null;
  expiresAt?: string | null;
  isExpired?: boolean;
}

interface UseWeddingDataReturn {
  // Core data
  weddingData: WeddingData;
  themeId: string;
  guests: Guest[];
  rsvps: RSVP[];
  analytics: WeddingAnalytics;
  invitation: InvitationRecord | null;
  themeHistory: { id?: string; themeId: string; name: string; editedAt: string; weddingData?: WeddingData; note?: string }[];

  // Multi-project
  allInvitations: InvitationRecord[];
  switchInvitation: (invitationId: string) => Promise<void>;
  createNewInvitation: (title: string) => Promise<string | null>;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Setters (auto-save to Turso with debounce)
  setWeddingData: (data: WeddingData | ((prev: WeddingData) => WeddingData)) => void;
  setThemeId: (id: string) => void;

  // Guest operations
  addGuest: (guestData: Omit<Guest, 'id' | 'invitationCode'>) => Promise<void>;
  removeGuest: (id: string) => Promise<void>;
  updateGuestStatus: (id: string, status: Guest['status']) => Promise<void>;

  // RSVP operations
  addRSVP: (rsvp: Omit<RSVP, 'id'>) => Promise<void>;
  deleteRSVP: (id: string) => Promise<void>;

  // Visitor log
  addVisitorLog: (log: Omit<VisitorLog, 'id'>) => Promise<void>;

  // Analytics (re-computed from Turso data)
  refreshAnalytics: () => Promise<void>;

  // Snapshot operations
  saveDesignSnapshot: (name: string) => Promise<void>;
  revertDesignSnapshot: (snapshot: any) => void;
  deleteDesignSnapshot: (snapshotId: string) => Promise<void>;

  // Invitation operations
  publishInvitation: () => Promise<void>;
  unpublishInvitation: () => Promise<void>;

  // Load data for a user
  loadUserData: (user: SaaSUser) => Promise<void>;

  // Load public invitation by slug
  loadPublicInvitation: (slug: string) => Promise<boolean>;

  // Set analytics directly (for simulations)
  setAnalytics: (data: WeddingAnalytics | ((prev: WeddingAnalytics) => WeddingAnalytics)) => void;
  setRsvps: (data: RSVP[] | ((prev: RSVP[]) => RSVP[])) => void;
  setGuests: (data: Guest[] | ((prev: Guest[]) => Guest[])) => void;
}

/**
 * Komputasi traffic harian dari visitor_logs dan rsvps
 * Group by date (YYYY-MM-DD) dari timestamp â€” ditampilkan di AnalyticsDashboard
 */
function computeDailyTraffic(
  visitorLogs: VisitorLog[],
  rsvps: RSVP[]
): { date: string; views: number; rsvpCount: number }[] {
  const byDate: Record<string, { views: number; rsvpCount: number }> = {};

  for (const log of visitorLogs) {
    const raw = log.timestamp || '';
    const date = raw.includes('T') ? raw.split('T')[0] : raw.slice(0, 10) || new Date().toISOString().split('T')[0];
    if (!byDate[date]) byDate[date] = { views: 0, rsvpCount: 0 };
    byDate[date].views += 1;
  }

  for (const rsvp of rsvps) {
    const raw = rsvp.timestamp || '';
    const date = raw.includes('T') ? raw.split('T')[0] : raw.slice(0, 10) || new Date().toISOString().split('T')[0];
    if (!byDate[date]) byDate[date] = { views: 0, rsvpCount: 0 };
    byDate[date].rsvpCount += 1;
  }

  return Object.entries(byDate)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // tampilkan 30 hari terakhir
}

export function useWeddingData(): UseWeddingDataReturn {
  const [weddingData, setWeddingDataLocal] = useState<WeddingData>(DEFAULT_WEDDING_DATA);
  const [themeId, setThemeIdLocal] = useState<string>('rfx-dark');
  const [guests, setGuestsLocal] = useState<Guest[]>([]);
  const [rsvps, setRsvpsLocal] = useState<RSVP[]>([]);
  const [analytics, setAnalyticsLocal] = useState<WeddingAnalytics>(INITIAL_ANALYTICS);
  const [invitation, setInvitation] = useState<InvitationRecord | null>(null);
  const [allInvitations, setAllInvitations] = useState<InvitationRecord[]>([]);
  const [themeHistory, setThemeHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce timer ref for auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserRef = useRef<SaaSUser | null>(null);

  // Refs to always have latest values in callbacks (fixes stale closure bug)
  const invitationIdRef = useRef<string | null>(null);
  const weddingDataRef = useRef<WeddingData>(weddingData);
  const themeIdRef = useRef<string>(themeId);

  // Keep refs in sync with state
  useEffect(() => { invitationIdRef.current = invitation?.id ?? null; }, [invitation?.id]);
  useEffect(() => { weddingDataRef.current = weddingData; }, [weddingData]);
  useEffect(() => { themeIdRef.current = themeId; }, [themeId]);

  // Auto-save wedding data to Turso (debounced 2 seconds)
  // Uses refs instead of closure values to avoid stale closure bug
  const scheduleAutoSave = useCallback((data: WeddingData) => {
    const invId = invitationIdRef.current;
    const currentThemeId = themeIdRef.current;
    console.log('[DEBUG] scheduleAutoSave called, invId =', invId, ', themeId =', currentThemeId);
    if (!invId) {
      console.warn('[DEBUG] ❌ scheduleAutoSave SKIPPED — invitationId is null!');
      return;
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Re-read refs at execution time for freshest values
        const latestThemeId = themeIdRef.current;
        console.log('[DEBUG] 📡 Calling api.updateInvitationData...', { invId, themeId: latestThemeId, dataKeys: Object.keys(data) });
        await api.updateInvitationData(invId, data, latestThemeId);
        console.log('[DEBUG] ✅ Auto-save SUCCESS');
      } catch (err) {
        console.error('[DEBUG] ❌ Auto-save FAILED:', err);
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  }, []); // No deps needed — uses refs

  // Wrapper for setWeddingData that triggers auto-save
  const setWeddingData = useCallback((update: WeddingData | ((prev: WeddingData) => WeddingData)) => {
    setWeddingDataLocal(prev => {
      const newData = typeof update === 'function' ? update(prev) : update;
      scheduleAutoSave(newData);
      return newData;
    });
  }, [scheduleAutoSave]);

  const setThemeId = useCallback((newThemeId: string) => {
    const invId = invitationIdRef.current;
    console.log('[DEBUG] setThemeId called:', newThemeId, ', invId =', invId);
    setThemeIdLocal(newThemeId);
    themeIdRef.current = newThemeId; // Update ref immediately
    if (invId) {
      // Save theme change immediately — use ref for latest weddingData
      const currentData = weddingDataRef.current;
      console.log('[DEBUG] 📡 Saving theme change to DB...');
      api.updateInvitationData(invId, currentData, newThemeId)
        .then(() => console.log('[DEBUG] ✅ Theme save SUCCESS'))
        .catch((err) => console.error('[DEBUG] ❌ Theme save FAILED:', err));
    } else {
      console.warn('[DEBUG] ❌ Theme save SKIPPED — invitationId is null!');
    }
  }, []); // No deps needed — uses refs

  // Load all user data from Turso
  const loadUserData = useCallback(async (user: SaaSUser) => {
    if (!user || !user.id) {
      console.error("loadUserData called with invalid user:", user);
      throw new Error("Sistem gagal memuat data: ID Pengguna tidak valid.");
    }
    
    setIsLoading(true);
    currentUserRef.current = user;
    try {
      // Fetch or create invitation
      let inv = await api.getInvitationByUserId(user.id);

      if (!inv) {
        // Create default invitation for new user
        const defaultData: WeddingData = {
          ...DEFAULT_WEDDING_DATA,
          couple: {
            groom: {
              ...DEFAULT_WEDDING_DATA.couple.groom,
              nickname: user.coupleGroom,
              fullName: `${user.coupleGroom}`,
            },
            bride: {
              ...DEFAULT_WEDDING_DATA.couple.bride,
              nickname: user.coupleBride,
              fullName: `${user.coupleBride}`,
            },
          },
        };
        const invId = await api.createInvitation(
          user.id,
          `Undangan ${user.coupleGroom} & ${user.coupleBride}`,
          'rfx-dark',
          defaultData
        );
        inv = {
          id: invId,
          userId: user.id,
          title: `Undangan ${user.coupleGroom} & ${user.coupleBride}`,
          themeId: 'rfx-dark',
          weddingData: defaultData,
          isPublished: false,
          publishedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // If invitation has empty wedding data (e.g. from auto-create), repopulate with defaults
      const isEmptyData = !inv.weddingData || !inv.weddingData.couple || Object.keys(inv.weddingData).length === 0;
      if (isEmptyData) {
        const defaultData: WeddingData = {
          ...DEFAULT_WEDDING_DATA,
          couple: {
            groom: {
              ...DEFAULT_WEDDING_DATA.couple.groom,
              nickname: user.coupleGroom,
              fullName: `${user.coupleGroom}`,
            },
            bride: {
              ...DEFAULT_WEDDING_DATA.couple.bride,
              nickname: user.coupleBride,
              fullName: `${user.coupleBride}`,
            },
          },
        };
        inv.weddingData = defaultData;
        // Save repopulated data to DB immediately
        await api.updateInvitationData(inv.id, defaultData, inv.themeId);
      }

      // Auto-activate invitation if not yet activated:
      // - Demo users: activate immediately (no payment needed)
      // - Paid users: activate if payment is 'success' but activated_at is still null
      if (!inv.activatedAt) {
        const shouldActivate = user.packageId === 'demo' || user.paymentStatus === 'success';
        if (shouldActivate) {
          try {
            await api.activateInvitation(inv.id, user.packageId);
            // Re-fetch to get updated activated_at/expires_at
            const refreshed = await api.getInvitationByUserId(user.id);
            if (refreshed) inv = refreshed;
          } catch (e) {
            console.warn('[loadUserData] Auto-activation failed (migration 003 not run?):', e);
          }
        }
      }

      setInvitation(inv);
      invitationIdRef.current = inv.id; // Update ref immediately so callbacks work right away
      setWeddingDataLocal(inv.weddingData);
      weddingDataRef.current = inv.weddingData;
      setThemeIdLocal(inv.themeId);
      themeIdRef.current = inv.themeId;

      // Fetch ALL invitations for multi-project support
      const allInvs = await api.getInvitationsByUserId(user.id);
      setAllInvitations(allInvs);

      // Load guests, RSVPs, analytics for the active invitation
      const [guestsData, rsvpsData, visitorLogs, snapshots] = await Promise.all([
        api.getGuestsByInvitation(inv.id),
        api.getRSVPsByInvitation(inv.id),
        api.getVisitorLogs(inv.id),
        api.getDesignSnapshots(user.id),
      ]);

      setGuestsLocal(guestsData);
      setRsvpsLocal(rsvpsData);
      setThemeHistory(snapshots);

      // Compute analytics from actual data
      const viewsCount = visitorLogs.length;
      const rsvpHadir = rsvpsData.filter(r => r.status === 'Hadir').length;
      const rsvpAbsen = rsvpsData.filter(r => r.status === 'Tidak Hadir').length;
      const rsvpRagu = rsvpsData.filter(r => r.status === 'Ragu-ragu').length;
      const totalGuestsAttending = rsvpsData
        .filter(r => r.status === 'Hadir')
        .reduce((sum, r) => sum + r.paxCount, 0);

      setAnalyticsLocal({
        viewsCount,
        rsvpHadir,
        rsvpAbsen,
        rsvpRagu,
        totalGuestsAttending,
        dailyTraffic: computeDailyTraffic(visitorLogs, rsvpsData),
        visitorLogs,
      });
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load public invitation by slug (for guest view)
  const loadPublicInvitation = useCallback(async (slug: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const inv = await api.getInvitationBySlug(slug);
      if (!inv) return false;

      setInvitation(inv);
      setWeddingDataLocal(inv.weddingData);
      setThemeIdLocal(inv.themeId);

      // Load guests and RSVPs for public view
      const [guestsData, rsvpsData] = await Promise.all([
        api.getGuestsByInvitation(inv.id),
        api.getRSVPsByInvitation(inv.id),
      ]);

      setGuestsLocal(guestsData);
      setRsvpsLocal(rsvpsData);

      return true;
    } catch (err) {
      console.error('Failed to load public invitation:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guest operations
  const addGuest = useCallback(async (guestData: Omit<Guest, 'id' | 'invitationCode'>) => {
    const invId = invitationIdRef.current;
    if (!invId) {
      toastSingleton.error('Error', 'ID Undangan tidak ditemukan. Silakan muat ulang halaman.');
      return;
    }
    try {
      const newGuest = await api.addGuest(invId, guestData);
      setGuestsLocal(prev => [newGuest, ...prev]);
    } catch (err: any) {
      console.error('Failed to add guest:', err);
      toastSingleton.error('Gagal menyimpan tamu', err.message);
    }
  }, []);

  const removeGuest = useCallback(async (id: string) => {
    try {
      await api.removeGuest(id);
      setGuestsLocal(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Failed to remove guest:', err);
    }
  }, []);

  const updateGuestStatus = useCallback(async (id: string, status: Guest['status']) => {
    try {
      await api.updateGuestStatus(id, status);
      setGuestsLocal(prev => prev.map(g => g.id === id ? { ...g, status } : g));
    } catch (err) {
      console.error('Failed to update guest status:', err);
    }
  }, []);

  // RSVP operations
  const addRSVP = useCallback(async (rsvpData: Omit<RSVP, 'id'>) => {
    const invId = invitationIdRef.current;
    if (!invId) {
      toastSingleton.error('Error', 'ID Undangan tidak ditemukan.');
      return;
    }
    try {
      const newRSVP = await api.addRSVP(invId, rsvpData);
      setRsvpsLocal(prev => [newRSVP, ...prev]);

      // Update guest status if matched
      if (rsvpData.guestId) {
        await api.updateGuestStatus(rsvpData.guestId, 'Opened');
        setGuestsLocal(prev => prev.map(g => g.id === rsvpData.guestId ? { ...g, status: 'Opened' } : g));
      }

      // Update analytics locally
      setAnalyticsLocal(prev => ({
        ...prev,
        rsvpHadir: prev.rsvpHadir + (rsvpData.status === 'Hadir' ? 1 : 0),
        rsvpAbsen: prev.rsvpAbsen + (rsvpData.status === 'Tidak Hadir' ? 1 : 0),
        rsvpRagu: prev.rsvpRagu + (rsvpData.status === 'Ragu-ragu' ? 1 : 0),
        totalGuestsAttending: prev.totalGuestsAttending + (rsvpData.status === 'Hadir' ? rsvpData.paxCount : 0),
        visitorLogs: [
          {
            id: `vlog-rsvp-${Date.now()}`,
            guestName: `${rsvpData.guestName} (${rsvpData.status})`,
            device: /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
            browser: 'Melakukan RSVP',
            timestamp: 'Baru Saja',
          },
          ...prev.visitorLogs,
        ],
      }));
    } catch (err: any) {
      console.error('Failed to add RSVP:', err);
      toastSingleton.error('Gagal menyimpan RSVP', err.message);
    }
  }, []);

  const deleteRSVP = useCallback(async (id: string) => {
    try {
      await api.deleteRSVP(id);
      setRsvpsLocal(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete RSVP:', err);
    }
  }, []);

  // Visitor log
  const addVisitorLogAction = useCallback(async (log: Omit<VisitorLog, 'id'>) => {
    const invId = invitationIdRef.current;
    if (!invId) return;
    try {
      await api.addVisitorLog(invId, log);
      setAnalyticsLocal(prev => ({
        ...prev,
        viewsCount: prev.viewsCount + 1,
        visitorLogs: [
          { ...log, id: `vlog-${Date.now()}` },
          ...prev.visitorLogs,
        ],
      }));
    } catch (err) {
      console.error('Failed to log visitor:', err);
    }
  }, []);

  // Refresh analytics from server
  const refreshAnalytics = useCallback(async () => {
    const invId = invitationIdRef.current;
    if (!invId) return;
    try {
      const [rsvpsData, visitorLogs] = await Promise.all([
        api.getRSVPsByInvitation(invId),
        api.getVisitorLogs(invId),
      ]);

      setRsvpsLocal(rsvpsData);

      const viewsCount = visitorLogs.length;
      const rsvpHadir = rsvpsData.filter(r => r.status === 'Hadir').length;
      const rsvpAbsen = rsvpsData.filter(r => r.status === 'Tidak Hadir').length;
      const rsvpRagu = rsvpsData.filter(r => r.status === 'Ragu-ragu').length;
      const totalGuestsAttending = rsvpsData
        .filter(r => r.status === 'Hadir')
        .reduce((sum, r) => sum + r.paxCount, 0);

      setAnalyticsLocal({
        viewsCount,
        rsvpHadir,
        rsvpAbsen,
        rsvpRagu,
        totalGuestsAttending,
        dailyTraffic: computeDailyTraffic(visitorLogs, rsvpsData),
        visitorLogs,
      });
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
    }
  }, []);

  // Design snapshots
  const saveDesignSnapshot = useCallback(async (name: string) => {
    const invId = invitationIdRef.current;
    const currentThemeId = themeIdRef.current;
    const currentData = weddingDataRef.current;
    if (!currentUserRef.current || !invId) return;
    const themeObj = DEFAULT_THEMES.find(t => t.id === currentThemeId);
    if (!themeObj) return;

    try {
      const snapId = await api.saveDesignSnapshot(
        currentUserRef.current.id,
        invId,
        currentThemeId,
        themeObj.name,
        currentData,
        `Snapshot Kustom: ${name}`
      );

      const newSnap = {
        id: snapId,
        themeId: currentThemeId,
        name: themeObj.name,
        editedAt: new Date().toLocaleDateString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
        weddingData: JSON.parse(JSON.stringify(currentData)),
        note: `Snapshot Kustom: ${name}`,
      };

      setThemeHistory(prev => [newSnap, ...prev].slice(0, 20));
    } catch (err: any) {
      console.error('Failed to save snapshot:', err);
      toastSingleton.error('Gagal menyimpan checkpoint', err.message || 'Error internal');
      throw err;
    }
  }, []);

  const revertDesignSnapshot = useCallback((snapshot: any) => {
    if (snapshot.themeId) setThemeIdLocal(snapshot.themeId);
    if (snapshot.weddingData) {
      setWeddingDataLocal(snapshot.weddingData);
      weddingDataRef.current = snapshot.weddingData;
      // Also save to Turso
      const invId = invitationIdRef.current;
      if (invId) {
        api.updateInvitationData(invId, snapshot.weddingData, snapshot.themeId).catch(console.error);
      }
    }
  }, []);

  const deleteDesignSnapshotAction = useCallback(async (snapshotId: string) => {
    try {
      await api.deleteDesignSnapshot(snapshotId);
      setThemeHistory(prev => prev.filter(s => s.id !== snapshotId));
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
    }
  }, []);

  // Publish / Unpublish — uses refs to avoid stale closures
  const publishInvitationAction = useCallback(async () => {
    const invId = invitationIdRef.current;
    const currentData = weddingDataRef.current;
    const currentThemeId = themeIdRef.current;
    console.log('[DEBUG] 🚀 publishInvitationAction called, invId =', invId);
    if (!invId) {
      console.error('[DEBUG] ❌ PUBLISH ABORTED — invitationId is null!');
      return;
    }
    try {
      // Cancel any pending debounced save
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      // Force save current weddingData + themeId to DB BEFORE publish
      console.log('[DEBUG] 📡 Force-saving draft before publish...', { invId, themeId: currentThemeId });
      await api.updateInvitationData(invId, currentData, currentThemeId);
      console.log('[DEBUG] ✅ Draft saved');

      // Save design snapshot as backup
      try {
        await saveDesignSnapshot("Auto-save sebelum Publish");
      } catch (e) {
        console.warn("Auto-save snapshot gagal, melanjutkan publish");
      }
      
      // Now publish — this copies wedding_data → published_wedding_data
      console.log('[DEBUG] 📡 Publishing invitation...');
      await api.publishInvitation(invId);
      console.log('[DEBUG] ✅ PUBLISH SUCCESS');
      setInvitation(prev => prev ? { ...prev, isPublished: true, publishedAt: new Date().toISOString() } : prev);
    } catch (err) {
      console.error('[DEBUG] ❌ PUBLISH FAILED:', err);
      toastSingleton.error('Gagal mempublikasi undangan', String(err));
    }
  }, [saveDesignSnapshot]); // Only depends on saveDesignSnapshot, rest via refs

  const unpublishInvitationAction = useCallback(async () => {
    const invId = invitationIdRef.current;
    if (!invId) return;
    try {
      await api.unpublishInvitation(invId);
      setInvitation(prev => prev ? { ...prev, isPublished: false } : prev);
    } catch (err) {
      console.error('Failed to unpublish:', err);
    }
  }, []);

  // Multi-project: switch to a different invitation
  const switchInvitation = useCallback(async (invitationId: string) => {
    const user = currentUserRef.current;
    if (!user) return;

    // Cancel any pending auto-save for the old invitation
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setIsLoading(true);
    try {
      // Find the target invitation from allInvitations or fetch fresh
      const allInvs = await api.getInvitationsByUserId(user.id);
      let targetInv = allInvs.find(i => i.id === invitationId);
      if (!targetInv) {
        console.error('[switchInvitation] Invitation not found:', invitationId);
        return;
      }

      // Auto-activate if not yet activated (same logic as loadUserData)
      if (!targetInv.activatedAt) {
        const shouldActivate = user.packageId === 'demo' || user.paymentStatus === 'success';
        if (shouldActivate) {
          try {
            await api.activateInvitation(targetInv.id, user.packageId);
            // Re-fetch to get updated activated_at/expires_at
            const refreshedAll = await api.getInvitationsByUserId(user.id);
            const refreshed = refreshedAll.find(i => i.id === invitationId);
            if (refreshed) {
              targetInv = refreshed;
              allInvs.splice(allInvs.findIndex(i => i.id === invitationId), 1, refreshed);
            }
          } catch (e) {
            console.warn('[switchInvitation] Auto-activation failed:', e);
          }
        }
      }

      // Update all state to reflect the new active invitation
      setInvitation(targetInv);
      setAllInvitations(allInvs);
      invitationIdRef.current = targetInv.id;
      setWeddingDataLocal(targetInv.weddingData);
      weddingDataRef.current = targetInv.weddingData;
      setThemeIdLocal(targetInv.themeId);
      themeIdRef.current = targetInv.themeId;

      // Load guests, RSVPs, analytics for the new invitation
      const [guestsData, rsvpsData, visitorLogs, snapshots] = await Promise.all([
        api.getGuestsByInvitation(targetInv.id),
        api.getRSVPsByInvitation(targetInv.id),
        api.getVisitorLogs(targetInv.id),
        api.getDesignSnapshots(user.id),
      ]);

      setGuestsLocal(guestsData);
      setRsvpsLocal(rsvpsData);
      setThemeHistory(snapshots);

      const viewsCount = visitorLogs.length;
      const rsvpHadir = rsvpsData.filter(r => r.status === 'Hadir').length;
      const rsvpAbsen = rsvpsData.filter(r => r.status === 'Tidak Hadir').length;
      const rsvpRagu = rsvpsData.filter(r => r.status === 'Ragu-ragu').length;
      const totalGuestsAttending = rsvpsData.filter(r => r.status === 'Hadir').reduce((sum, r) => sum + r.paxCount, 0);

      setAnalyticsLocal({
        viewsCount,
        rsvpHadir,
        rsvpAbsen,
        rsvpRagu,
        totalGuestsAttending,
        dailyTraffic: computeDailyTraffic(visitorLogs, rsvpsData),
        visitorLogs,
      });

      toastSingleton.success('Proyek Dipindah', `Sekarang mengedit: ${targetInv.title}`);
    } catch (err) {
      console.error('[switchInvitation] Failed:', err);
      toastSingleton.error('Gagal Pindah Proyek', String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Multi-project: create a new invitation (respects tier limit)
  const createNewInvitation = useCallback(async (title: string): Promise<string | null> => {
    const user = currentUserRef.current;
    if (!user) return null;

    const limits = getLimits(user.packageId);
    const currentCount = allInvitations.length;

    if (currentCount >= limits.maxProjects) {
      toastSingleton.error(
        'Batas Proyek Tercapai',
        `Tier ${user.packageId} hanya bisa memiliki ${limits.maxProjects} proyek. Upgrade untuk menambah proyek.`
      );
      return null;
    }

    setIsLoading(true);
    try {
      const defaultData: WeddingData = {
        ...DEFAULT_WEDDING_DATA,
        couple: {
          groom: { ...DEFAULT_WEDDING_DATA.couple.groom, nickname: user.coupleGroom, fullName: user.coupleGroom },
          bride: { ...DEFAULT_WEDDING_DATA.couple.bride, nickname: user.coupleBride, fullName: user.coupleBride },
        },
      };

      const invId = await api.createInvitation(user.id, title || `Undangan ${currentCount + 1}`, 'rfx-dark', defaultData);

      // Activate the new invitation if user is paid/demo
      if (user.packageId === 'demo' || user.paymentStatus === 'success') {
        try { await api.activateInvitation(invId, user.packageId); } catch (_) {}
      }

      // Switch to the new invitation
      await switchInvitation(invId);

      toastSingleton.success('Proyek Baru Dibuat', `"${title}" berhasil dibuat!`);
      return invId;
    } catch (err) {
      console.error('[createNewInvitation] Failed:', err);
      toastSingleton.error('Gagal Membuat Proyek', String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [allInvitations.length, switchInvitation]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Update invitation slug (for Premium/Luxury custom slugs)
  const updateInvitationSlugAction = useCallback(async (invitationId: string, newSlug: string) => {
    try {
      const result = await api.updateInvitationSlug(invitationId, newSlug);
      if (!result.success) {
        toastSingleton.error('Gagal Update Slug', result.error || 'Slug tidak tersedia.');
        return;
      }
      // Update local state
      setAllInvitations(prev =>
        prev.map(inv => inv.id === invitationId ? { ...inv, slug: newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-') } : inv)
      );
      toastSingleton.success('Slug Diperbarui', `Slug berhasil diubah menjadi /${newSlug}`);
    } catch (err) {
      console.error('[updateInvitationSlug] Failed:', err);
      toastSingleton.error('Gagal Update Slug', String(err));
    }
  }, []);

  return {
    weddingData,
    themeId,
    guests,
    rsvps,
    analytics,
    invitation,
    allInvitations,
    themeHistory,
    isLoading,
    isSaving,
    setWeddingData,
    setThemeId,
    addGuest,
    removeGuest,
    updateGuestStatus,
    addRSVP,
    deleteRSVP,
    addVisitorLog: addVisitorLogAction,
    refreshAnalytics,
    saveDesignSnapshot,
    revertDesignSnapshot,
    deleteDesignSnapshot: deleteDesignSnapshotAction,
    publishInvitation: publishInvitationAction,
    unpublishInvitation: unpublishInvitationAction,
    loadUserData,
    loadPublicInvitation,
    switchInvitation,
    createNewInvitation,
    updateInvitationSlug: updateInvitationSlugAction,
    setAnalytics: setAnalyticsLocal,
    setRsvps: setRsvpsLocal,
    setGuests: setGuestsLocal,
  };
}
