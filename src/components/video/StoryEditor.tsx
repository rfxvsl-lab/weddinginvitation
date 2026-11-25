'use client';

/**
 * Formulir Video Cerita: pemeran (foto wajah), gaya gambar, momen kisah, penutup,
 * dan pembuatan gambar AI per adegan (dengan status & buat ulang per momen).
 */

import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
  BookOpen,
  Palette,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { StoryMoment, StoryProject } from '@/types';
import { uploadWeddingPhoto } from '@/lib/cloudinary';
import { STORY_LIMITS, STORY_STYLES, momentReady, momentSig, newMoment, sheetSig, storyDuration, type ResolvedStory } from '@/lib/video/story/model';

interface Props {
  story: ResolvedStory;
  onChange: (next: StoryProject) => void;
  groomName: string;
  brideName: string;
  venue: string;
  isEnt: boolean;
  disabled?: boolean;
}

type StepState = 'idle' | 'running' | 'done' | 'error';

const card = 'glx rounded-[26px] p-5 space-y-3.5';
const h3 = 'flex items-center gap-2 text-[13px] font-bold text-[var(--rh-ink)]';
const input =
  'w-full rounded-2xl border border-white/80 bg-white/80 px-3.5 py-2.5 text-[13px] text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rh-primary)]/40 disabled:opacity-60';
const lbl = 'block text-[12px] font-semibold text-[var(--rh-ink)]';

function Field({ label, count, max, children }: { label: string; count?: number; max?: number; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex justify-between text-[12px] font-semibold text-[var(--rh-ink)]">
        <span>{label}</span>
        {max !== undefined && (
          <span className="tabular font-normal text-[var(--rh-muted)]">
            {count ?? 0}/{max}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

export default function StoryEditor({ story, onChange, groomName, brideName, venue, isEnt, disabled }: Props) {
  const [uploading, setUploading] = useState<'groom' | 'bride' | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [genError, setGenError] = useState<string | null>(null);
  const [mock, setMock] = useState(false);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // Salinan terbaru untuk ditulis bertahap selama proses panjang.
  const latest = useRef(story);
  latest.current = story;
  const commit = (patch: Partial<StoryProject>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next as ResolvedStory;
    onChange(next);
  };

  const busy = disabled || running;
  const moments = story.moments;
  const setMoment = (id: string, patch: Partial<StoryMoment>) =>
    commit({ moments: moments.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= moments.length) return;
    const next = [...moments];
    [next[i], next[j]] = [next[j], next[i]];
    commit({ moments: next });
  };

  const onPhotos = async (who: 'groom' | 'bride', files: FileList | null) => {
    if (!files?.length) return;
    setUploadErr(null);
    setUploading(who);
    try {
      const have = story[who].photos;
      const room = STORY_LIMITS.photosPerPerson - have.length;
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, room)) urls.push((await uploadWeddingPhoto(f)).secureUrl);
      commit({ [who]: { ...story[who], photos: [...have, ...urls] } } as Partial<StoryProject>);
    } catch (e) {
      setUploadErr(`Foto gagal diunggah: ${(e as Error).message}`);
    } finally {
      setUploading(null);
    }
  };

  const sheetFresh = !!story.characterSheet && story.characterSheetSig === sheetSig(story);
  const momentFresh = (m: StoryMoment) => {
    const a = story.assets[m.id];
    return !!(a?.bg && a?.chars && a.sig === momentSig(m, story.style) && sheetFresh);
  };
  const finaleFresh = !!(story.finale?.bg && story.finale?.chars && story.finale.sig === `${story.style}|${venue}` && sheetFresh);
  const readyMoments = moments.filter(momentReady);
  const canGenerate =
    isEnt && story.consent && story.groom.photos.length > 0 && story.bride.photos.length > 0 && readyMoments.length >= STORY_LIMITS.minMoments;
  const doneCount = (sheetFresh ? 1 : 0) + readyMoments.filter(momentFresh).length + (finaleFresh ? 1 : 0);
  const totalCount = 1 + readyMoments.length + 1;

  const generate = async (only?: { momentId?: string; finale?: boolean; all?: boolean }) => {
    if (!canGenerate || running) return;
    const { generateCharacterSheet, generateMomentAssets, generateFinaleAssets } = await import('@/lib/video/story/generate');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRunning(true);
    setGenError(null);
    const ctx = {
      style: story.style,
      groomLook: story.groom.look,
      brideLook: story.bride.look,
      venue,
      signal: ctrl.signal,
      upload: async (blob: Blob, name: string) => {
        const res = await uploadWeddingPhoto(new File([blob], name, { type: blob.type || 'image/png' }));
        return res.secureUrl;
      },
      onMock: () => setMock(true),
    };
    const mark = (k: string, s: StepState) => setSteps((p) => ({ ...p, [k]: s }));
    try {
      let sheet = latest.current.characterSheet;
      if (!sheetFresh || only?.all) {
        mark('sheet', 'running');
        sheet = await generateCharacterSheet(ctx, story.groom.photos, story.bride.photos);
        commit({ characterSheet: sheet, characterSheetSig: sheetSig(story), assets: {}, finale: undefined });
        mark('sheet', 'done');
      }
      if (!sheet) throw new Error('Lembar karakter belum ada.');
      const regenAll = only?.all || !sheetFresh;
      const targets = readyMoments.filter((m) => (only?.momentId ? m.id === only.momentId : only?.finale ? false : regenAll || !momentFresh(m)));
      // Dua momen sekaligus: cukup cepat tanpa membebani kuota.
      const queue = [...targets];
      const failures: string[] = [];
      const worker = async () => {
        while (queue.length) {
          const m = queue.shift()!;
          mark(m.id, 'running');
          try {
            const asset = await generateMomentAssets(ctx, sheet!, m);
            commit({ assets: { ...latest.current.assets, [m.id]: asset } });
            mark(m.id, 'done');
          } catch (e) {
            if (ctrl.signal.aborted) throw e;
            mark(m.id, 'error');
            failures.push(`${m.title || 'Momen'}: ${(e as Error).message}`);
          }
        }
      };
      await Promise.all([worker(), worker()]);
      if (!only?.momentId && (only?.finale || regenAll || !finaleFresh)) {
        mark('finale', 'running');
        try {
          const fin = await generateFinaleAssets(ctx, sheet);
          commit({ finale: fin });
          mark('finale', 'done');
        } catch (e) {
          if (ctrl.signal.aborted) throw e;
          mark('finale', 'error');
          failures.push(`Adegan pernikahan: ${(e as Error).message}`);
        }
      }
      if (failures.length) setGenError(failures.join(' · '));
    } catch (e) {
      setGenError(ctrl.signal.aborted ? 'Pembuatan gambar dihentikan.' : (e as Error).message);
      setSteps((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v === 'running' ? 'error' : v])));
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  const statusIcon = (fresh: boolean, key: string) => {
    const s = steps[key];
    if (s === 'running') return <Loader2 className="h-4 w-4 animate-spin text-[var(--rh-primary)]" aria-label="Sedang dibuat" />;
    if (s === 'error') return <AlertTriangle className="h-4 w-4 text-[#B3261E]" aria-label="Gagal" />;
    if (fresh) return <CheckCircle2 className="h-4 w-4 text-[#3F7A52]" aria-label="Siap" />;
    return <span className="h-4 w-4 rounded-full border border-[var(--rh-muted)]/50" aria-label="Belum dibuat" />;
  };

  return (
    <div className="space-y-5">
      {/* Pemeran */}
      <section className={card} aria-labelledby="st-cast">
        <h3 id="st-cast" className={h3}>
          <Users className="h-4 w-4 text-[var(--rh-primary)]" /> Pemeran
        </h3>
        <p className="text-[11.5px] text-[var(--rh-muted)]">Unggah 1–3 foto wajah yang jelas untuk tiap mempelai. AI menggambar karakter yang mirip dari foto ini.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['groom', 'bride'] as const).map((who) => (
            <div key={who} className="rounded-2xl bg-white/60 border border-white/80 p-3 space-y-2.5">
              <p className="text-[12.5px] font-bold text-[var(--rh-ink)]">
                {who === 'groom' ? 'Mempelai pria' : 'Mempelai wanita'}: {who === 'groom' ? groomName : brideName}
              </p>
              <div className="flex flex-wrap gap-2">
                {story[who].photos.map((u, i) => (
                  <div key={u} className="relative h-16 w-16 overflow-hidden rounded-xl border border-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => commit({ [who]: { ...story[who], photos: story[who].photos.filter((x) => x !== u) } } as Partial<StoryProject>)}
                      className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                      aria-label={`Hapus foto ${i + 1}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {story[who].photos.length < STORY_LIMITS.photosPerPerson && (
                  <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--rh-primary)]/50 bg-white/70 text-[10px] font-semibold text-[var(--rh-ink-2)] hover:bg-white">
                    {uploading === who ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    Foto
                    <input type="file" accept="image/*" multiple className="sr-only" disabled={busy || !!uploading} onChange={(e) => { onPhotos(who, e.target.files); e.target.value = ''; }} />
                  </label>
                )}
              </div>
              <Field label="Ciri penampilan (opsional)" count={story[who].look.length} max={STORY_LIMITS.look}>
                <input
                  className={input}
                  value={story[who].look}
                  maxLength={STORY_LIMITS.look}
                  disabled={busy}
                  placeholder={who === 'groom' ? 'mis. berkacamata, rambut pendek' : 'mis. berhijab, berkacamata'}
                  onChange={(e) => commit({ [who]: { ...story[who], look: e.target.value } } as Partial<StoryProject>)}
                />
              </Field>
            </div>
          ))}
        </div>
        {uploadErr && <p className="text-[12px] font-medium text-[#B3261E]">{uploadErr}</p>}
      </section>

      {/* Gaya */}
      <section className={card} aria-labelledby="st-style">
        <h3 id="st-style" className={h3}>
          <Palette className="h-4 w-4 text-[var(--rh-primary)]" /> Gaya gambar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-labelledby="st-style">
          {STORY_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={story.style === s.id}
              disabled={busy}
              onClick={() => commit({ style: s.id })}
              className={`rounded-2xl border px-3.5 py-3 text-left transition disabled:opacity-55 ${
                story.style === s.id ? 'bg-white/95 border-[var(--rh-primary)] ring-2 ring-[var(--rh-primary)]/20' : 'bg-white/55 border-white/80 hover:bg-white/80'
              }`}
            >
              <span className="block text-[12.5px] font-bold text-[var(--rh-ink)]">{s.label}</span>
              <span className="block text-[11px] text-[var(--rh-muted)]">{s.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Momen */}
      <section className={card} aria-labelledby="st-moments">
        <div className="flex items-center justify-between gap-2">
          <h3 id="st-moments" className={h3}>
            <BookOpen className="h-4 w-4 text-[var(--rh-primary)]" /> Momen kisah ({moments.length}/{STORY_LIMITS.moments})
          </h3>
          <span className="text-[11.5px] text-[var(--rh-muted)] tabular">±{Math.round(storyDuration(Math.max(moments.length, STORY_LIMITS.minMoments)))} dtk</span>
        </div>
        <p className="text-[11.5px] text-[var(--rh-muted)]">
          Ceritakan {STORY_LIMITS.minMoments}–{STORY_LIMITS.moments} momen berurutan: di mana, apa yang terjadi, siapa yang tampil. Tempat dan kejadian menentukan gambar; narasi, dialog, chat, dan angka tampil sebagai teks di video.
        </p>
        <ol className="space-y-3">
          {moments.map((m, i) => (
            <li key={m.id} className="rounded-2xl bg-white/60 border border-white/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[12.5px] font-bold text-[var(--rh-ink)]">
                  {statusIcon(momentFresh(m), m.id)} Momen {i + 1}
                </span>
                <span className="flex items-center gap-1">
                  <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white disabled:opacity-40" aria-label={`Naikkan momen ${i + 1}`}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" disabled={busy || i === moments.length - 1} onClick={() => move(i, 1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white disabled:opacity-40" aria-label={`Turunkan momen ${i + 1}`}>
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const { [m.id]: _drop, ...rest } = story.assets;
                      void _drop;
                      commit({ moments: moments.filter((x) => x.id !== m.id), assets: rest });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#B3261E] hover:bg-white disabled:opacity-40"
                    aria-label={`Hapus momen ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Field label="Judul" count={m.title.length} max={STORY_LIMITS.title}>
                  <input className={input} value={m.title} maxLength={STORY_LIMITS.title} disabled={busy} placeholder="mis. Pertama kenal" onChange={(e) => setMoment(m.id, { title: e.target.value })} />
                </Field>
                <Field label="Tempat" count={m.place.length} max={STORY_LIMITS.place}>
                  <input className={input} value={m.place} maxLength={STORY_LIMITS.place} disabled={busy} placeholder="mis. toko oleh-oleh di Jogja" onChange={(e) => setMoment(m.id, { place: e.target.value })} />
                </Field>
              </div>
              <Field label="Apa yang terjadi" count={m.action.length} max={STORY_LIMITS.action}>
                <textarea className={`${input} min-h-[64px]`} value={m.action} maxLength={STORY_LIMITS.action} disabled={busy} placeholder="mis. Ana menjaga toko sambil membaca pesan pertama dari Naufal di HP" onChange={(e) => setMoment(m.id, { action: e.target.value })} />
              </Field>
              <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={`Siapa yang tampil di momen ${i + 1}`}>
                <span className={lbl}>Tampil:</span>
                {(
                  [
                    ['both', 'Berdua'],
                    ['groom', groomName],
                    ['bride', brideName],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={m.who === id}
                    disabled={busy}
                    onClick={() => setMoment(m.id, { who: id })}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold border ${m.who === id ? 'bg-[var(--rh-primary)] text-white border-[var(--rh-primary)]' : 'bg-white/70 border-white text-[var(--rh-ink)]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Field label="Narasi di layar" count={m.narration?.length} max={STORY_LIMITS.narration}>
                <textarea className={`${input} min-h-[52px]`} value={m.narration || ''} maxLength={STORY_LIMITS.narration} disabled={busy} placeholder="mis. Kisah kami dimulai dari satu pesan di grup Telegram." onChange={(e) => setMoment(m.id, { narration: e.target.value })} />
              </Field>
              <details className="rounded-xl bg-white/50 px-3 py-2">
                <summary className="cursor-pointer text-[12px] font-semibold text-[var(--rh-ink)] min-h-[32px] flex items-center">Dialog, chat, dan angka (opsional)</summary>
                <div className="space-y-2.5 pt-2">
                  <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
                    <select
                      aria-label="Pembicara dialog"
                      className={`${input} w-auto`}
                      disabled={busy}
                      value={m.dialogue?.speaker || 'groom'}
                      onChange={(e) => setMoment(m.id, { dialogue: { speaker: e.target.value as 'groom' | 'bride', text: m.dialogue?.text || '' } })}
                    >
                      <option value="groom">{groomName}</option>
                      <option value="bride">{brideName}</option>
                    </select>
                    <Field label="Balon dialog" count={m.dialogue?.text.length} max={STORY_LIMITS.dialogue}>
                      <input
                        className={input}
                        value={m.dialogue?.text || ''}
                        maxLength={STORY_LIMITS.dialogue}
                        disabled={busy}
                        placeholder="mis. Saya jemput ya!"
                        onChange={(e) => setMoment(m.id, { dialogue: e.target.value ? { speaker: m.dialogue?.speaker || 'groom', text: e.target.value } : null })}
                      />
                    </Field>
                  </div>
                  {(m.chat || []).map((c, ci) => (
                    <div key={ci} className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                      <select
                        aria-label={`Pengirim chat ${ci + 1}`}
                        className={`${input} w-auto`}
                        disabled={busy}
                        value={c.from}
                        onChange={(e) => setMoment(m.id, { chat: (m.chat || []).map((x, xi) => (xi === ci ? { ...x, from: e.target.value as 'groom' | 'bride' } : x)) })}
                      >
                        <option value="groom">{groomName}</option>
                        <option value="bride">{brideName}</option>
                      </select>
                      <input
                        aria-label={`Isi chat ${ci + 1}`}
                        className={input}
                        value={c.text}
                        maxLength={STORY_LIMITS.chatText}
                        disabled={busy}
                        onChange={(e) => setMoment(m.id, { chat: (m.chat || []).map((x, xi) => (xi === ci ? { ...x, text: e.target.value } : x)) })}
                      />
                      <button type="button" disabled={busy} onClick={() => setMoment(m.id, { chat: (m.chat || []).filter((_, xi) => xi !== ci) })} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white" aria-label={`Hapus chat ${ci + 1}`}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {(m.chat?.length || 0) < STORY_LIMITS.chatLines && (
                    <button type="button" disabled={busy} onClick={() => setMoment(m.id, { chat: [...(m.chat || []), { from: 'groom', text: '' }] })} className="text-[12px] font-semibold text-[var(--rh-primary)] hover:underline">
                      + Tambah baris chat
                    </button>
                  )}
                  <Field label="Angka besar (mis. jarak)" count={m.stat?.length} max={STORY_LIMITS.stat}>
                    <input className={input} value={m.stat || ''} maxLength={STORY_LIMITS.stat} disabled={busy} placeholder="mis. 4721 KM" onChange={(e) => setMoment(m.id, { stat: e.target.value })} />
                  </Field>
                </div>
              </details>
              {story.assets[m.id]?.bg && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.assets[m.id].bg} alt={`Latar momen ${i + 1}`} className="h-20 w-12 rounded-lg object-cover border border-white" />
                  {story.assets[m.id].chars && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={story.assets[m.id].chars} alt={`Karakter momen ${i + 1}`} className="h-20 w-auto rounded-lg bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] [background-size:12px_12px] border border-white" />
                  )}
                  <button type="button" disabled={!canGenerate || busy} onClick={() => generate({ momentId: m.id })} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[12px] font-semibold text-[var(--rh-ink)] border border-black/10 hover:bg-white/80 disabled:opacity-50">
                    <RefreshCw className="h-3.5 w-3.5" /> Gambar ulang
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
        {moments.length < STORY_LIMITS.moments && (
          <button type="button" disabled={busy} onClick={() => commit({ moments: [...moments, newMoment(moments.length)] })} className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-[var(--rh-primary)]/50 bg-white/60 px-4 py-2.5 text-[12.5px] font-semibold text-[var(--rh-ink)] hover:bg-white disabled:opacity-50">
            <Plus className="h-4 w-4" /> Tambah momen
          </button>
        )}
        <Field label="Kalimat penutup (opsional)" count={story.closingNarration.length} max={STORY_LIMITS.closing}>
          <input className={input} value={story.closingNarration} maxLength={STORY_LIMITS.closing} disabled={busy} placeholder="mis. Kehadiranmu adalah kebahagiaan bagi kami." onChange={(e) => commit({ closingNarration: e.target.value })} />
        </Field>
      </section>

      {/* Gambar AI */}
      <section className="glx-strong rounded-[26px] p-5 space-y-3.5" aria-labelledby="st-ai">
        <div className="flex items-center justify-between gap-2">
          <h3 id="st-ai" className={h3}>
            <Sparkles className="h-4 w-4 text-[var(--rh-primary)]" /> Gambar AI
          </h3>
          <span className="text-[11.5px] text-[var(--rh-muted)] tabular">
            {doneCount}/{totalCount} siap
          </span>
        </div>
        <label className="flex items-start gap-2.5 text-[12px] text-[var(--rh-ink-2)]">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--rh-primary)]" checked={story.consent} disabled={busy} onChange={(e) => commit({ consent: e.target.checked })} />
          <span>
            Saya setuju foto wajah kedua mempelai dikirim ke layanan AI Google (Gemini) untuk membuat ilustrasi, dan kedua mempelai sudah mengizinkan. Hasil gambar disimpan di akun RuangHadir.
          </span>
        </label>
        <ul className="space-y-1.5 text-[12px] text-[var(--rh-ink)]">
          <li className="flex items-center gap-2">{statusIcon(sheetFresh, 'sheet')} Lembar karakter (wajah acuan)</li>
          {readyMoments.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              {statusIcon(momentFresh(m), m.id)} {m.title || m.place}
            </li>
          ))}
          <li className="flex items-center gap-2">{statusIcon(finaleFresh, 'finale')} Adegan pernikahan</li>
        </ul>
        {story.characterSheet && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.characterSheet} alt="Lembar karakter hasil AI" className="w-full rounded-2xl border border-white" />
        )}
        {!canGenerate && (
          <p className="text-[11.5px] text-[#8C6B34]">
            {!isEnt
              ? 'Gambar AI khusus akun Enterprise.'
              : !story.groom.photos.length || !story.bride.photos.length
                ? 'Unggah foto wajah kedua mempelai.'
                : readyMoments.length < STORY_LIMITS.minMoments
                  ? `Lengkapi tempat dan kejadian minimal ${STORY_LIMITS.minMoments} momen.`
                  : 'Centang persetujuan foto terlebih dahulu.'}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => generate()}
            disabled={!canGenerate || busy || doneCount === totalCount}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--rh-primary)] px-5 py-3 text-[13px] font-semibold text-white hover:bg-[var(--rh-primary-hover)] disabled:opacity-55"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {running ? 'Membuat gambar…' : doneCount === totalCount ? 'Semua gambar siap' : 'Buat gambar yang belum ada'}
          </button>
          {running ? (
            <button type="button" onClick={() => abortRef.current?.abort()} className="flex items-center justify-center gap-2 rounded-full bg-white border border-black/10 px-5 py-3 text-[13px] font-semibold text-[var(--rh-ink)]">
              <X className="h-4 w-4" /> Hentikan
            </button>
          ) : (
            <button type="button" onClick={() => generate({ all: true })} disabled={!canGenerate || busy} className="flex items-center justify-center gap-2 rounded-full bg-white border border-black/10 px-5 py-3 text-[13px] font-semibold text-[var(--rh-ink)] disabled:opacity-55">
              <RefreshCw className="h-4 w-4" /> Buat ulang semua
            </button>
          )}
        </div>
        <p className="text-[11px] text-[var(--rh-muted)]">Satu video memakai ±{totalCount * 2 - 1} gambar AI. Momen yang diubah tempat, kejadian, atau pemerannya ditandai perlu dibuat ulang.</p>
        {mock && <p className="text-[11.5px] text-[#8C6B34]">Server belum punya kunci AI, jadi yang muncul adalah gambar uji, bukan ilustrasi asli.</p>}
        {genError && (
          <p className="rounded-2xl bg-[#B3261E]/8 border border-[#B3261E]/20 p-3 text-[12px] font-medium text-[#8C1D18]" role="alert">
            {genError}
          </p>
        )}
      </section>
    </div>
  );
}
