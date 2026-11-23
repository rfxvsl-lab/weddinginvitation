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

interface KitLayoutProps {
  data: WeddingData;
  theme: ThemeConfig;
  guest?: Guest;
  onAddRSVP: (rsvp: RSVP) => void;
  rsvps: RSVP[];
  embedded?: boolean;
  invitationId?: string;
}

const DEFAULT_ORDER: SectionId[] = ['hero', 'quote', 'couple', 'countdown', 'events', 'story', 'gallery', 'gift', 'rsvp', 'closing'];

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

export default function KitLayout({ data, theme, guest, onAddRSVP, rsvps, embedded = false, invitationId }: KitLayoutProps) {
  const spec = getKitTheme(theme.id) as ThemeSpec;
  const p = spec.palette;
  const c = spec.copy || {};
  const [opened, setOpened] = useState(embedded);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
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
  const handleOpen = () => {
    if (spec.scene) requestTiltPermission();
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
  const submitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName.trim() || !rWish.trim()) return;
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

  const order = spec.sections || DEFAULT_ORDER;
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

  const sections: Record<SectionId, () => React.ReactNode> = {
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
      if (spec.hero === 'photo') {
        return (
          <section key="hero" style={{ position: 'relative', zIndex: 2, minHeight: '92vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 24px 64px', textAlign: 'center', color: p.onCover || '#fff', overflow: 'hidden' }}>
            {heroPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroPhoto} alt={`${groom.nickname} & ${bride.nickname}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 30%, ${p.cover || '#000'}E6 100%)` }} />
            <Reveal variant={R} style={{ position: 'relative' }}>
              <p style={{ ...eyebrow, color: 'inherit', opacity: 0.85 }}>{c.heroTitle || 'The Wedding of'}</p>
              <h1 style={{ fontFamily: script, fontSize: 'clamp(48px, 14vw, 72px)', fontWeight: 400, lineHeight: 1.05, margin: '10px 0' }}>
                {groom.nickname} &amp; {bride.nickname}
              </h1>
              <p style={{ fontFamily: spec.fonts.body, fontSize: 15 }}>{dateText}</p>
            </Reveal>
          </section>
        );
      }
      if (spec.hero === 'frame') {
        return (
          <section key="hero" style={{ ...sectionStyle, paddingTop: 88 }}>
            <Reveal variant={R}>
              <p style={eyebrow}>{c.heroTitle || 'The Wedding of'}</p>
            </Reveal>
            <Reveal variant={R} delay={0.1} style={{ margin: '22px 0' }}>
              <Frame src={heroPhoto} alt="Foto mempelai" shape={spec.frame} palette={p} width={240} height={spec.frame === 'circle' ? 228 : 310} />
            </Reveal>
            <Reveal variant={R} delay={0.2}>
              <h1 style={{ fontFamily: script, fontSize: 'clamp(46px, 13vw, 64px)', fontWeight: 400, lineHeight: 1.05, color: p.primary, margin: 0 }}>
                {groom.nickname} <span style={{ fontFamily: display, fontSize: '0.55em', color: p.secondary }}>&amp;</span> {bride.nickname}
              </h1>
              <Divider spec={spec} />
              <p style={{ fontFamily: spec.fonts.body, fontSize: 15, color: p.text }}>{dateText}</p>
            </Reveal>
          </section>
        );
      }
      // type: tipografi besar bertumpuk
      return (
        <section key="hero" style={{ ...sectionStyle, minHeight: '88vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Reveal variant={R}>
            <p style={eyebrow}>{c.heroTitle || 'The Wedding of'}</p>
          </Reveal>
          <Reveal variant={R} delay={0.1}>
            <h1 style={{ fontFamily: display, fontSize: 'clamp(64px, 22vw, 112px)', fontWeight: 400, lineHeight: 0.9, color: p.primary, margin: '18px 0 0', letterSpacing: '-0.02em' }}>{groom.nickname}</h1>
          </Reveal>
          <Reveal variant={R} delay={0.2}>
            <p style={{ fontFamily: script, fontSize: 44, color: p.secondary, margin: '4px 0' }}>&amp;</p>
          </Reveal>
          <Reveal variant={R} delay={0.3}>
            <h1 style={{ fontFamily: display, fontSize: 'clamp(64px, 22vw, 112px)', fontWeight: 400, lineHeight: 0.9, color: p.primary, margin: 0, letterSpacing: '-0.02em' }}>{bride.nickname}</h1>
          </Reveal>
          <Reveal variant={R} delay={0.4}>
            <Divider spec={spec} />
            <p style={{ fontFamily: label, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: p.text }}>{fmtDate(mainDate, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' · ')}</p>
          </Reveal>
        </section>
      );
    },

    quote: () =>
      data.quoteText ? (
        <section key="quote" style={sectionStyle}>
          <Reveal variant={R} style={{ ...card, maxWidth: 420, margin: '0 auto', padding: '36px 26px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: spec.couple === 'split' ? '1fr 1fr' : '1fr', gap: spec.couple === 'split' ? 14 : 22, maxWidth: 440, margin: '0 auto' }}>
            {people.map(({ m, rel }, i) => (
              <React.Fragment key={m.fullName + i}>
                {M(
                <Reveal variant={R} delay={i * 0.12} style={spec.couple === 'split' ? (scene ? { ...card, padding: '16px 8px' } : { padding: '6px 0' }) : card}>
                  {spec.couple === 'cards' && corners(p.secondary)}
                  <Frame
                    src={img(m.photoUrl)}
                    alt={m.fullName}
                    shape={spec.frame}
                    palette={p}
                    width={spec.couple === 'split' ? 132 : 168}
                    height={spec.couple === 'split' ? (spec.frame === 'circle' ? 126 : 170) : spec.frame === 'circle' ? 160 : 214}
                    position="center 25%"
                    wrapImg={imgPx}
                  />
                  <h3 style={{ fontFamily: display, fontSize: spec.couple === 'split' ? 19 : 24, fontWeight: 500, color: p.text, margin: '18px 0 6px', lineHeight: 1.25 }}>{m.fullName}</h3>
                  <p style={{ fontFamily: spec.fonts.body, fontSize: 12.5, lineHeight: 1.6, color: p.muted, margin: 0 }}>
                    {rel}
                    <br />
                    {[m.fatherName, m.motherName].filter(Boolean).join(' & ')}
                  </p>
                  {m.instagram && (
                    <a href={`https://instagram.com/${m.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ ...eyebrow, display: 'inline-block', marginTop: 10, color: p.primary, textDecoration: 'none' }}>
                      @{m.instagram.replace('@', '')}
                    </a>
                  )}
                </Reveal>,
                { x: [i === 0 ? -70 : 70, 0], rotate: [i === 0 ? -7 : 7, 0], opacity: [0.2, 1], range: [0.05, 0.42], ease: 'out' }
                )}
                {spec.couple === 'cards' && i === 0 && (
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
        <section key="countdown" style={{ ...sectionStyle, paddingTop: 40, paddingBottom: 40 }}>
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
            {spec.events === 'timeline' && <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 1, background: p.secondary }} />}
            {events.map(([key, ev], i) => M((() => {
              const body = (
                <>
                  <h3 style={{ fontFamily: display, fontSize: 24, fontWeight: 500, color: p.primary, margin: '0 0 10px' }}>{ev.name || (key === 'akad' ? 'Akad Nikah' : 'Resepsi')}</h3>
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
        <section key="story" style={sectionStyle}>
          {Title({ text: c.storyTitle || 'Kisah Kami' })}
          <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'left', borderLeft: `1px solid ${p.secondary}`, paddingLeft: 22, ...(scene ? { ...card, textAlign: 'left', paddingLeft: 40 } : {}) }}>
            {data.loveStories.map((s, i) => M(
              <Reveal variant={R} delay={i * 0.08} style={{ position: 'relative', marginBottom: 28 }}>
                <span style={{ position: 'absolute', left: scene ? -24 : -28, top: 4, width: 11, height: 11, borderRadius: 999, background: p.primary }} />
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
                <p style={{ ...eyebrow, color: p.primary }}>{g.name}</p>
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
          {rsvps?.length > 0 && (
            <div style={{ maxWidth: 420, margin: '22px auto 0', maxHeight: 360, overflowY: 'auto', textAlign: 'left', display: 'grid', gap: 10 }}>
              {rsvps
                .filter((r) => r.wishes)
                .slice(0, 40)
                .map((r) => (
                  <div key={r.id} style={{ background: `${p.surface}CC`, border: `1px solid ${p.secondary}44`, borderRadius: Math.min(spec.radius, 12), padding: '12px 14px' }}>
                    <p style={{ fontFamily: spec.fonts.body, fontSize: 13, fontWeight: 700, color: p.text, margin: 0 }}>
                      {r.guestName} <span style={{ fontWeight: 400, color: p.muted, fontSize: 11.5 }}>· {r.status}</span>
                    </p>
                    <p style={{ fontFamily: spec.fonts.body, fontSize: 13, lineHeight: 1.6, color: p.muted, margin: '4px 0 0' }}>{r.wishes}</p>
                  </div>
                ))}
            </div>
          )}
        </section>
      );
    },

    closing: () => (
      <section
        key="closing"
        style={
          scene
            ? { position: 'relative', zIndex: 2, padding: '6vh 26px 0', textAlign: 'center', color: 'var(--ink)' }
            : { ...sectionStyle, paddingBottom: 110 }
        }
      >
        <Reveal variant={R}>
          <p style={{ fontFamily: spec.fonts.body, fontSize: 14, lineHeight: 1.8, color: scene ? 'inherit' : p.muted, opacity: scene ? 0.85 : 1, maxWidth: 380, margin: '0 auto' }}>
            {c.closingText || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.'}
          </p>
          <h2 style={{ ...titleStyle, marginTop: 26, color: scene ? 'inherit' : p.primary }}>{c.closingTitle || 'Terima kasih'}</h2>
          <Divider spec={spec} />
          <p style={{ fontFamily: display, fontSize: 24, color: scene ? 'inherit' : p.text }}>
            {groom.nickname} &amp; {bride.nickname}
          </p>
        </Reveal>
      </section>
    ),
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
      {Backdrop && (
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <Backdrop palette={p} />
        </div>
      )}
      {spec.pattern && !scene && <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundImage: spec.pattern, opacity: spec.patternOpacity ?? 0.5, pointerEvents: 'none', zIndex: 0 }} />}
      {Signature && <Signature palette={p} />}
      {opened && <Ambient preset={spec.ambient} palette={p} />}

      {!opened && <Cover spec={spec} groom={groom.nickname} bride={bride.nickname} dateText={dateText} guestName={guestName} photo={heroPhoto} onOpen={handleOpen} />}

      <main style={{ position: 'relative', zIndex: 2, maxWidth: Chapter ? 'none' : 520, margin: '0 auto', opacity: opened || Chapter || !scene ? 1 : 0, transition: 'opacity 900ms ease 500ms' }}>
        {order.map((id) => {
          const node = sections[id]?.();
          if (!node || !scene) return node;
          if (Chapter) {
            // Bab layar penuh: ilustrasi menempel (sticky) selama isinya digulir; lapisan depan menutupi teks
            const tone = scene.ink?.[id] || { color: p.text };
            const cd = chapterData;
            const short = id === 'hero' || id === 'quote' || id === 'countdown' || id === 'closing';
            return (
              <div
                key={id}
                data-chapter={id}
                style={
                  {
                    position: 'relative',
                    minHeight: id === 'hero' ? '108vh' : '100vh',
                    overflow: 'clip',
                    color: tone.color,
                    textShadow: tone.shadow || 'none',
                    '--ink': tone.color,
                  } as React.CSSProperties
                }
              >
                <div aria-hidden style={{ position: 'sticky', top: 0, height: '100vh', marginBottom: '-100vh', zIndex: 0, overflow: 'hidden' }}>
                  <Chapter id={id} layer="back" data={cd} />
                </div>
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 520, margin: '0 auto', padding: id === 'hero' && scene.heroAlign === 'bottom' ? '42vh 0 16vh' : short ? '15vh 0 30vh' : '12vh 0 22vh' }}>{node}</div>
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
            <div key={id} style={{ position: 'relative', margin: id === 'closing' ? 0 : '26px 14px' }}>
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

      {data.musicUrl && opened && !embedded && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? 'Jeda musik' : 'Putar musik'}
          style={{ position: 'fixed', right: 16, bottom: 18, zIndex: 60, width: 44, height: 44, borderRadius: 999, border: `1px solid ${p.secondary}`, background: p.surface, color: p.primary, boxShadow: '0 10px 24px -12px rgba(0,0,0,.5)', cursor: 'pointer', fontSize: 16, animation: playing ? 'kit-spin 6s linear infinite' : undefined }}
        >
          ♫
        </button>
      )}
      <style>{'@keyframes kit-spin { to { transform: rotate(360deg); } } @keyframes kit-cue { 0%{transform:scaleY(0);opacity:0} 40%{transform:scaleY(1);opacity:.6} 100%{transform:scaleY(1) translateY(30px);opacity:0} }'}</style>

      {lightbox && (
        <div role="dialog" aria-label="Foto" onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(0,0,0,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );

  return scene ? (
    <SceneProvider opened={opened} intro={scene.intro} introMs={scene.introMs}>
      {page}
    </SceneProvider>
  ) : (
    page
  );
}
