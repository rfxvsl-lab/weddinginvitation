'use client';

/**
 * Bagian undangan "standar" untuk tema reguler — mengikuti pola template premium yang
 * umum di pasar Indonesia (Katsudoto, Satu Momen, Viding/Invitato):
 *
 *   pembuka berfoto + kutipan → mempelai (bingkai foto, nama, orang tua, Instagram) →
 *   save the date di atas foto (hitung mundur) → acara (hari, tanggal besar, jam, tempat,
 *   peta, kalender) → kisah (garis waktu) → galeri (foto utama + kisi, lightbox) →
 *   amplop digital (kartu rekening) → RSVP → ucapan (ringkasan + daftar) → penutup berfoto.
 *
 * Aturan visual (lihat docs/themes/STANDARD.md):
 * - satu skala huruf: eyebrow 12, isi 15/1.75, judul skrip 46 / display 34, nama 48–56
 * - jarak bagian 88px, lebar isi maks 400px, ornamen hanya di tepi bagian (tidak di kartu)
 * - foto selalu object-fit cover dengan fokus wajah (center 25%)
 * - tombol: ikon + teks, ukuran sentuh ≥ 44px, keadaan hover/aktif/fokus
 */

import React from 'react';
import type { EventDetails, Guest, RSVP, WeddingData } from '../../types';
import type { SectionId, ThemeSpec } from '../types';
import { Divider, Frame, Reveal } from './primitives';
import { Px } from './scene';
import { SectionOrnament, Slideshow, relTime, type Flora } from './standard';
import { IcBroadcast, IcCalendar, IcCheck, IcClock, IcCopy, IcInstagram, IcPin } from './icons';

export interface StdCtx {
  spec: ThemeSpec;
  data: WeddingData;
  flora: Flora;
  guest?: Guest;
  rsvps: RSVP[];
  img: (u?: string) => string;
  heroPhoto: string;
  dateText: string;
  events: [string, EventDetails][];
  left: { d: number; h: number; m: number; s: number };
  passed: boolean;
  copied: string | null;
  copy: (id: string, value: string) => void;
  openLightbox: (photos: string[], i: number) => void;
  rsvp: {
    name: string;
    setName: (v: string) => void;
    status: RSVP['status'];
    setStatus: (v: RSVP['status']) => void;
    pax: number;
    setPax: (v: number) => void;
    wish: string;
    setWish: (v: string) => void;
    sent: boolean;
    error: string | null;
    submit: (e: React.FormEvent) => void;
  };
  calendarUrl: (ev: EventDetails, title: string) => string;
  fmtDate: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
}

export const STANDARD_ORDER: SectionId[] = ['hero', 'quote', 'couple', 'countdown', 'events', 'story', 'gallery', 'gift', 'rsvp', 'wishes', 'closing'];

/** Bagian yang memakai pita latar `surface` agar ritme halaman berselang-seling. */
const BAND: Partial<Record<SectionId, boolean>> = { events: true, gift: true, wishes: false };

export function standardSections(ctx: StdCtx): Record<SectionId, () => React.ReactNode> {
  const { spec, data, flora, img, heroPhoto, dateText, events, left, passed, copied, copy, openLightbox, rsvp, rsvps, guest, calendarUrl, fmtDate } = ctx;
  const p = spec.palette;
  const c = spec.copy || {};
  const R = spec.reveal;
  const display = spec.fonts.display;
  const script = spec.fonts.script || display;
  const hasScript = Boolean(spec.fonts.script);
  const label = spec.fonts.label || spec.fonts.body;
  const body = spec.fonts.body;
  const groom = data.couple.groom;
  const bride = data.couple.bride;
  const ornament: 'flora' | 'line' | 'none' = spec.ornament || (spec.floraArt ? 'flora' : spec.cornerSvg ? 'line' : 'none');

  // ---------- token ----------
  const eyebrow: React.CSSProperties = { fontFamily: label, fontSize: 12, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: p.muted, margin: 0 };
  const titleSt: React.CSSProperties = hasScript
    ? { fontFamily: script, fontSize: 46, fontWeight: 400, lineHeight: 1.1, color: p.primary, margin: 0, textWrap: 'balance' as React.CSSProperties['textWrap'] }
    : { fontFamily: display, fontSize: 34, fontWeight: 500, lineHeight: 1.15, color: p.primary, margin: 0, letterSpacing: '0.01em', textWrap: 'balance' as React.CSSProperties['textWrap'] };
  const bodySt: React.CSSProperties = { fontFamily: body, fontSize: 15, lineHeight: 1.75, color: p.text, margin: 0, textWrap: 'pretty' as React.CSSProperties['textWrap'] };
  const mutedSt: React.CSSProperties = { ...bodySt, fontSize: 14, color: p.muted };
  const radius = spec.radius;
  const btnRadius = Math.min(radius, 999) >= 20 ? 999 : Math.max(6, Math.min(radius, 14));
  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    fontFamily: label,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: p.onPrimary,
    background: p.primary,
    border: `1px solid ${p.primary}`,
    borderRadius: btnRadius,
    padding: '10px 18px',
    textDecoration: 'none',
    cursor: 'pointer',
  };
  const btnGhost: React.CSSProperties = { ...btn, color: p.primary, background: 'transparent' };
  const card: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    background: p.surface,
    border: `1px solid ${p.secondary}55`,
    borderRadius: radius,
    padding: '34px 24px',
    boxShadow: '0 24px 48px -36px rgba(0,0,0,.45)',
    textAlign: 'center',
  };
  const section = (id: SectionId, i: number): React.CSSProperties => ({
    position: 'relative',
    zIndex: 2,
    padding: '88px 28px',
    textAlign: 'center',
    background: BAND[id] ? p.surface : undefined,
    // lekuk tipis di tepi pita
    boxShadow: BAND[id] ? `inset 0 1px 0 ${p.secondary}33, inset 0 -1px 0 ${p.secondary}33` : undefined,
    ['--i' as string]: i,
  });
  const inner: React.CSSProperties = { position: 'relative', zIndex: 2, maxWidth: 400, margin: '0 auto' };

  const Title = (text: string, sub?: string) => (
    <Reveal variant={R} style={{ marginBottom: 34 }}>
      {sub && <p style={{ ...eyebrow, marginBottom: 10 }}>{sub}</p>}
      <h2 style={titleSt}>{text}</h2>
      <Divider spec={spec} width={150} />
    </Reveal>
  );
  const Orn = (seed: number, flip = false) => <SectionOrnament mode={ornament} flora={flora} svg={spec.cornerSvg} color={p.secondary} flip={flip} seed={seed} />;
  const photoBand = (src: string, children: React.ReactNode, key: string, minH = '86vh') => (
    <section key={key} style={{ position: 'relative', zIndex: 2, minHeight: minH, overflow: 'hidden', color: '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '96px 28px' }}>
      <Px style={{ position: 'absolute', inset: '-12% 0' }} y={[-50, 50]}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
      </Px>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${p.cover || '#000'}99 0%, rgba(0,0,0,.35) 45%, ${p.cover || '#000'}D9 100%)` }} />
      <div style={{ ...inner, textShadow: '0 2px 16px rgba(0,0,0,.4)' }}>{children}</div>
    </section>
  );
  const parents = (m: typeof groom) => [m.fatherName, m.motherName].filter(Boolean).join(' & ');
  const photos = (data.gallery || []).filter(Boolean).map(img);
  const pick = (i: number) => photos[i % Math.max(photos.length, 1)] || heroPhoto;

  return {
    // hero dirender oleh KitLayout (panggung pembuka bersama)
    hero: () => null,

    quote: () =>
      data.quoteText ? (
        <section key="quote" style={section('quote', 1)}>
          {Orn(2)}
          <div style={inner}>
            <Reveal variant={R} from="down" style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
              <Frame src={pick(1)} alt={`${groom.nickname} & ${bride.nickname}`} shape={spec.frame === 'circle' ? 'circle' : spec.frame} palette={p} width={220} height={spec.frame === 'circle' ? 220 : 290} position="center 30%" wrapImg={(im) => <Px style={{ height: '100%' }} y={[-14, 14]} scale={[1.1, 1.1]}>{im}</Px>} />
            </Reveal>
            <Reveal variant={R} delay={0.1}>
              <p style={{ fontFamily: display, fontStyle: 'italic', fontSize: 17, lineHeight: 1.8, color: p.text, margin: 0, textWrap: 'pretty' }}>“{data.quoteText}”</p>
              {data.quoteSource && <p style={{ ...eyebrow, color: p.primary, marginTop: 18 }}>{data.quoteSource}</p>}
            </Reveal>
          </div>
        </section>
      ) : null,

    couple: () => {
      const people = [
        { m: groom, rel: c.groomLabel || 'Putra dari' },
        { m: bride, rel: c.brideLabel || 'Putri dari' },
      ];
      const split = spec.couple === 'split';
      return (
        <section key="couple" style={section('couple', 2)}>
          {Orn(5, true)}
          <div style={inner}>
            {Title(c.coupleTitle || 'Mempelai', c.coupleTitle ? 'Kedua mempelai' : undefined)}
            <Reveal variant={R}>
              <p style={{ ...mutedSt, maxWidth: 340, margin: '-8px auto 44px' }}>
                {c.coupleIntro || 'Dengan memohon rahmat dan ridha Allah Subhanahu wa Ta’ala, kami bermaksud menyelenggarakan pernikahan putra-putri kami:'}
              </p>
            </Reveal>
            {people.map(({ m, rel }, i) => (
              <React.Fragment key={m.fullName + i}>
                <Reveal variant={R} from={split ? (i ? 'right' : 'left') : undefined} style={{ position: 'relative', display: split ? 'grid' : 'block', gridTemplateColumns: split ? (i ? '1fr 132px' : '132px 1fr') : undefined, gap: split ? 18 : undefined, alignItems: 'center', textAlign: split ? (i ? 'right' : 'left') : 'center' }}>
                  <div style={{ order: split && i ? 2 : 0 }}>
                    <Frame
                      src={img(m.photoUrl)}
                      alt={m.fullName}
                      shape={spec.frame}
                      palette={p}
                      width={split ? 132 : 200}
                      height={split ? (spec.frame === 'circle' ? 132 : 176) : spec.frame === 'circle' ? 200 : 266}
                      position="center 25%"
                      wrapImg={(im) => <Px style={{ height: '100%' }} y={[-12, 12]} scale={[1.1, 1.1]}>{im}</Px>}
                    />
                  </div>
                  <div style={{ marginTop: split ? 0 : 22 }}>
                    <p style={{ fontFamily: script, fontSize: hasScript ? 48 : 34, color: p.primary, margin: 0, lineHeight: 1.05 }}>{m.nickname}</p>
                    <h3 style={{ fontFamily: display, fontSize: 19, fontWeight: 500, color: p.text, margin: '10px 0 8px', lineHeight: 1.35, letterSpacing: '0.02em' }}>{m.fullName}</h3>
                    <p style={{ ...mutedSt, fontSize: 13.5, lineHeight: 1.65 }}>
                      {rel}
                      <br />
                      <span style={{ color: p.text, fontWeight: 500 }}>{parents(m)}</span>
                    </p>
                    {m.instagram && (
                      <a className="kit-press" href={`https://instagram.com/${m.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ ...btnGhost, minHeight: 38, padding: '6px 14px', fontSize: 12, marginTop: 14, letterSpacing: '0.02em' }}>
                        <IcInstagram size={16} /> {m.instagram.replace('@', '')}
                      </a>
                    )}
                  </div>
                </Reveal>
                {i === 0 && (
                  <Reveal variant="zoom" style={{ fontFamily: script, fontSize: hasScript ? 64 : 44, color: p.secondary, lineHeight: 1, margin: '30px 0' }}>
                    &amp;
                  </Reveal>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      );
    },

    interlude: () => {
      const list = [...photos.slice(2, 6), heroPhoto].filter(Boolean);
      return list.length ? (
        <section key="interlude" style={{ position: 'relative', zIndex: 2 }}>
          <Slideshow photos={list} height="72vh" />
        </section>
      ) : null;
    },

    countdown: () =>
      data.countdownDate
        ? photoBand(
            pick(3),
            <>
              <Reveal variant={R}>
                <p style={{ ...eyebrow, color: 'rgba(255,255,255,.85)' }}>{c.countdownTitle || 'Menghitung hari'}</p>
                <h2 style={{ ...titleSt, color: '#fff', marginTop: 10, fontSize: hasScript ? 54 : 38 }}>Save the Date</h2>
                <p style={{ fontFamily: label, fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '14px 0 0' }}>{dateText}</p>
              </Reveal>
              {passed ? (
                <Reveal variant={R} delay={0.1} style={{ fontFamily: display, fontStyle: 'italic', fontSize: 20, marginTop: 26 }}>
                  Hari bahagia telah tiba
                </Reveal>
              ) : (
                <Reveal variant={R} delay={0.1} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 320, margin: '30px auto 0' }}>
                  {(
                    [
                      [left.d, 'Hari'],
                      [left.h, 'Jam'],
                      [left.m, 'Menit'],
                      [left.s, 'Detik'],
                    ] as [number, string][]
                  ).map(([v, l]) => (
                    <div key={l} style={{ padding: '14px 0 12px', borderRadius: Math.min(radius, 14), background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.28)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', textShadow: 'none' }}>
                      <div style={{ fontFamily: display, fontSize: 28, lineHeight: 1.1, fontVariantNumeric: 'lining-nums tabular-nums' }}>{String(v).padStart(2, '0')}</div>
                      <div style={{ fontFamily: label, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 4, opacity: 0.85 }}>{l}</div>
                    </div>
                  ))}
                </Reveal>
              )}
              {events[0] && events[0][1].date && (
                <Reveal variant={R} delay={0.2} style={{ marginTop: 28 }}>
                  <a className="kit-press" href={calendarUrl(events[0][1], `Pernikahan ${groom.nickname} & ${bride.nickname}`)} target="_blank" rel="noreferrer" style={{ ...btn, background: 'rgba(255,255,255,.14)', borderColor: 'rgba(255,255,255,.6)', color: '#fff', backdropFilter: 'blur(6px)', textShadow: 'none' }}>
                    <IcCalendar size={16} /> Simpan tanggal
                  </a>
                </Reveal>
              )}
            </>,
            'countdown'
          )
        : null,

    events: () =>
      events.length ? (
        <section key="events" style={section('events', 4)}>
          {Orn(9)}
          <div style={inner}>
            {Title(c.eventsTitle || 'Waktu & Tempat', 'Rangkaian acara')}
            <div style={{ position: 'relative', display: 'grid', gap: spec.events === 'timeline' ? 0 : 22 }}>
              {events.map(([key, ev], i) => {
                const dayName = fmtDate(ev.date, { weekday: 'long' });
                const dayNum = fmtDate(ev.date, { day: '2-digit' });
                const month = fmtDate(ev.date, { month: 'long' });
                const year = fmtDate(ev.date, { year: 'numeric' });
                const name = ev.name || (key === 'akad' ? 'Akad Nikah' : 'Resepsi');
                const ticket = spec.events === 'ticket';
                const content = (
                  <>
                    <h3 style={{ fontFamily: hasScript ? script : display, fontSize: hasScript ? 40 : 26, fontWeight: hasScript ? 400 : 500, color: p.primary, margin: 0, lineHeight: 1.1 }}>{name}</h3>
                    {ev.date && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14, margin: '22px 0 18px' }}>
                        <div style={{ textAlign: 'right', padding: '8px 0', borderTop: `1px solid ${p.secondary}`, borderBottom: `1px solid ${p.secondary}` }}>
                          <span style={{ fontFamily: label, fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: p.text }}>{dayName}</span>
                        </div>
                        <span style={{ fontFamily: display, fontSize: 52, lineHeight: 1, color: p.primary, fontVariantNumeric: 'lining-nums' }}>{dayNum}</span>
                        <div style={{ textAlign: 'left', padding: '8px 0', borderTop: `1px solid ${p.secondary}`, borderBottom: `1px solid ${p.secondary}` }}>
                          <span style={{ fontFamily: label, fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: p.text }}>
                            {month} {year}
                          </span>
                        </div>
                      </div>
                    )}
                    {ev.timeStart && (
                      <p style={{ ...bodySt, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 500 }}>
                        <IcClock size={16} style={{ color: p.primary }} />
                        {ev.timeStart.replace(':', '.')}
                        {ev.timeEnd ? ` – ${ev.timeEnd.replace(':', '.')}` : ' – selesai'} WIB
                      </p>
                    )}
                    <div style={{ width: 40, height: 1, background: p.secondary, margin: '20px auto' }} />
                    <p style={{ ...bodySt, fontWeight: 600 }}>{ev.venueName}</p>
                    {ev.address && <p style={{ ...mutedSt, fontSize: 13.5, marginTop: 6 }}>{ev.address}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 24 }}>
                      {ev.googleMapsUrl && (
                        <a className="kit-press" href={ev.googleMapsUrl} target="_blank" rel="noreferrer" style={btn}>
                          <IcPin size={16} /> Lihat lokasi
                        </a>
                      )}
                      {ev.date && (
                        <a className="kit-press" href={calendarUrl(ev, `${name} ${groom.nickname} & ${bride.nickname}`)} target="_blank" rel="noreferrer" style={btnGhost}>
                          <IcCalendar size={16} /> Simpan ke kalender
                        </a>
                      )}
                    </div>
                  </>
                );
                if (spec.events === 'timeline') {
                  return (
                    <Reveal key={key} variant={R} from={i % 2 ? 'right' : 'left'} style={{ position: 'relative', paddingTop: i ? 36 : 0 }}>
                      {i > 0 && <span aria-hidden style={{ position: 'absolute', left: '50%', top: 0, height: 36, width: 1, background: p.secondary }} />}
                      <div style={{ ...card, background: p.bg }}>{content}</div>
                    </Reveal>
                  );
                }
                return (
                  <Reveal key={key} variant={R} from={i % 2 ? 'right' : 'left'} style={{ ...card, background: p.bg, padding: ticket ? '0 0 30px' : card.padding, overflow: 'hidden', outline: ticket ? undefined : `1px solid ${p.secondary}44`, outlineOffset: -9 }}>
                    {ticket && (
                      <div style={{ background: p.primary, color: p.onPrimary, padding: '12px 0', marginBottom: 26, fontFamily: label, fontSize: 12, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', borderBottom: `2px dashed ${p.bg}` }}>
                        {String(i + 1).padStart(2, '0')} · {key === 'akad' ? 'Akad' : 'Resepsi'}
                      </div>
                    )}
                    <div style={{ padding: ticket ? '0 22px' : 0 }}>{content}</div>
                  </Reveal>
                );
              })}
            </div>
            {data.liveStreamUrl && (
              <Reveal variant={R} style={{ ...card, background: p.bg, marginTop: 22, padding: '26px 22px' }}>
                <p style={{ ...eyebrow, color: p.primary }}>Siaran langsung</p>
                <p style={{ ...mutedSt, margin: '10px auto 16px', maxWidth: 300 }}>Bagi keluarga dan sahabat yang berhalangan hadir, saksikan momen kami secara virtual.</p>
                <a className="kit-press" href={data.liveStreamUrl} target="_blank" rel="noreferrer" style={btn}>
                  <IcBroadcast size={16} /> {data.liveStreamLabel || 'Tonton siaran langsung'}
                </a>
              </Reveal>
            )}
          </div>
        </section>
      ) : null,

    story: () =>
      data.showLoveStories !== false && data.loveStories?.length ? (
        <section key="story" style={section('story', 5)}>
          {Orn(13, true)}
          <div style={inner}>
            {Title(c.storyTitle || 'Kisah Kami', 'Perjalanan cinta')}
            <div style={{ position: 'relative', textAlign: 'left', paddingLeft: 30 }}>
              <span aria-hidden style={{ position: 'absolute', left: 7, top: 10, bottom: 10, width: 1, background: `${p.secondary}` }} />
              {data.loveStories.map((s, i) => (
                <Reveal key={s.id || i} variant={R} from="right" delay={i * 0.05} style={{ position: 'relative', marginBottom: i === data.loveStories.length - 1 ? 0 : 34 }}>
                  <span aria-hidden style={{ position: 'absolute', left: -30, top: 4, width: 15, height: 15, borderRadius: 999, background: p.bg, border: `2px solid ${p.primary}`, boxShadow: `0 0 0 4px ${p.bg}` }} />
                  <span style={{ display: 'inline-block', fontFamily: label, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.16em', color: p.onPrimary, background: p.primary, borderRadius: 999, padding: '4px 10px' }}>{s.year}</span>
                  {s.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img(s.imageUrl)} alt="" loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: Math.min(radius, 14), margin: '14px 0 0' }} />
                  )}
                  <h3 style={{ fontFamily: display, fontSize: 21, fontWeight: 500, color: p.text, margin: '12px 0 6px', lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={mutedSt}>{s.story}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null,

    gallery: () => {
      if (!photos.length) return null;
      const g = spec.gallery;
      const tile = (src: string, i: number, st: React.CSSProperties) => (
        <button key={i} type="button" className="kit-press" aria-label={`Buka foto ${i + 1}`} onClick={() => openLightbox(photos, i)} style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: p.surface, cursor: 'zoom-in', borderRadius: Math.min(radius, 12), overflow: 'hidden', ...st }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Galeri ${i + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </button>
      );
      return (
        <section key="gallery" style={{ ...section('gallery', 6), paddingLeft: g === 'film' ? 0 : 18, paddingRight: g === 'film' ? 0 : 18 }}>
          <div style={{ ...inner, maxWidth: g === 'film' ? 'none' : 440 }}>
            {Title(c.galleryTitle || 'Galeri', 'Momen kami')}
            {g === 'film' ? (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '4px 28px 10px', scrollbarWidth: 'none' }}>
                {photos.map((src, i) => tile(src, i, { flex: '0 0 72%', aspectRatio: '3 / 4', scrollSnapAlign: 'center' }))}
              </div>
            ) : g === 'masonry' ? (
              <div style={{ columnCount: 2, columnGap: 8 }}>
                {photos.map((src, i) => (
                  <Reveal key={i} variant={R} delay={(i % 4) * 0.05} style={{ breakInside: 'avoid', marginBottom: 8 }}>
                    {tile(src, i, { aspectRatio: i % 3 === 0 ? '3 / 4' : '4 / 5' })}
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal variant={R} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {photos.map((src, i) => tile(src, i, i === 0 ? { gridColumn: '1 / -1', aspectRatio: '4 / 3' } : { aspectRatio: '1 / 1' }))}
              </Reveal>
            )}
          </div>
        </section>
      );
    },

    gift: () =>
      data.gifts?.length ? (
        <section key="gift" style={section('gift', 7)}>
          {Orn(17, true)}
          <div style={inner}>
            {Title(c.giftTitle || 'Amplop Digital', 'Tanda kasih')}
            <Reveal variant={R}>
              <p style={{ ...mutedSt, maxWidth: 330, margin: '-8px auto 30px' }}>{c.giftIntro || 'Doa restu Anda adalah karunia terindah bagi kami. Bila ingin memberi tanda kasih, dapat melalui:'}</p>
            </Reveal>
            <div style={{ display: 'grid', gap: 18 }}>
              {data.gifts.map((g, i) => {
                const id = g.id || String(i);
                const done = copied === id;
                if (g.type === 'address') {
                  return (
                    <Reveal key={id} variant={R} delay={i * 0.06} style={{ ...card, background: p.bg, padding: '26px 22px' }}>
                      <p style={{ ...eyebrow, color: p.primary }}>{g.name || 'Kirim kado'}</p>
                      <p style={{ ...bodySt, margin: '12px 0 4px' }}>{g.accountNumber}</p>
                      {g.accountHolder && <p style={{ ...mutedSt, fontSize: 13 }}>{/^penerima/i.test(g.accountHolder) ? g.accountHolder : `Penerima: ${g.accountHolder}`}</p>}
                      <button type="button" className="kit-press" onClick={() => copy(id, g.accountNumber)} style={{ ...btnGhost, marginTop: 16 }}>
                        {done ? <IcCheck size={16} /> : <IcCopy size={16} />} {done ? 'Alamat tersalin' : 'Salin alamat'}
                      </button>
                    </Reveal>
                  );
                }
                return (
                  <Reveal key={id} variant={R} delay={i * 0.06}>
                    <div
                      style={{
                        position: 'relative',
                        aspectRatio: '1.62',
                        borderRadius: 16,
                        padding: '20px 22px',
                        textAlign: 'left',
                        color: p.onPrimary,
                        background: `radial-gradient(120% 140% at 100% 0%, ${p.secondary}66 0%, transparent 55%), ${p.primary}`,
                        boxShadow: '0 26px 40px -26px rgba(0,0,0,.6)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span aria-hidden style={{ position: 'absolute', right: -40, bottom: -60, width: 200, height: 200, borderRadius: 999, border: `1px solid ${p.onPrimary}22` }} />
                      <span aria-hidden style={{ position: 'absolute', right: 10, bottom: -90, width: 200, height: 200, borderRadius: 999, border: `1px solid ${p.onPrimary}1A` }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: label, fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{g.name}</span>
                        <span style={{ fontFamily: label, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.8 }}>{g.type === 'e-wallet' ? 'E-wallet' : 'Rekening'}</span>
                      </div>
                      <svg aria-hidden width="40" height="30" viewBox="0 0 40 30" style={{ opacity: 0.9 }}>
                        <rect x="0.5" y="0.5" width="39" height="29" rx="5" fill="none" stroke="currentColor" strokeOpacity=".7" />
                        <path d="M0 10h13v10H0M40 10H27v10h13M13 0v30M27 0v30" stroke="currentColor" strokeOpacity=".5" fill="none" />
                      </svg>
                      <div>
                        <p style={{ fontFamily: "'Courier New', ui-monospace, monospace", fontSize: 21, fontWeight: 700, letterSpacing: '0.12em', margin: 0 }}>{g.accountNumber}</p>
                        <p style={{ fontFamily: body, fontSize: 13, margin: '6px 0 0', opacity: 0.9 }}>a.n. {g.accountHolder}</p>
                      </div>
                    </div>
                    <button type="button" className="kit-press" onClick={() => copy(id, g.accountNumber)} style={{ ...btnGhost, marginTop: 12 }}>
                      {done ? <IcCheck size={16} /> : <IcCopy size={16} />} {done ? 'Nomor tersalin' : 'Salin nomor'}
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null,

    rsvp: () => {
      const input: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: body,
        fontSize: 15,
        color: p.text,
        background: p.bg,
        border: `1px solid ${p.secondary}AA`,
        borderRadius: Math.min(radius, 12),
        padding: '12px 14px',
        marginTop: 8,
      };
      const lab: React.CSSProperties = { fontFamily: label, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.muted, display: 'block' };
      return (
        <section key="rsvp" style={section('rsvp', 8)}>
          {Orn(21)}
          <div style={inner}>
            {Title(c.rsvpTitle || 'Konfirmasi Kehadiran', 'RSVP')}
            <Reveal variant={R}>
              <p style={{ ...mutedSt, maxWidth: 330, margin: '-8px auto 26px' }}>Mohon kabarkan kehadiran Anda agar kami dapat menyambut dengan sebaik-baiknya.</p>
            </Reveal>
            <Reveal variant={R} style={{ ...card, textAlign: 'left', padding: '26px 22px' }}>
              <form onSubmit={rsvp.submit} noValidate style={{ display: 'grid', gap: 18 }}>
                <label style={lab}>
                  Nama
                  <input className="kit-field" value={rsvp.name} onChange={(e) => rsvp.setName(e.target.value)} maxLength={80} placeholder="Nama Anda" style={input} />
                </label>
                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend style={lab}>Kehadiran</legend>
                  <div role="radiogroup" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
                    {(['Hadir', 'Tidak Hadir', 'Ragu-ragu'] as RSVP['status'][]).map((s) => {
                      const on = rsvp.status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          className="kit-press"
                          onClick={() => rsvp.setStatus(s)}
                          style={{ ...input, marginTop: 0, minHeight: 44, cursor: 'pointer', padding: '8px 4px', fontSize: 13, fontWeight: 600, textAlign: 'center', background: on ? p.primary : p.bg, color: on ? p.onPrimary : p.text, borderColor: on ? p.primary : `${p.secondary}AA` }}
                        >
                          {s === 'Ragu-ragu' ? 'Masih ragu' : s}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                {rsvp.status === 'Hadir' && (
                  <label style={lab}>
                    Jumlah tamu
                    <select className="kit-field" value={rsvp.pax} onChange={(e) => rsvp.setPax(Number(e.target.value))} style={input}>
                      {Array.from({ length: Math.max(1, guest?.paxLimit || 4) }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} orang
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label style={lab}>
                  Ucapan & doa
                  <textarea className="kit-field" value={rsvp.wish} onChange={(e) => rsvp.setWish(e.target.value)} maxLength={1000} rows={4} placeholder="Tulis ucapan untuk kedua mempelai" style={{ ...input, resize: 'vertical' }} />
                </label>
                {rsvp.error && (
                  <p role="alert" style={{ fontFamily: body, fontSize: 13.5, color: '#B42318', margin: 0 }}>
                    {rsvp.error}
                  </p>
                )}
                <button type="submit" className="kit-press" style={{ ...btn, width: '100%', minHeight: 48 }}>
                  {rsvp.sent ? <IcCheck size={16} /> : null}
                  {rsvp.sent ? 'Terkirim. Terima kasih atas doanya' : 'Kirim konfirmasi'}
                </button>
              </form>
            </Reveal>
          </div>
        </section>
      );
    },

    wishes: () => {
      const list = (rsvps || []).filter((r) => r.wishes).slice(0, 80);
      const count = (s: RSVP['status']) => (rsvps || []).filter((r) => r.status === s).length;
      return (
        <section key="wishes" style={{ ...section('wishes', 9), paddingTop: 24 }}>
          <div style={inner}>
            {Title(c.wishesTitle || 'Ucapan & Doa')}
            <Reveal variant={R} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              {(
                [
                  ['Hadir', count('Hadir')],
                  ['Tidak hadir', count('Tidak Hadir')],
                  ['Masih ragu', count('Ragu-ragu')],
                ] as [string, number][]
              ).map(([l, n]) => (
                <div key={l} style={{ padding: '12px 4px', borderRadius: Math.min(radius, 12), border: `1px solid ${p.secondary}66`, background: p.surface }}>
                  <div style={{ fontFamily: body, fontSize: 22, fontWeight: 600, color: p.primary, lineHeight: 1.1, fontVariantNumeric: 'lining-nums tabular-nums' }}>{n}</div>
                  <div style={{ fontFamily: label, fontSize: 11, letterSpacing: '0.08em', color: p.muted, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </Reveal>
            {!list.length ? (
              <Reveal variant={R} style={{ ...card, padding: '28px 22px' }}>
                <p style={{ ...mutedSt, margin: 0 }}>Belum ada ucapan. Jadilah yang pertama mendoakan kedua mempelai.</p>
              </Reveal>
            ) : (
              <Reveal variant={R} style={{ ...card, padding: 6, textAlign: 'left', maxHeight: 440, overflowY: 'auto' }}>
                {list.map((r, i) => (
                  <div key={r.id} style={{ display: 'flex', gap: 12, padding: '14px 12px', borderTop: i ? `1px solid ${p.secondary}33` : 'none' }}>
                    <span aria-hidden style={{ flex: '0 0 36px', height: 36, borderRadius: 999, background: `${p.primary}1F`, color: p.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: label, fontWeight: 700, fontSize: 14 }}>
                      {(r.guestName || '?').trim().charAt(0).toUpperCase()}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: p.text, margin: 0 }}>
                        {r.guestName}
                        <span style={{ fontWeight: 500, fontSize: 11.5, color: p.primary, marginLeft: 8, padding: '2px 8px', borderRadius: 999, background: `${p.primary}14` }}>{r.status === 'Ragu-ragu' ? 'Masih ragu' : r.status}</span>
                      </p>
                      <p style={{ fontFamily: body, fontSize: 14, lineHeight: 1.65, color: p.text, opacity: 0.85, margin: '6px 0 0', overflowWrap: 'anywhere' }}>{r.wishes}</p>
                      <p style={{ fontFamily: body, fontSize: 12, color: p.muted, margin: '6px 0 0' }}>{relTime(r.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        </section>
      );
    },

    closing: () =>
      photoBand(
        photos[photos.length - 1] || heroPhoto,
        <>
          <Reveal variant={R}>
            <h2 style={{ ...titleSt, color: '#fff', fontSize: hasScript ? 54 : 38 }}>{c.closingTitle || 'Terima Kasih'}</h2>
            <p style={{ ...bodySt, color: 'rgba(255,255,255,.92)', maxWidth: 340, margin: '18px auto 0' }}>
              {c.closingText || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.'}
            </p>
          </Reveal>
          <Reveal variant={R} delay={0.1} style={{ marginTop: 40 }}>
            <p style={{ fontFamily: label, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0, opacity: 0.85 }}>Kami yang berbahagia</p>
            <p style={{ fontFamily: script, fontSize: hasScript ? 52 : 34, lineHeight: 1.1, margin: '14px 0 18px' }}>
              {groom.nickname} &amp; {bride.nickname}
            </p>
            <p style={{ fontFamily: body, fontSize: 13.5, lineHeight: 1.7, margin: 0, opacity: 0.9 }}>
              Keluarga Besar {parents(groom) || groom.fullName}
              <br />
              &amp;
              <br />
              Keluarga Besar {parents(bride) || bride.fullName}
            </p>
          </Reveal>
        </>,
        'closing',
        '100vh'
      ),
  };
}
