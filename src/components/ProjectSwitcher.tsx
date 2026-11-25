'use client';

/**
 * ProjectSwitcher — Dropdown untuk berpindah antar proyek undangan.
 * Premium/Luxury: bisa set custom slug per proyek.
 * Anti-fraud: tidak ada tombol delete.
 */

import React, { useState } from 'react';
import { resolvePublicSlug } from '../lib/utils';
import { ChevronDown, Plus, FileText, Check, Lock, Link2, Pencil } from 'lucide-react';
import { getLimits, formatLimit } from '@/lib/packageLimits';

interface InvitationSummary {
  id: string;
  title: string;
  slug?: string | null;
  themeId: string;
  isPublished: boolean;
  updatedAt?: string;
}

interface ProjectSwitcherProps {
  currentInvitationId: string | null;
  invitations: InvitationSummary[];
  packageId: string;
  userSlug?: string; // user's active_slug (fallback for demo/reguler)
  onSwitch: (invitationId: string) => void;
  onCreate: (title: string) => void;
  onUpdateSlug?: (invitationId: string, newSlug: string) => void;
}

export default function ProjectSwitcher({
  currentInvitationId,
  invitations,
  packageId,
  userSlug,
  onSwitch,
  onCreate,
  onUpdateSlug,
}: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingSlugId, setEditingSlugId] = useState<string | null>(null);
  const [slugInput, setSlugInput] = useState('');

  const limits = getLimits(packageId);
  const maxProjects = limits.maxProjects;
  const canCreateMore = invitations.length < maxProjects;
  const canCustomSlug = packageId === 'premium' || packageId === 'luxury';

  const currentInv = invitations.find(inv => inv.id === currentInvitationId);

  // Don't render if only 1 project and can't create more
  if (invitations.length <= 1 && !canCreateMore) {
    return null;
  }

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreate(newTitle.trim());
    setNewTitle('');
    setIsCreating(false);
    setIsOpen(false);
  };

  const handleSlugSave = (invId: string) => {
    if (!slugInput.trim() || !onUpdateSlug) return;
    onUpdateSlug(invId, slugInput.trim());
    setEditingSlugId(null);
    setSlugInput('');
  };

  const getDisplaySlug = (inv?: InvitationSummary) => {
    if (!inv) return '—';
    return resolvePublicSlug(inv.slug, userSlug, invitations.length) || '—';
  };

  return (
    <div className="mx-3 mb-2 relative">
      {/* Trigger button */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="group/bento w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-[var(--rh-paper)] border border-[var(--rh-line)] hover:border-[var(--rh-line-strong)] transition-all duration-200 text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--rh-primary-soft)] flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-[var(--rh-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-[var(--rh-ink)] truncate transition-transform duration-200 group-hover/bento:translate-x-0.5">
            {currentInv?.title || 'Undangan'}
          </p>
          <p className="text-[9px] text-[var(--rh-muted)] flex min-w-0 items-center gap-1">
            <Link2 className="w-2.5 h-2.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate" title={`/${getDisplaySlug(currentInv || invitations[0])}`}>/{getDisplaySlug(currentInv || invitations[0])}</span>
            <span className="shrink-0 text-[var(--rh-line-strong)]">·</span>
            <span className="shrink-0 whitespace-nowrap">{invitations.length}/{formatLimit(maxProjects)} proyek</span>
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--rh-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[299]" onClick={() => { setIsOpen(false); setIsCreating(false); setEditingSlugId(null); }} />

          <div className="absolute left-0 right-0 top-full mt-1.5 z-[300] bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Project list */}
            <div className="max-h-64 overflow-y-auto p-1.5">
              {invitations.map((inv) => {
                const isActive = inv.id === currentInvitationId;
                const isEditingSlug = editingSlugId === inv.id;

                return (
                  <div key={inv.id} className="mb-1 last:mb-0">
                    <button
                      onClick={() => {
                        if (!isActive) onSwitch(inv.id);
                        if (!isEditingSlug) setIsOpen(false);
                      }}
                      className={`group/bento w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-[var(--rh-primary-soft)] border border-[var(--rh-line-strong)] text-[var(--rh-ink)]'
                          : 'text-[var(--rh-ink-2)] border border-transparent hover:bg-[var(--rh-ivory)] hover:border-[var(--rh-line)]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-[var(--rh-primary)]/10' : 'bg-[var(--rh-linen)]'}`}>
                        <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--rh-primary)]' : 'text-[var(--rh-muted)]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate transition-transform duration-200 group-hover/bento:translate-x-0.5">{inv.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {inv.isPublished && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[var(--rh-primary-soft)] text-[var(--rh-primary)] font-bold uppercase">Live</span>
                          )}
                          <span className="text-[8px] text-[var(--rh-muted)] flex items-center gap-0.5">
                            <Link2 className="w-2 h-2" />/{getDisplaySlug(inv)}
                          </span>
                        </div>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-[var(--rh-primary)] shrink-0" />}
                    </button>

                    {/* Per-project slug editor (Premium/Luxury only) */}
                    {canCustomSlug && isActive && (
                      <div className="px-3 pb-2 pt-1">
                        {isEditingSlug ? (
                          <div className="flex gap-1.5">
                            <div className="flex-1 flex items-center bg-[var(--rh-ivory)] border border-[var(--rh-line)] rounded-lg overflow-hidden">
                              <span className="text-[10px] text-[var(--rh-muted)] pl-2.5">/</span>
                              <input
                                autoFocus
                                type="text"
                                value={slugInput}
                                onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSlugSave(inv.id); if (e.key === 'Escape') setEditingSlugId(null); }}
                                placeholder="custom-slug"
                                className="flex-1 bg-transparent text-[10px] text-[var(--rh-ink)] py-1.5 px-1 focus:outline-none placeholder-[var(--rh-line-strong)] font-mono"
                              />
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSlugSave(inv.id); }}
                              disabled={!slugInput.trim()}
                              className="px-2.5 py-1 bg-[var(--rh-primary)] text-[var(--rh-paper)] rounded-lg text-[9px] font-bold disabled:opacity-30 hover:bg-[var(--rh-primary-hover)] transition"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSlugId(inv.id);
                              setSlugInput(inv.slug || '');
                            }}
                            className="flex items-center gap-1 text-[9px] text-[var(--rh-muted)] hover:text-[var(--rh-primary)] transition"
                          >
                            <Pencil className="w-2.5 h-2.5" />
                            Ubah slug proyek ini
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Separator */}
            <div className="h-px bg-[var(--rh-linen)] mx-2" />

            {/* Create new button */}
            {canCreateMore ? (
              isCreating ? (
                <div className="p-2.5">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Nama proyek baru..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setIsCreating(false); }}
                    className="w-full px-3 py-2 bg-[var(--rh-ivory)] border border-[var(--rh-line)] rounded-lg text-[11px] text-[var(--rh-ink)] placeholder-[var(--rh-muted)] focus:outline-none focus:border-[var(--rh-primary)] focus:ring-1 focus:ring-[var(--rh-primary-soft)] transition"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    <button
                      onClick={handleCreate}
                      disabled={!newTitle.trim()}
                      className="flex-1 py-1.5 bg-[var(--rh-primary)] text-[var(--rh-paper)] rounded-lg text-[12px] font-medium disabled:opacity-30 hover:bg-[var(--rh-primary-hover)] transition"
                    >
                      Buat
                    </button>
                    <button
                      onClick={() => { setIsCreating(false); setNewTitle(''); }}
                      className="px-3 py-1.5 bg-[var(--rh-linen)] text-[var(--rh-muted)] rounded-lg text-[10px] font-bold hover:bg-[var(--rh-line)] transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="group/bento w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[var(--rh-muted)] hover:bg-[var(--rh-ivory)] hover:text-[var(--rh-primary)] transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold transition-transform duration-200 group-hover/bento:translate-x-0.5">Buat Proyek Baru</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2.5 text-[var(--rh-muted)]">
                <Lock className="w-3 h-3" />
                <span className="text-[10px]">Batas proyek tercapai ({formatLimit(maxProjects)})</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
