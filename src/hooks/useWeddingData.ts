'use client';

/**
 * useWeddingData Hook — Wedding data management with Turso
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
import * as api from '../lib/api';

interface InvitationRecord {
  id: string;
  userId: string;
  title: string;
  themeId: string;
  weddingData: WeddingData;
  isPublished: boolean;
  publishedAt: string | null;
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

export function useWeddingData(): UseWeddingDataReturn {
  const [weddingData, setWeddingDataLocal] = useState<WeddingData>(DEFAULT_WEDDING_DATA);
  const [themeId, setThemeIdLocal] = useState<string>('rfx-dark');
  const [guests, setGuestsLocal] = useState<Guest[]>([]);
  const [rsvps, setRsvpsLocal] = useState<RSVP[]>([]);
  const [analytics, setAnalyticsLocal] = useState<WeddingAnalytics>(INITIAL_ANALYTICS);
  const [invitation, setInvitation] = useState<InvitationRecord | null>(null);
  const [themeHistory, setThemeHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce timer ref for auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserRef = useRef<SaaSUser | null>(null);

  // Auto-save wedding data to Turso (debounced 2 seconds)
  const scheduleAutoSave = useCallback((data: WeddingData) => {
    if (!invitation?.id) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await api.updateInvitationData(invitation.id, data);
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  }, [invitation?.id]);

  // Wrapper for setWeddingData that triggers auto-save
  const setWeddingData = useCallback((update: WeddingData | ((prev: WeddingData) => WeddingData)) => {
    setWeddingDataLocal(prev => {
      const newData = typeof update === 'function' ? update(prev) : update;
      scheduleAutoSave(newData);
      return newData;
    });
  }, [scheduleAutoSave]);

  const setThemeId = useCallback((newThemeId: string) => {
    setThemeIdLocal(newThemeId);
    if (invitation?.id) {
      // Save theme change immediately
      api.updateInvitationData(invitation.id, weddingData, newThemeId).catch(console.error);
    }
  }, [invitation?.id, weddingData]);

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

      setInvitation(inv);
      setWeddingDataLocal(inv.weddingData);
      setThemeIdLocal(inv.themeId);

      // Load guests, RSVPs, analytics
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
        dailyTraffic: [], // Will be computed from visitor_logs if needed
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
    if (!invitation?.id) {
      alert("Error: ID Undangan tidak ditemukan. Silakan muat ulang halaman.");
      return;
    }
    try {
      const newGuest = await api.addGuest(invitation.id, guestData);
      setGuestsLocal(prev => [newGuest, ...prev]);
    } catch (err: any) {
      console.error('Failed to add guest:', err);
      alert("Gagal menyimpan tamu: " + err.message);
    }
  }, [invitation?.id]);

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
    if (!invitation?.id) {
      alert("Error: ID Undangan tidak ditemukan.");
      return;
    }
    try {
      const newRSVP = await api.addRSVP(invitation.id, rsvpData);
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
      alert("Gagal menyimpan RSVP: " + err.message);
    }
  }, [invitation?.id]);

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
    if (!invitation?.id) return;
    try {
      await api.addVisitorLog(invitation.id, log);
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
  }, [invitation?.id]);

  // Refresh analytics from server
  const refreshAnalytics = useCallback(async () => {
    if (!invitation?.id) return;
    try {
      const [rsvpsData, visitorLogs] = await Promise.all([
        api.getRSVPsByInvitation(invitation.id),
        api.getVisitorLogs(invitation.id),
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
        dailyTraffic: [],
        visitorLogs,
      });
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
    }
  }, [invitation?.id]);

  // Design snapshots
  const saveDesignSnapshot = useCallback(async (name: string) => {
    if (!currentUserRef.current || !invitation?.id) return;
    const themeObj = DEFAULT_THEMES.find(t => t.id === themeId);
    if (!themeObj) return;

    try {
      const snapId = await api.saveDesignSnapshot(
        currentUserRef.current.id,
        invitation.id,
        themeId,
        themeObj.name,
        weddingData,
        `Snapshot Kustom: ${name}`
      );

      const newSnap = {
        id: snapId,
        themeId,
        name: themeObj.name,
        editedAt: new Date().toLocaleDateString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
        weddingData: JSON.parse(JSON.stringify(weddingData)),
        note: `Snapshot Kustom: ${name}`,
      };

      setThemeHistory(prev => [newSnap, ...prev].slice(0, 20));
    } catch (err: any) {
      console.error('Failed to save snapshot:', err);
      alert('Gagal menyimpan checkpoint: ' + (err.message || 'Error internal'));
      throw err;
    }
  }, [invitation?.id, themeId, weddingData]);

  const revertDesignSnapshot = useCallback((snapshot: any) => {
    if (snapshot.themeId) setThemeIdLocal(snapshot.themeId);
    if (snapshot.weddingData) {
      setWeddingDataLocal(snapshot.weddingData);
      // Also save to Turso
      if (invitation?.id) {
        api.updateInvitationData(invitation.id, snapshot.weddingData, snapshot.themeId).catch(console.error);
      }
    }
  }, [invitation?.id]);

  const deleteDesignSnapshotAction = useCallback(async (snapshotId: string) => {
    try {
      await api.deleteDesignSnapshot(snapshotId);
      setThemeHistory(prev => prev.filter(s => s.id !== snapshotId));
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
    }
  }, []);

  // Publish / Unpublish
  const publishInvitationAction = useCallback(async () => {
    if (!invitation?.id) return;
    try {
      // Auto save before publish
      try {
        await saveDesignSnapshot("Auto-save sebelum Publish");
      } catch (e) {
        // Abaikan error snapshot jika gagal, tetap publish
        console.warn("Auto-save snapshot gagal, melanjutkan publish");
      }
      
      await api.publishInvitation(invitation.id);
      setInvitation(prev => prev ? { ...prev, isPublished: true, publishedAt: new Date().toISOString() } : prev);
    } catch (err) {
      console.error('Failed to publish:', err);
      alert("Gagal mempublikasi undangan: " + err);
    }
  }, [invitation?.id, saveDesignSnapshot]);

  const unpublishInvitationAction = useCallback(async () => {
    if (!invitation?.id) return;
    try {
      await api.unpublishInvitation(invitation.id);
      setInvitation(prev => prev ? { ...prev, isPublished: false } : prev);
    } catch (err) {
      console.error('Failed to unpublish:', err);
    }
  }, [invitation?.id]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return {
    weddingData,
    themeId,
    guests,
    rsvps,
    analytics,
    invitation,
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
    setAnalytics: setAnalyticsLocal,
    setRsvps: setRsvpsLocal,
    setGuests: setGuestsLocal,
  };
}
