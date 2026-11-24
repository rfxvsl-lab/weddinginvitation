'use client';

/**
 * KitLayout — mesin undangan bersama untuk semua tema Theme Kit.
 * Menyediakan seluruh fitur (sampul, musik, hitung mundur, acara + peta + kalender,
 * kisah, galeri + lightbox, amplop digital, RSVP + ucapan, konfirmasi tamu ber-kode).
 * Tampilan tiap bagian ditentukan oleh ThemeSpec.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Guest, RSVP, ThemeConfig, WeddingData, EventDetails } from '../../types';
import type { ThemeSpec, SectionId } from '../types';
import { convertGoogleDriveUrl } from '../../utils/googleDrive';
import Cover from './Cover';
import { Ambient, Corner, Divider, Frame, Reveal, fontImport } from './primitives';
import { getKitTheme } from '../catalog';
import { Px, SceneProvider, requestTiltPermission } from './scene';
import { ArtLayer } from './chapters';
import { Bloom, Bouquet, BottomNav, KitOverlay, Lightbox, MusicDisc, PaintedStage, Slideshow, StageFront, defaultFlora, relTime, type Flora } from './standard';
import { STANDARD_ORDER, standardSections } from './standardSections';
import { IcCalendar, IcChat, IcGift, IcHeart, IcHome, IcImage } from './icons';
import { CameraStage } from './camera';

interface KitLayoutProps {
  data: WeddingData;
  theme: ThemeConfig;
  guest?: Guest;
  onAddRSVP: (rsvp: RSVP) => void;
  rsvps: RSVP[];
  embedded?: boolean;
  invitationId?: string;
  /** bagian tambahan dari InvitationPreview (tiket tamu) — dirender di dalam kolom, sebelum footer */
  extras?: React.ReactNode;
}

// Urutan standar (mengikuti alur template premium): pembuka → kutipan → mempelai → tayangan foto →
// save the date → acara → tanda kasih → galeri → kisah → RSVP → ucapan → terima kasih
const DEFAULT_ORDER: SectionId[] = ['hero', 'quote', 'couple', 'interlude', 'countdown', 'events', 'gift', 'gallery', 'story', 'rsvp', 'wishes', 'closing'];

const NAV_LABEL: Partial<Record<SectionId, string>> = {
  hero: 'Beranda',
  couple: 'Mempelai',
  countdown: 'Save the Date',
  events: 'Acara',
  gift: 'Tanda Kasih',
  gallery: 'Galeri',
  story: 'Kisah Kami',
  rsvp: 'RSVP',
  wishes: 'Ucapan',
};

function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('id-ID', opts);
}

function calendarUrl(ev: EventDetails, title: string) {
  if (!ev.date) return '';
  const day = ev.date.replace(/-/g, '');
  const t = (s: string) => (s || '00:00').replace(':', '').padEnd(4, '0') + '00';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${day}T${t(ev.timeStart)}/${day}T${t(ev.timeEnd || ev.timeStart)}`,
    location: [ev.venueName, ev.address].filter(Boolean).join(', '),
    ctz: 'Asia/Jakarta',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Gaya bersama: keadaan tombol (hover/aktif/fokus). Tata letak desktop (foto di kiri,
 * undangan di kanan) diatur DesktopInvitationWrapper di luar iframe.
 */
const KIT_CSS = `
.kit-press{transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .3s cubic-bezier(.22,1,.36,1),background-color .3s cubic-bezier(.22,1,.36,1),color .3s cubic-bezier(.22,1,.36,1)}
.kit-press:hover{opacity:.9;transform:translateY(-1px)}
.kit-press:active{transform:scale(.98)}
.kit-press:focus-visible,.kit-field:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.kit-field:focus{border-color:currentColor}
@media (prefers-reduced-motion:reduce){.kit-press,.kit-press:hover{transition:none;transform:none}}
`;

export default function KitLayout({ data, theme, guest, onAddRSVP, rsvps, embedded = false, extras }: KitLayoutProps) {
  const baseSpec = getKitTheme(theme.id) as ThemeSpec;
  // varian warna pilihan pemilik undangan (dashboard)
  const variant = baseSpec.variants?.find((v) => v.id === data.themeVariant);
  const spec: ThemeSpec = variant ? { ...baseSpec, palette: { ...baseSpec.palette, ...variant.palette } } : baseSpec;
  const p = spec.palette;
  const fallbackFlora = defaultFlora(p, variant?.floraArt || baseSpec.floraArt);
  const flora: Flora = { ...fallbackFlora, ...(baseSpec.flora || {}), art: fallbackFlora.art };
  const introMs = spec.scene?.introMs || 3400;
  const c = spec.copy || {};
  const [opened, setOpened] = useState(embedded);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lightbox, setLightboxState] = useState<{ photos: string[]; i: number } | null>(null);
  const setLightbox = (src: string | null) => setLightboxState(src ? { photos: [src], i: 0 } : null);
  const [copied, setCopied] = useState<string | null>(null);

  const img = (u?: string) => convertGoogleDriveUrl(u || '');
  const groom = data.couple.groom;
  const bride = data.couple.bride;
  const heroPhoto = img(data.bgImageUrl || data.gallery?.[0] || groom.photoUrl);
  const mainDate = data.events.akad?.date || data.events.resepsi?.date || data.countdownDate?.slice(0, 10);
  const dateText = fmtDate(mainDate);
  const guestName = guest?.name || 'Tamu Undangan';

  // ---------- musik ----------
  useEffect(() => {
    if (!data.musicUrl || embedded) return;
    const a = new Audio(data.musicUrl);
    a.loop = true;
    audioRef.current = a;
    return () => a.pause();
  }, [data.musicUrl, embedded]);
  // nama mempelai muncul setelah kamera pembuka selesai turun
  const [introDone, setIntroDone] = useState(embedded);
  useEffect(() => {
    if (!opened || introDone) return;
    const t = setTimeout(() => setIntroDone(true), introMs * 0.72);
    return () => clearTimeout(t);
  }, [opened, introDone, introMs]);
  const handleOpen = () => {
    requestTiltPermission();
    setOpened(true);
    audioRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  // ---------- hitung mundur ----------
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    const tick = () => {
      const diff = +new Date(data.countdownDate) - Date.now();
      if (!(diff > 0)) {
        setPassed(true);
        return setLeft({ d: 0, h: 0, m: 0, s: 0 });
      }
      setLeft({ d: Math.floor(diff / 864e5), h: Math.floor((diff / 36e5) % 24), m: Math.floor((diff / 6e4) % 60), s: Math.floor((diff / 1e3) % 60) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.countdownDate]);

  // ---------- RSVP ----------
  const [rName, setRName] = useState(guest?.name || '');
  const [rStatus, setRStatus] = useState<RSVP['status']>('Hadir');
  const [rPax, setRPax] = useState(1);
  const [rWish, setRWish] = useState('');
  const [rSent, setRSent] = useState(false);
  const [rError, setRError] = useState<string | null>(null);
  const submitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName.trim()) return setRError('Nama belum diisi. Tulis nama Anda agar mempelai mengenali ucapan ini.');
    if (!rWish.trim()) return setRError('Ucapan belum diisi. Tulis doa atau ucapan singkat untuk kedua mempelai.');
    setRError(null);
    onAddRSVP({
      id: `rsvp-${Date.now()}`,
      guestId: guest?.id,
      guestName: rName.trim(),
      status: rStatus,
      paxCount: rStatus === 'Hadir' ? rPax : 0,
      wishes: rWish.trim(),
      timestamp: new Date().toISOString(),
    });
    setRSent(true);
    setRWish('');
    setTimeout(() => setRSent(false), 5000);
  };

  const copy = (id: string, value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const events = useMemo(
    () =>
      (
        [
          ['akad', data.events.akad],
          ['resepsi', data.events.resepsi],
        ] as [string, EventDetails][]
      ).filter(([, ev]) => ev && ev.enabled !== false && (ev.date || ev.venueName)),
    [data.events]
  );

  const order = (spec.sections || (spec.scene ? DEFAULT_ORDER : STANDARD_ORDER)).filter((id) => !(spec.scene && (id === 'interlude' || id === 'wishes')));
  const R = spec.reveal;
  const display = spec.fonts.display;
  const script = spec.fonts.script || display;
  const label = spec.fonts.label || spec.fonts.body;

  // ---------- gaya dasar ----------
  const scene = spec.scene;
  // Tema Spesial: tiap bagian adalah bab adegan; teks langsung di atas ilustrasi memakai --ink
  const sectionStyle: React.CSSProperties = scene
    ? { position: 'relative', zIndex: 2, padding: '0 18px', textAlign: 'center' }
    : { position: 'relative', zIndex: 2, padding: '72px 24px', textAlign: 'center' };
  const ink = scene ? 'var(--ink)' : p.primary;
  const darkBg = (() => {
    const h = p.bg.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
  })();
  const inkSoft = scene ? 'var(--ink)' : p.muted;
  const titleStyle: React.CSSProperties = { fontFamily: script, fontSize: spec.fonts.script ? 46 : 34, fontWeight: 400, lineHeight: 1.1, color: ink, margin: 0 };
  const eyebrow: React.CSSProperties = { fontFamily: label, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: p.muted };
  const card: React.CSSProperties = {
    position: 'relative',
    background: scene?.panel?.background || p.surface,
    border: scene?.panel?.border || `1px solid ${p.secondary}55`,
    borderRadius: spec.radius,
    padding: '28px 22px',
    boxShadow: scene ? '0 30px 60px -36px rgba(0,0,0,.6)' : '0 18px 40px -30px rgba(0,0,0,.45)',
    textAlign: 'center',
    ...(scene
      ? { backdropFilter: `blur(${scene.panel?.blur ?? 12}px) saturate(1.15)`, WebkitBackdropFilter: `blur(${scene.panel?.blur ?? 12}px) saturate(1.15)`, textShadow: 'none', color: p.text }
      : {}),
  };
  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: label,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: p.onPrimary,
    background: p.primary,
    border: 'none',
    borderRadius: Math.min(spec.radius, 999),
    padding: '11px 18px',
    textDecoration: 'none',
    cursor: 'pointer',
  };
  // panel lengkung standar (mempelai, acara) untuk tema reguler
  const archPanel: React.CSSProperties = { ...card, borderRadius: '200px 200px 22px 22px', padding: '52px 22px 30px', border: `1.5px solid ${p.secondary}88`, boxShadow: '0 26px 50px -34px rgba(0,0,0,.5)' };
  const btnGhost: React.CSSProperties = { ...btn, color: p.primary, background: 'transparent', border: `1px solid ${p.primary}` };
  const corners = (color: string) =>
    spec.cornerSvg ? (['tl', 'tr', 'bl', 'br'] as const).map((pos) => <Corner key={pos} svg={spec.cornerSvg!} color={color} pos={pos} />) : null;

  /** Paralaks elemen konten — aktif hanya di tema Spesial (adegan). */
  const M = (node: React.ReactNode, props: React.ComponentProps<typeof Px>, key?: React.Key) =>
    scene ? (
      <Px key={key} {...props}>
        {node}
      </Px>
    ) : (
      <React.Fragment key={key}>{node}</React.Fragment>
    );
  const imgPx = scene ? (im: React.ReactNode) => <Px style={{ height: '100%' }} y={[-18, 18]} scale={[1.16, 1.16]}>{im}</Px> : undefined;
  // foto di dalam bingkai bergeser pelan saat digulir (semua tema)
  const stdImgPx = (im: React.ReactNode) => <Px style={{ height: '100%' }} y={[-12, 12]} scale={[1.1, 1.1]}>{im}</Px>;

  // Fungsi (bukan komponen) agar Reveal tidak di-remount setiap detik saat hitung mundur berjalan
  const Title = ({ text, sub }: { text: string; sub?: string }) =>
    M(
      <Reveal variant={R} style={{ marginBottom: 28 }}>
        {sub && <p style={eyebrow}>{sub}</p>}
        <h2 style={{ ...titleStyle, marginTop: sub ? 8 : 0 }}>{text}</h2>
        <Divider spec={spec} />
      </Reveal>,
      { y: [46, -46], range: [0, 1] }
    );

  // daftar ucapan tamu (avatar inisial, status, waktu relatif)
  const wishList = () => {
    const list = (rsvps || []).filter((r) => r.wishes).slice(0, 60);
    return (
      <div style={{ maxWidth: 420, margin: '20px auto 0', textAlign: 'left' }}>
        {!list.length && (
          <p style={{ ...card, fontFamily: spec.fonts.body, fontSize: 13.5, color: p.muted, textAlign: 'center' }}>Belum ada ucapan. Jadilah yang pertama mendoakan kedua mempelai.</p>
        )}
        {list.length > 0 && (
          <div style={{ ...card, padding: 10, textAlign: 'left', maxHeight: 460, overflowY: 'auto', display: 'grid', gap: 8 }}>
            {list.map((r) => (
              <div key={r.id} style={{ display: 'flex', gap: 12, padding: '10px 8px', borderBottom: `1px solid ${p.secondary}33` }}>
                <span aria-hidden style={{ flex: '0 0 34px', height: 34, borderRadius: 999, background: p.primary, color: p.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: label, fontWeight: 700, fontSize: 14 }}>
                  {(r.guestName || '?').trim().charAt(0).toUpperCase()}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 13.5, fontWeight: 700, color: p.text, margin: 0 }}>
                    {r.guestName} <span style={{ fontWeight: 500, fontSize: 11, color: p.primary }}>· {r.status}</span>
                  </p>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 13, lineHeight: 1.6, color: p.muted, margin: '3px 0 0', overflowWrap: 'anywhere' }}>{r.wishes}</p>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 11, color: p.muted, opacity: 0.75, margin: '4px 0 0' }}>{relTime(r.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {!scene && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button type="button" style={btnGhost} onClick={(e) => e.currentTarget.ownerDocument.querySelector('[data-section="rsvp"]')?.scrollIntoView({ behavior: 'smooth' })}>
              Tulis ucapan
            </button>
          </div>
        )}
      </div>
    );
  };

  const sceneSections: Record<SectionId, () => React.ReactNode> = {
    hero: () => {
      if (spec.hero === 'scene') {
        const name: React.CSSProperties = { fontFamily: script, fontSize: 'clamp(56px, 17vw, 88px)', fontWeight: 400, lineHeight: 1, margin: 0 };
        // Nama berada di dalam adegan (lapisan depan menutupi sebagian); saat bab keluar, teks berpisah
        return (
          <section key="hero" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4vh 24px 0', textAlign: 'center', opacity: opened ? 1 : 0, transition: 'opacity 900ms ease 700ms' }}>
            <Px source="chapter" y={[0, -220]} opacity={[1, 0]} range={[0.5, 0.8]}>
              <p style={{ ...eyebrow, color: 'var(--ink)', opacity: 0.85 }}>{c.heroTitle || 'The Wedding of'}</p>
            </Px>
            <Px source="chapter" x={[0, -150]} y={[0, -140]} rotate={[0, -10]} range={[0.5, 0.86]} style={{ marginTop: 16 }}>
              <h1 style={name}>{groom.nickname}</h1>
            </Px>
            <Px source="chapter" scale={[1, 2.6]} opacity={[0.85, 0]} range={[0.5, 0.76]}>
              <p style={{ fontFamily: display, fontStyle: 'italic', fontSize: 26, margin: '2px 0' }}>&amp;</p>
            </Px>
            <Px source="chapter" x={[0, 150]} y={[0, -80]} rotate={[0, 10]} range={[0.5, 0.86]}>
              <h1 style={{ ...name, marginBottom: 18 }}>{bride.nickname}</h1>
            </Px>
            <Px source="chapter" y={[0, 160]} opacity={[1, 0]} range={[0.5, 0.76]}>
              <p style={{ fontFamily: label, fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{dateText}</p>
            </Px>
          </section>
        );
      }
      // Standar: nama berada di langit panggung pembuka, masuk dari arah berbeda setelah kamera turun
      const onPhoto = spec.hero === 'photo';
      const col = onPhoto ? p.onCover || '#fff' : spec.heroInk || p.text;
      const glow = onPhoto || spec.heroInk ? '0 2px 18px rgba(0,0,0,.55)' : `0 1px 0 ${p.bg}, 0 0 24px ${p.bg}`;
      const big = spec.hero === 'type';
      const nameSt: React.CSSProperties = big
        ? { fontFamily: display, fontSize: 'clamp(60px, 19vw, 104px)', fontWeight: 400, lineHeight: 0.92, margin: 0, color: onPhoto || spec.heroInk ? col : p.primary, letterSpacing: '-0.02em' }
        : { fontFamily: script, fontSize: 'clamp(52px, 15vw, 78px)', fontWeight: 400, lineHeight: 1.02, margin: 0, color: onPhoto || spec.heroInk ? col : p.primary };
      return (
        <section key="hero" style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: onPhoto ? 'flex-end' : 'flex-start', padding: onPhoto ? '0 24px 18vh' : '13vh 24px 0', textAlign: 'center', color: col, textShadow: glow }}>
          <Reveal variant={R} when={introDone} from="down">
            <p style={{ ...eyebrow, color: col, opacity: 0.85 }}>{c.heroTitle || 'The Wedding of'}</p>
          </Reveal>
          <Reveal variant={R} when={introDone} from="left" delay={0.15} style={{ marginTop: 12 }}>
            <h1 style={nameSt}>{groom.nickname}</h1>
          </Reveal>
          <Reveal variant="zoom" when={introDone} delay={0.35}>
            <p style={{ fontFamily: display, fontStyle: 'italic', fontSize: 28, margin: '2px 0', color: onPhoto || spec.heroInk ? col : p.primary, opacity: 0.8 }}>&amp;</p>
          </Reveal>
          <Reveal variant={R} when={introDone} from="right" delay={0.45}>
            <h1 style={{ ...nameSt, marginBottom: 16 }}>{bride.nickname}</h1>
          </Reveal>
          <Reveal variant={R} when={introDone} from="up" delay={0.65}>
            <p style={{ fontFamily: label, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: col }}>{dateText}</p>
          </Reveal>
        </section>
      );
    },

    quote: () =>
      data.quoteText ? (
        <section key="quote" style={sectionStyle}>
          <Reveal variant={R} style={{ ...card, maxWidth: 420, margin: '0 auto', padding: scene ? '36px 26px' : '22px 22px 34px' }}>
            {!scene && (
              <>
                <Bloom flora={flora} side="left" top={-40} size={130} seed={2} />
                <Bloom flora={flora} side="right" bottom={-30} size={120} seed={4} />
                <Reveal variant={R} from="down" style={{ height: 260, borderRadius: Math.max(spec.radius, 14), overflow: 'hidden', marginBottom: 22 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Px style={{ height: '100%' }} y={[-20, 20]} scale={[1.14, 1.14]}><img src={img(data.gallery?.[1] || heroPhoto)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></Px>
                </Reveal>
                <p style={{ fontFamily: script, fontSize: 38, color: p.primary, margin: '0 0 14px', lineHeight: 1.1 }}>
                  {groom.nickname} &amp; {bride.nickname}
                </p>
              </>
            )}
            {corners(p.secondary)}
            <p style={{ fontFamily: display, fontStyle: 'italic', fontSize: 17, lineHeight: 1.75, color: p.text, margin: 0 }}>“{data.quoteText}”</p>
            {data.quoteSource && <p style={{ ...eyebrow, marginTop: 16, color: p.primary }}>{data.quoteSource}</p>}
          </Reveal>
        </section>
      ) : null,

    couple: () => {
      const people = [
        { m: groom, rel: c.groomLabel || 'Putra dari' },
        { m: bride, rel: c.brideLabel || 'Putri dari' },
      ];
      return (
        <section key="couple" style={sectionStyle}>
          {Title({ text: c.coupleTitle || 'Mempelai' })}
          <Reveal variant={R}>
            <p style={{ fontFamily: spec.fonts.body, fontSize: 14, lineHeight: 1.8, color: inkSoft, maxWidth: 380, margin: '-6px auto 30px' }}>
              {c.coupleIntro || 'Dengan penuh sukacita dan memohon restu, kami mengundang Anda di hari pernikahan kami.'}
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: spec.couple === 'split' && scene ? '1fr 1fr' : '1fr', gap: spec.couple === 'split' && scene ? 14 : 26, maxWidth: 440, margin: '0 auto' }}>
            {people.map(({ m, rel }, i) => (
              <React.Fragment key={m.fullName + i}>
                {M(
                <Reveal variant={R} delay={i * 0.12} style={!scene ? archPanel : spec.couple === 'split' ? { ...card, padding: '16px 8px' } : card}>
                  {(spec.couple === 'cards' || !scene) && corners(p.secondary)}
                  <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                  {!scene && (
                    <>
                      <Bloom flora={flora} side="left" bottom={-34} size={120} seed={7 + i * 4} offset={-58} />
                      <Bloom flora={flora} side="right" top={-26} size={104} seed={9 + i * 4} offset={-50} />
                    </>
                  )}
                  <Frame
                    src={img(m.photoUrl)}
                    alt={m.fullName}
                    shape={spec.frame}
                    palette={p}
                    width={spec.couple === 'split' && scene ? 132 : 176}
                    height={spec.couple === 'split' && scene ? (spec.frame === 'circle' ? 126 : 170) : spec.frame === 'circle' ? 168 : 226}
                    position="center 25%"
                    wrapImg={imgPx || stdImgPx}
                  />
                  </div>
                  {!scene && <p style={{ fontFamily: script, fontSize: 40, color: p.primary, margin: '20px 0 0', lineHeight: 1.05 }}>{m.nickname}</p>}
                  <h3 style={{ fontFamily: display, fontSize: spec.couple === 'split' ? 19 : 24, fontWeight: 500, color: p.text, margin: '18px 0 6px', lineHeight: 1.25 }}>{m.fullName}</h3>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 12.5, lineHeight: 1.6, color: p.muted, margin: 0 }}>
                    {rel}
                    <br />
                    {[m.fatherName, m.motherName].filter(Boolean).join(' & ')}
                  </p>
                  {m.instagram && (
                    <a href={`https://instagram.com/${m.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={scene ? { ...eyebrow, display: 'inline-block', marginTop: 10, color: p.primary, textDecoration: 'none' } : { ...btn, marginTop: 14, padding: '8px 16px', fontSize: 11 }}>
                      @{m.instagram.replace('@', '')}
                    </a>
                  )}
                </Reveal>,
                { x: [i === 0 ? -70 : 70, 0], rotate: [i === 0 ? -7 : 7, 0], opacity: [0.2, 1], range: [0.05, 0.42], ease: 'out' }
                )}
                {(spec.couple === 'cards' || !scene) && i === 0 && (
                  <Reveal variant={R} style={{ fontFamily: script, fontSize: 48, color: p.secondary, lineHeight: 1 }}>
                    &amp;
                  </Reveal>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      );
    },

    countdown: () =>
      data.countdownDate ? (
        <section key="countdown" style={{ ...sectionStyle, paddingTop: scene ? 40 : 96, paddingBottom: 40 }}>
          {!scene && <Bouquet flora={flora} seed={21} size={150} />}
          {!scene && <h2 style={{ ...titleStyle, marginBottom: 10 }}>Save the Date</h2>}
          <Reveal variant={R}>
            <p style={{ ...eyebrow, color: inkSoft }}>{c.countdownTitle || 'Menuju hari bahagia'}</p>
          </Reveal>
          {passed ? (
            <Reveal variant={R} delay={0.1} style={{ fontFamily: display, fontStyle: 'italic', fontSize: 22, color: ink, marginTop: 12 }}>
              Alhamdulillah, hari bahagia telah tiba
            </Reveal>
          ) : spec.countdown === 'boxes' ? (
            <Reveal variant={R} delay={0.1} style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18 }}>
              {(
                [
                  [left.d, 'Hari'],
                  [left.h, 'Jam'],
                  [left.m, 'Menit'],
                  [left.s, 'Detik'],
                ] as [number, string][]
              ).map(([v, l]) => (
                <div key={l} style={{ width: 70, padding: '14px 0', background: p.surface, border: `1px solid ${p.secondary}66`, borderRadius: Math.min(spec.radius, 16) }}>
                  <div style={{ fontFamily: display, fontSize: 28, color: p.primary, fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2, '0')}</div>
                  <div style={{ ...eyebrow, fontSize: 9.5, letterSpacing: '0.14em', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </Reveal>
          ) : (
            <Reveal variant={R} delay={0.1} style={{ fontFamily: display, fontSize: 30, color: ink, marginTop: 14, fontVariantNumeric: 'tabular-nums' }}>
              {left.d} <small style={{ fontSize: 13, color: p.muted }}>hari</small> · {String(left.h).padStart(2, '0')}:{String(left.m).padStart(2, '0')}:{String(left.s).padStart(2, '0')}
            </Reveal>
          )}
        </section>
      ) : null,

    events: () =>
      events.length ? (
        <section key="events" style={sectionStyle}>
          {Title({ text: c.eventsTitle || 'Rangkaian Acara' })}
          <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto', display: 'grid', gap: 18 }}>
            {spec.events === 'timeline' && scene && <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 1, background: p.secondary }} />}
            {events.map(([key, ev], i) => M((() => {
              const body = (
                <>
                  <h3 style={scene ? { fontFamily: display, fontSize: 24, fontWeight: 500, color: p.primary, margin: '0 0 10px' } : { fontFamily: script, fontSize: 38, fontWeight: 400, color: p.primary, margin: '0 0 10px', lineHeight: 1.1 }}>{ev.name || (key === 'akad' ? 'Akad Nikah' : 'Resepsi')}</h3>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 14, color: p.text, margin: '4px 0' }}>{fmtDate(ev.date)}</p>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 14, color: p.text, margin: '4px 0' }}>
                    {ev.timeStart}
                    {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                  </p>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 14, fontWeight: 700, color: p.text, margin: '14px 0 2px' }}>{ev.venueName}</p>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 12.5, lineHeight: 1.6, color: p.muted, margin: 0 }}>{ev.address}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: spec.events === 'timeline' ? 'flex-start' : 'center', marginTop: 18 }}>
                    {ev.googleMapsUrl && (
                      <a href={ev.googleMapsUrl} target="_blank" rel="noreferrer" style={btn}>
                        Lihat lokasi
                      </a>
                    )}
                    {ev.date && (
                      <a href={calendarUrl(ev, `${ev.name} ${groom.nickname} & ${bride.nickname}`)} target="_blank" rel="noreferrer" style={btnGhost}>
                        Simpan ke kalender
                      </a>
                    )}
                  </div>
                </>
              );
              if (!scene) {
                // standar: tiap acara di panel lengkung dengan buket di puncaknya
                return (
                  <Reveal key={key} variant={R} from={i % 2 ? 'right' : 'left'} style={{ ...archPanel, marginTop: 70 }}>
                    <Bouquet flora={flora} seed={31 + i * 5} size={124} />
                    <Bloom flora={flora} side={i % 2 ? 'left' : 'right'} bottom={-24} size={96} seed={41 + i} offset={-40} />
                    {corners(p.secondary)}
                    {body}
                  </Reveal>
                );
              }
              if (spec.events === 'timeline') {
                return (
                  <Reveal key={key} variant={R} delay={i * 0.1} style={{ position: 'relative', paddingLeft: 34, textAlign: 'left' }}>
                    <span style={{ position: 'absolute', left: 3, top: 8, width: 13, height: 13, borderRadius: 999, background: p.primary, border: `3px solid ${p.bg}`, boxShadow: `0 0 0 1px ${p.secondary}` }} />
                    <div style={{ ...card, textAlign: 'left' }}>{body}</div>
                  </Reveal>
                );
              }
              if (spec.events === 'ticket') {
                return (
                  <Reveal key={key} variant={R} delay={i * 0.1} style={{ ...card, padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '84px 1fr', textAlign: 'left' }}>
                    <div style={{ background: p.primary, color: p.onPrimary, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 0', borderRight: `2px dashed ${p.surface}` }}>
                      <span style={{ fontFamily: display, fontSize: 34, lineHeight: 1 }}>{fmtDate(ev.date, { day: '2-digit' })}</span>
                      <span style={{ fontFamily: label, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 4 }}>{fmtDate(ev.date, { month: 'short' })}</span>
                    </div>
                    <div style={{ padding: '22px 18px' }}>{body}</div>
                  </Reveal>
                );
              }
              return (
                <Reveal key={key} variant={R} delay={i * 0.1} style={card}>
                  {corners(p.secondary)}
                  {body}
                </Reveal>
              );
            })(), { x: [i % 2 ? 90 : -90, 0], rotate: [i % 2 ? 5 : -5, 0], opacity: [0, 1], range: [0.04, 0.4], ease: 'out' }, key))}
          </div>
          {data.liveStreamUrl && (
            <Reveal variant={R} style={{ marginTop: 22 }}>
              <a href={data.liveStreamUrl} target="_blank" rel="noreferrer" style={btnGhost}>
                ● {data.liveStreamLabel || 'Tonton siaran langsung'}
              </a>
            </Reveal>
          )}
        </section>
      ) : null,

    story: () =>
      data.showLoveStories !== false && data.loveStories?.length ? (
        <section key="story" style={{ ...sectionStyle, paddingTop: scene ? undefined : 110 }}>
          {!scene && <Bouquet flora={flora} seed={51} size={140} />}
          {Title({ text: c.storyTitle || 'Kisah Kami' })}
          <div style={scene ? { maxWidth: 420, margin: '0 auto', borderLeft: `1px solid ${p.secondary}`, ...card, textAlign: 'left', paddingLeft: 40 } : { maxWidth: 420, margin: '0 auto', display: 'grid', gap: 16, textAlign: 'left' }}>
            {data.loveStories.map((s, i) => M(
              <Reveal variant={R} delay={i * 0.08} from={scene ? undefined : i % 2 ? 'right' : 'left'} style={scene ? { position: 'relative', marginBottom: 28 } : { ...card, textAlign: 'left', padding: '22px 22px' }}>
                {scene && <span style={{ position: 'absolute', left: -24, top: 4, width: 11, height: 11, borderRadius: 999, background: p.primary }} />}
                <p style={{ ...eyebrow, color: p.primary }}>{s.year}</p>
                <h3 style={{ fontFamily: display, fontSize: 20, fontWeight: 500, color: p.text, margin: '4px 0 6px' }}>{s.title}</h3>
                <p style={{ fontFamily: spec.fonts.body, fontSize: 13.5, lineHeight: 1.7, color: p.muted, margin: 0 }}>{s.story}</p>
              </Reveal>,
              { x: [60, 0], opacity: [0, 1], range: [0.02, 0.36], ease: 'out' },
              s.id || i
            ))}
          </div>
        </section>
      ) : null,

    gallery: () => {
      const photos = (data.gallery || []).filter(Boolean).map(img);
      if (!photos.length) return null;
      return (
        <section key="gallery" style={{ ...sectionStyle, paddingLeft: spec.gallery === 'film' ? 0 : 16, paddingRight: spec.gallery === 'film' ? 0 : 16 }}>
          {Title({ text: c.galleryTitle || 'Galeri' })}
          {spec.gallery === 'film' ? (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '10px 24px', background: darkBg ? '#0B0A09' : p.text }}>
              {photos.map((src, i) => (
                <button key={i} type="button" onClick={() => setLightbox(src)} style={{ flex: '0 0 62%', aspectRatio: '3/4', scrollSnapAlign: 'center', border: `4px solid ${darkBg ? p.text : p.surface}`, padding: 0, background: 'none', cursor: 'zoom-in', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {M(<img src={src} alt={`Galeri ${i + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />, { style: { height: '100%' }, y: [-24, 24], scale: [1.18, 1.18] })}
                </button>
              ))}
            </div>
          ) : (
            <div style={spec.gallery === 'masonry' ? { columnCount: 2, columnGap: 10, maxWidth: 480, margin: '0 auto' } : { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, maxWidth: 480, margin: '0 auto' }}>
              {photos.map((src, i) => M(
                <Reveal variant={R} delay={(i % 4) * 0.06}>
                  <button type="button" onClick={() => setLightbox(src)} style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', borderRadius: Math.min(spec.radius, 14), overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Galeri ${i + 1}`}
                      loading="lazy"
                      style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: spec.gallery === 'grid' ? '1/1' : i % 3 === 0 ? '3/4' : '4/5' }}
                    />
                  </button>
                </Reveal>,
                // kolom bergerak dengan kecepatan berbeda
                {
                  style: spec.gallery === 'masonry' ? { breakInside: 'avoid', marginBottom: 10 } : {},
                  y: spec.gallery === 'grid' ? ([[40, -40], [90, -90], [20, -20]][i % 3] as [number, number]) : ([[30, -30], [80, -80]][i % 2] as [number, number]),
                },
                i
              ))}
            </div>
          )}
        </section>
      );
    },

    gift: () =>
      data.gifts?.length ? (
        <section key="gift" style={sectionStyle}>
          {Title({ text: c.giftTitle || 'Amplop Digital' })}
          <Reveal variant={R}>
            <p style={{ fontFamily: spec.fonts.body, fontSize: 14, lineHeight: 1.8, color: inkSoft, maxWidth: 380, margin: '-6px auto 26px' }}>
              {c.giftIntro || 'Doa restu Anda adalah karunia terindah. Bila ingin memberi tanda kasih, dapat melalui:'}
            </p>
          </Reveal>
          <div style={{ display: 'grid', gap: 14, maxWidth: 400, margin: '0 auto' }}>
            {data.gifts.map((g, i) => M(
              <Reveal variant={R} delay={i * 0.08} style={card}>
                {!scene && i === 0 && <Bloom flora={flora} side="right" top={-44} size={110} seed={61} offset={-40} />}
                <p style={scene ? { ...eyebrow, color: p.primary } : { display: 'inline-block', fontFamily: label, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: p.onPrimary, background: p.primary, borderRadius: 6, padding: '5px 10px', margin: 0 }}>{g.name}</p>
                <p style={{ fontFamily: display, fontSize: g.type === 'address' ? 15 : 24, color: p.text, margin: '10px 0 4px', letterSpacing: g.type === 'address' ? 0 : '0.04em', lineHeight: 1.4 }}>{g.accountNumber}</p>
                {g.accountHolder && <p style={{ fontFamily: spec.fonts.body, fontSize: 13, color: p.muted, margin: 0 }}>a.n. {g.accountHolder}</p>}
                <button type="button" onClick={() => copy(g.id || String(i), g.accountNumber)} style={{ ...btnGhost, marginTop: 16 }}>
                  {copied === (g.id || String(i)) ? 'Tersalin ✓' : g.type === 'address' ? 'Salin alamat' : 'Salin nomor'}
                </button>
              </Reveal>,
              { rotateX: [55, 0], y: [50, 0], opacity: [0, 1], range: [0.02, 0.34], ease: 'out', transformOrigin: '50% 100%' },
              g.id || i
            ))}
          </div>
        </section>
      ) : null,

    rsvp: () => {
      const input: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: spec.fonts.body,
        fontSize: 14,
        color: p.text,
        background: p.bg,
        border: `1px solid ${p.secondary}88`,
        borderRadius: Math.min(spec.radius, 12),
        padding: '12px 14px',
        outline: 'none',
      };
      return (
        <section key="rsvp" style={sectionStyle}>
          {Title({ text: c.rsvpTitle || 'Konfirmasi & Ucapan' })}
          <Reveal variant={R} style={{ ...card, maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
            <form onSubmit={submitRSVP} style={{ display: 'grid', gap: 12 }}>
              <label style={eyebrow}>
                Nama
                <input value={rName} onChange={(e) => setRName(e.target.value)} required maxLength={80} style={{ ...input, marginTop: 6, textTransform: 'none', letterSpacing: 0 }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {(['Hadir', 'Tidak Hadir', 'Ragu-ragu'] as RSVP['status'][]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRStatus(s)}
                    style={{ ...input, cursor: 'pointer', padding: '10px 4px', fontSize: 12.5, textAlign: 'center', background: rStatus === s ? p.primary : p.bg, color: rStatus === s ? p.onPrimary : p.text, borderColor: rStatus === s ? p.primary : `${p.secondary}88` }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {rStatus === 'Hadir' && (
                <label style={eyebrow}>
                  Jumlah tamu
                  <select value={rPax} onChange={(e) => setRPax(Number(e.target.value))} style={{ ...input, marginTop: 6, textTransform: 'none', letterSpacing: 0 }}>
                    {Array.from({ length: Math.max(1, guest?.paxLimit || 4) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} orang
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label style={eyebrow}>
                Ucapan & doa
                <textarea value={rWish} onChange={(e) => setRWish(e.target.value)} required maxLength={1000} rows={3} style={{ ...input, marginTop: 6, resize: 'vertical', textTransform: 'none', letterSpacing: 0 }} />
              </label>
              <button type="submit" style={{ ...btn, padding: '13px 18px' }}>
                {rSent ? 'Terkirim — terima kasih!' : 'Kirim konfirmasi'}
              </button>
            </form>
          </Reveal>
          {scene && wishList()}
        </section>
      );
    },

    interlude: () => {
      const photos = [...(data.gallery || []).slice(2, 7), heroPhoto].filter(Boolean).map(img);
      return photos.length ? (
        <section key="interlude" style={{ position: 'relative', zIndex: 2, margin: '20px 0' }}>
          <Slideshow photos={photos} />
        </section>
      ) : null;
    },

    wishes: () => (
      <section key="wishes" style={sectionStyle}>
        {Title({ text: c.wishesTitle || 'Ucapan & Doa' })}
        {wishList()}
      </section>
    ),

    closing: () => {
      const fam = (m: typeof groom, who: string) => (
        <Reveal variant={R} from="up" style={{ border: '1px solid rgba(255,255,255,.38)', background: 'rgba(255,255,255,.06)', borderRadius: 14, padding: '16px 14px', marginTop: 12 }}>
          <p style={{ fontFamily: display, fontSize: 19, margin: 0, lineHeight: 1.3 }}>{[m.fatherName, m.motherName].filter(Boolean).join(' & ') || '—'}</p>
          <p style={{ fontFamily: spec.fonts.body, fontSize: 13, margin: '4px 0 0', opacity: 0.8 }}>{who}</p>
        </Reveal>
      );
      const inner = (
        <>
          <Reveal variant={R}>
            <h2 style={{ ...titleStyle, color: 'inherit', fontSize: spec.fonts.script ? 56 : 40 }}>{c.closingTitle || 'Terima kasih'}</h2>
            <p style={{ fontFamily: spec.fonts.body, fontSize: 14, lineHeight: 1.8, opacity: 0.88, maxWidth: 380, margin: '14px auto 0' }}>
              {c.closingText || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.'}
            </p>
          </Reveal>
          <Reveal variant={R} delay={0.1} style={{ marginTop: 34 }}>
            <p style={{ fontFamily: display, fontSize: 26, margin: 0 }}>Kami yang berbahagia</p>
          </Reveal>
          <div style={{ maxWidth: 360, margin: '10px auto 0' }}>
            {fam(groom, 'Keluarga Mempelai Pria')}
            {fam(bride, 'Keluarga Mempelai Wanita')}
          </div>
          <Reveal variant={R} style={{ marginTop: 30 }}>
            <p style={{ fontFamily: script, fontSize: 34, margin: 0 }}>
              {groom.nickname} &amp; {bride.nickname}
            </p>
          </Reveal>
        </>
      );
      if (scene) {
        return (
          <section key="closing" style={{ position: 'relative', zIndex: 2, padding: '6vh 26px 0', textAlign: 'center', color: 'var(--ink)' }}>
            {inner}
          </section>
        );
      }
      // standar: "Terima kasih" di atas foto layar penuh
      return (
        <section key="closing" style={{ position: 'relative', zIndex: 2, minHeight: '100vh', overflow: 'hidden', color: '#FFFFFF', textAlign: 'center', padding: '16vh 24px 110px', textShadow: '0 2px 14px rgba(0,0,0,.45)' }}>
          <Px style={{ position: 'absolute', inset: '-10% 0' }} y={[-50, 50]}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(data.gallery?.[data.gallery.length - 1] || heroPhoto)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </Px>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.62) 0%, rgba(0,0,0,.42) 40%, rgba(0,0,0,.78) 100%)' }} />
          <div style={{ position: 'relative' }}>{inner}</div>
        </section>
      );
    },
  };

  // Tema reguler memakai bagian standar (pola template premium); tema Spesial memakai bab adegan.
  const sections: Record<SectionId, () => React.ReactNode> = scene
    ? sceneSections
    : {
        ...standardSections({
          spec,
          data,
          flora,
          guest,
          rsvps,
          img,
          heroPhoto,
          dateText,
          events,
          left,
          passed,
          copied,
          copy,
          openLightbox: (photos, i) => setLightboxState({ photos, i }),
          rsvp: { name: rName, setName: setRName, status: rStatus, setStatus: setRStatus, pax: rPax, setPax: setRPax, wish: rWish, setWish: setRWish, sent: rSent, error: rError, submit: submitRSVP },
          calendarUrl,
          fmtDate,
          floating: spec.camera?.panel,
        }),
        hero: sceneSections.hero,
      };

  const Signature = spec.Signature;
  const Chapter = scene?.Chapter;
  const chapterData = {
    photos: [data.bgImageUrl, ...(data.gallery || [])].filter(Boolean).map((u) => img(u)),
    groom: groom.nickname,
    bride: bride.nickname,
    dateShort: fmtDate(mainDate, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' · '),
  };
  const Backdrop = Chapter ? undefined : scene?.Backdrop;

  // ---------- mode kamera ----------
  const cam = !scene ? spec.camera : undefined;
  const camRoot = useRef<HTMLElement | null>(null);
  const camSections = cam ? order.map((id) => ({ id, node: id === 'hero' ? camHero() : sections[id]?.() })).filter((x) => x.node && cam.stations[x.id]) : [];
  const camStations = useMemo(() => (cam ? camSections.map((x) => cam.stations[x.id]!) : []), [cam, camSections.map((x) => x.id).join()]);
  const camLayers = useMemo(() => (cam ? cam.layers() : []), [cam]);
  function camHero() {
    const ink = spec.heroInk || p.text;
    return (
      <section style={{ position: 'relative', zIndex: 2, minHeight: '100vh', textAlign: 'center', padding: '12vh 24px 0', color: ink, textShadow: '0 1px 0 rgba(255,255,255,.55), 0 0 22px rgba(255,248,235,.9)' }}>
        <Reveal variant={R} when={opened} from="down">
          <p style={{ ...eyebrow, color: ink, opacity: 0.85 }}>{c.heroTitle || 'The Wedding of'}</p>
        </Reveal>
        <Reveal variant={R} when={opened} from="left" delay={0.15} style={{ marginTop: 12 }}>
          <h1 style={{ fontFamily: script, fontSize: 'clamp(54px, 16vw, 76px)', fontWeight: 400, lineHeight: 1, margin: 0, color: p.primary }}>{groom.nickname}</h1>
        </Reveal>
        <Reveal variant="zoom" when={opened} delay={0.35}>
          <p style={{ fontFamily: display, fontSize: 24, margin: '4px 0', color: ink }}>&amp;</p>
        </Reveal>
        <Reveal variant={R} when={opened} from="right" delay={0.45}>
          <h1 style={{ fontFamily: script, fontSize: 'clamp(54px, 16vw, 76px)', fontWeight: 400, lineHeight: 1, margin: 0, color: p.primary }}>{bride.nickname}</h1>
        </Reveal>
        <Reveal variant={R} when={opened} from="up" delay={0.65}>
          <p style={{ fontFamily: label, fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 16 }}>{dateText}</p>
          <p style={{ fontFamily: spec.fonts.body, fontSize: 14, marginTop: 26, opacity: 0.85 }}>Gulir untuk memulai perjalanan</p>
        </Reveal>
      </section>
    );
  }

  const NAV_ICON: Partial<Record<SectionId, React.ReactNode>> = {
    hero: <IcHome size={18} />,
    couple: <IcHeart size={18} />,
    events: <IcCalendar size={18} />,
    gallery: <IcImage size={18} />,
    gift: <IcGift size={18} />,
    rsvp: <IcChat size={18} />,
  };
  const NAV_SHORT: Partial<Record<SectionId, string>> = { hero: 'Beranda', couple: 'Mempelai', events: 'Acara', gallery: 'Galeri', gift: 'Hadiah', rsvp: 'Ucapan' };
  const navItems = order
    .filter((id) => NAV_ICON[id] && (id === 'hero' || sections[id]?.()))
    .map((id) => ({ id, label: NAV_SHORT[id] as string, icon: NAV_ICON[id] }));

  const page = (
    <div
      style={{
        position: 'relative',
        minHeight: '100%',
        background: p.bg,
        color: p.text,
        fontFamily: spec.fonts.body,
        // 'clip' (bukan 'hidden') agar hero sticky tetap bekerja
        overflowX: 'clip',
      }}
    >
      <style>{fontImport(spec.fonts.google)}</style>
      <KitOverlay z={0}>
        {Backdrop && (
          <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <Backdrop palette={p} />
          </div>
        )}
        {spec.pattern && !scene && <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: spec.pattern, opacity: spec.patternOpacity ?? 0.5, pointerEvents: 'none', zIndex: 0 }} />}
      </KitOverlay>
      <KitOverlay z={1}>
        {Signature && <Signature palette={p} />}
        {opened && <Ambient preset={spec.ambient} palette={p} />}
      </KitOverlay>

      {!opened && (
        <KitOverlay z={100}>
          <Cover spec={spec} groom={groom.nickname} bride={bride.nickname} dateText={dateText} guestName={guestName} photo={heroPhoto} onOpen={handleOpen} />
        </KitOverlay>
      )}

      {cam ? (
        <main ref={camRoot} style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh', marginBottom: '-100vh', zIndex: 0 }}>
            <CameraStage stations={camStations} layers={camLayers} sky={cam.sky} tint={cam.tint} actors={cam.Actors ? <cam.Actors /> : null} actorDepth={cam.actorDepth} root={camRoot} />
          </div>
          {camSections.map(({ id, node }, i) => (
            <div key={id} data-section={id} style={{ position: 'relative', zIndex: 2 }}>
              <div data-cam-hold style={id === 'hero' ? { minHeight: '100vh' } : { padding: '6vh 0' }}>
                {node}
              </div>
              <div data-cam-gap aria-hidden style={{ height: i === camSections.length - 1 ? '30vh' : cam.gap || '75vh' }} />
            </div>
          ))}
        </main>
      ) : (
      <main style={{ position: 'relative', zIndex: 2, maxWidth: Chapter ? 'none' : 560, margin: '0 auto', opacity: opened || Chapter || !scene ? 1 : 0, transition: 'opacity 900ms ease 500ms' }}>
        {order.map((id) => {
          const node = sections[id]?.();
          if (!node) return node;
          if (!scene) {
            if (id !== 'hero') return <div key={id} data-section={id}>{node}</div>;
            // Panggung pembuka 2.5D standar: lapisan di belakang nama + rangkaian bunga & kupu-kupu di depan
            const Stage = spec.Stage || PaintedStage;
            return (
              <div key="hero" data-chapter="hero" data-section="hero" style={{ position: 'relative', minHeight: '100vh', overflow: 'clip' }}>
                <div aria-hidden style={{ position: 'sticky', top: 0, height: '100vh', marginBottom: '-100vh', overflow: 'hidden' }}>
                  {spec.hero === 'photo' ? (
                    <>
                      <div style={{ position: 'absolute', inset: 0, background: p.cover || '#000' }} />
                      <ArtLayer depth={0.12} hero order={0}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={heroPhoto} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 35%, ${p.cover || '#000'}E6 92%)` }} />
                      </ArtLayer>
                    </>
                  ) : (
                    spec.Stage ? <Stage palette={p} flora={flora} photo={spec.hero === 'frame' ? heroPhoto : undefined} /> : <PaintedStage palette={p} flora={flora} photo={spec.hero === 'frame' ? heroPhoto : undefined} scene={spec.stageArt} />
                  )}
                </div>
                {node}
                {/* buket lukisan di depan panggung hanya untuk tema berornamen bunga */}
                {(spec.ornament || (spec.floraArt ? 'flora' : 'none')) === 'flora' && (
                  <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
                    <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
                      <StageFront flora={flora} />
                    </div>
                  </div>
                )}
              </div>
            );
          }
          if (Chapter) {
            // Bab layar penuh: ilustrasi menempel (sticky) selama isinya digulir; lapisan depan menutupi teks
            const tone = scene.ink?.[id] || { color: p.text };
            const cd = chapterData;
            const short = id === 'hero' || id === 'quote' || id === 'countdown' || id === 'closing';
            return (
              <div
                key={id}
                data-chapter={id}
                data-section={id}
                style={
                  {
                    position: 'relative',
                    minHeight: id === 'hero' ? '108vh' : '100vh',
                    overflow: 'clip',
                    color: tone.color,
                    textShadow: tone.shadow || 'none',
                    '--ink': tone.color,
                    '--accent': p.primary,
                  } as React.CSSProperties
                }
              >
                <div aria-hidden style={{ position: 'sticky', top: 0, height: '100vh', marginBottom: '-100vh', zIndex: 0, overflow: 'hidden' }}>
                  <Chapter id={id} layer="back" data={cd} />
                </div>
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 520, margin: '0 auto', padding: id === 'hero' && scene.heroAlign === 'bottom' ? '42vh 0 16vh' : id !== 'hero' && scene.contentTop ? `${scene.contentTop} 0 22vh` : short ? '15vh 0 30vh' : '12vh 0 22vh' }}>{node}</div>
                <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
                  <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
                    <Chapter id={id} layer="front" data={cd} />
                  </div>
                </div>
              </div>
            );
          }
          if (id === 'hero') return node;
          const Decor = scene.SectionDecor;
          // Bagian tema Spesial: ornamen di belakang panel, panel, ornamen di depan panel
          return (
            <div key={id} data-section={id} style={{ position: 'relative', margin: id === 'closing' ? 0 : '26px 14px' }}>
              {Decor && (
                <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
                  <Decor id={id} layer="back" palette={p} />
                </div>
              )}
              {node}
              {Decor && (
                <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
                  <Decor id={id} layer="front" palette={p} />
                </div>
              )}
            </div>
          );
        })}
      </main>
      )}

      {opened && (
        <KitOverlay z={70}>
          <BottomNav p={p} font={label} items={navItems} />
          {data.musicUrl && !embedded && <MusicDisc playing={playing} onToggle={toggleMusic} p={p} />}
        </KitOverlay>
      )}
      {extras && <div style={{ position: 'relative', zIndex: 2 }}>{extras}</div>}
      {!scene && (
        <footer style={{ position: 'relative', zIndex: 2, padding: '28px 20px 110px', textAlign: 'center', background: p.cover || p.text, color: p.onCover || p.bg }}>
          <p style={{ fontFamily: label, fontSize: 12, letterSpacing: '0.12em', margin: 0, opacity: 0.75 }}>Undangan digital oleh RuangHadir</p>
        </footer>
      )}
      <style>{'@keyframes kit-spin { to { transform: rotate(360deg); } } @keyframes kit-cue { 0%{transform:scaleY(0);opacity:0} 40%{transform:scaleY(1);opacity:.6} 100%{transform:scaleY(1) translateY(30px);opacity:0} }'}</style>

      {lightbox && (
        <KitOverlay z={120}>
          <Lightbox photos={lightbox.photos} index={lightbox.i} onIndex={(i) => setLightboxState({ ...lightbox, i })} onClose={() => setLightboxState(null)} />
        </KitOverlay>
      )}
    </div>
  );

  return (
    <SceneProvider opened={opened} intro={scene?.intro || 'descend'} introMs={introMs}>
      <style>{KIT_CSS}</style>
      {page}
    </SceneProvider>
  );
}
