import type { StoryMoment, StoryProject } from '@/types';

export const STORY_LIMITS = {
  moments: 8,
  minMoments: 3,
  photosPerPerson: 3,
  title: 40,
  place: 80,
  action: 160,
  narration: 140,
  dialogue: 50,
  chatLines: 3,
  chatText: 70,
  stat: 16,
  look: 80,
  closing: 120,
} as const;

export const STORY_STYLES: { id: NonNullable<StoryProject['style']>; label: string; desc: string }[] = [
  { id: 'warm-digital', label: 'Ilustrasi digital hangat', desc: 'Semi-realis, cahaya hangat, seperti ilustrasi buku cerita modern' },
  { id: 'watercolor', label: 'Cat air', desc: 'Lembut, tekstur kertas, warna pastel' },
  { id: 'soft-anime', label: 'Anime lembut', desc: 'Garis bersih, warna cerah, gaya film animasi' },
];

/** Durasi per bagian (detik) — dipakai mesin film dan perkiraan durasi di UI. */
export const STORY_TIMING = { intro: 3.2, moment: 4.6, finale: 6.5, closing: 3.8 } as const;

export function storyDuration(momentCount: number) {
  return STORY_TIMING.intro + momentCount * STORY_TIMING.moment + STORY_TIMING.finale + STORY_TIMING.closing;
}

export function newMoment(i: number): StoryMoment {
  return {
    id: `m${Date.now().toString(36)}${i}`,
    title: '',
    place: '',
    action: '',
    who: 'both',
    narration: '',
    dialogue: null,
    chat: [],
    stat: '',
  };
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

/** Normalisasi proyek cerita tersimpan menjadi bentuk lengkap & aman. */
export type ResolvedStory = Required<Omit<StoryProject, 'characterSheet' | 'characterSheetSig' | 'finale'>> & Pick<StoryProject, 'characterSheet' | 'characterSheetSig' | 'finale'>;

export function resolveStory(raw?: StoryProject | null): ResolvedStory {
  const cast = (c?: StoryProject['groom']) => ({
    photos: (Array.isArray(c?.photos) ? c!.photos : []).filter((u) => typeof u === 'string' && /^https?:\/\//.test(u)).slice(0, STORY_LIMITS.photosPerPerson),
    look: str(c?.look, STORY_LIMITS.look),
  });
  const moments = (Array.isArray(raw?.moments) ? raw!.moments : []).slice(0, STORY_LIMITS.moments).map((m, i) => ({
    id: typeof m?.id === 'string' && m.id ? m.id : `m${i}`,
    title: str(m?.title, STORY_LIMITS.title),
    place: str(m?.place, STORY_LIMITS.place),
    action: str(m?.action, STORY_LIMITS.action),
    who: m?.who === 'groom' || m?.who === 'bride' ? m.who : ('both' as const),
    narration: str(m?.narration, STORY_LIMITS.narration),
    dialogue:
      m?.dialogue && typeof m.dialogue.text === 'string' && m.dialogue.text.trim()
        ? { speaker: m.dialogue.speaker === 'bride' ? ('bride' as const) : ('groom' as const), text: str(m.dialogue.text, STORY_LIMITS.dialogue) }
        : null,
    chat: (Array.isArray(m?.chat) ? m!.chat : [])
      .filter((c) => c && typeof c.text === 'string' && c.text.trim())
      .slice(0, STORY_LIMITS.chatLines)
      .map((c) => ({ from: c.from === 'bride' ? ('bride' as const) : ('groom' as const), text: str(c.text, STORY_LIMITS.chatText) })),
    stat: str(m?.stat, STORY_LIMITS.stat),
  }));
  return {
    style: raw?.style === 'watercolor' || raw?.style === 'soft-anime' ? raw.style : 'warm-digital',
    groom: cast(raw?.groom),
    bride: cast(raw?.bride),
    moments,
    closingNarration: str(raw?.closingNarration, STORY_LIMITS.closing),
    consent: raw?.consent === true,
    characterSheet: typeof raw?.characterSheet === 'string' ? raw.characterSheet : undefined,
    characterSheetSig: typeof raw?.characterSheetSig === 'string' ? raw.characterSheetSig : undefined,
    assets: raw?.assets && typeof raw.assets === 'object' ? raw.assets : {},
    finale: raw?.finale,
  };
}

/** Sidik isi momen yang memengaruhi gambar (bukan teks narasi). */
export function momentSig(m: StoryMoment, style: string) {
  return [style, m.place, m.action, m.who].join('|');
}

/** Momen yang siap dibuatkan gambar. */
export function momentReady(m: StoryMoment) {
  return m.place.trim().length >= 3 && m.action.trim().length >= 5;
}

export function sheetSig(s: Pick<StoryProject, 'style' | 'groom' | 'bride'>) {
  return [s.style, ...(s.groom?.photos || []), s.groom?.look || '', ...(s.bride?.photos || []), s.bride?.look || ''].join('|');
}
