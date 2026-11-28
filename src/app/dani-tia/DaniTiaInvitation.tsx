'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import s from './dani-tia.module.css';
import {
  ADDRESS,
  COUNTDOWN_ISO,
  COUPLE,
  DATE_DOTS,
  DATE_LONG,
  EVENTS,
  GIFTS,
  MAPS_URL,
  MUSIC_URL,
  PHOTOS,
  TEXT,
  calendarUrl,
  img,
  srcSet,
  type Photo,
} from './data';
import { useCountdown, useMediaQuery, usePointerTilt, useReducedMotion, useReveal, useScrollScene } from './motion';
import Wishes from './Wishes';
import Lightbox from './Lightbox';
import Simpingan from './Simpingan';
import CoupleScene from './CoupleScene';

type Phase = 'cover' | 'opening' | 'open';

/** Foto dengan srcset; `sizes` default mengikuti kolom undangan. */
function Img({ p, className, sizes = '(min-width: 1024px) 460px, 100vw', eager, style }: { p: Photo; className?: string; sizes?: string; eager?: boolean; style?: React.CSSProperties }) {
  return (
    <img
      className={className}
      src={img(p, 0)}
      srcSet={srcSet(p)}
      sizes={sizes}
      alt={p.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{ objectPosition: p.focus || '50% 50%', ...style }}
    />
  );
}

/** Plate foto berparalaks. mode: drift | zoom-in | zoom-out | rise */
function Plate({ p, mode = 'drift', amp = 1, ratio, fade, className, children }: { p: Photo; mode?: string; amp?: number; ratio?: string; fade?: boolean; className?: string; children?: React.ReactNode }) {
  return (
    <figure className={`${s.plate} ${className || ''}`} style={{ aspectRatio: ratio }} data-px={mode} data-amp={amp} {...(fade ? { 'data-fade': '' } : {})}>
      <div className={s.plateInner} data-px-t>
        <div className={s.plateZoom} data-rv="photo">
          <Img p={p} />
        </div>
      </div>
      {children}
    </figure>
  );
}

/** Bara lampu blencong yang naik pelan — angka acak berbenih agar SSR = klien. */
function Sparks({ n, warm }: { n: number; warm?: boolean }) {
  let seed = n * 97 + (warm ? 13 : 0);
  const r = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return (
    <span className={`${s.sparks} ${warm ? s.sparksWarm : ''}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: `${(r() * 100).toFixed(1)}%`,
              '--sz': `${(1.5 + r() * 2.5).toFixed(1)}px`,
              '--dur': `${(7 + r() * 8).toFixed(1)}s`,
              '--del': `${(-r() * 14).toFixed(1)}s`,
              '--dx': `${((r() - 0.5) * 60).toFixed(0)}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

/** Pita batik kawung sebagai pembatas bagian. */
function Batik() {
  return <div className={s.batik} aria-hidden />;
}

function Gunungan({ className }: { className?: string }) {
  return <span aria-hidden className={`${s.kayon} ${className || ''}`} />;
}

function Monogram({ light }: { light?: boolean }) {
  return (
    <span className={`${s.mono} ${light ? s.monoLight : ''}`} aria-label="Monogram T dan D">
      <span>{COUPLE.monogram[0]}</span>
      <i aria-hidden />
      <span>{COUPLE.monogram[1]}</span>
    </span>
  );
}

function Digit({ v, label }: { v: number; label: string }) {
  const str = String(v).padStart(2, '0');
  return (
    <div className={s.cdCell}>
      <span className={s.cdNum} aria-hidden>
        {str.split('').map((c, i) => (
          <span key={`${i}-${c}`} className={s.cdDigit}>
            {c}
          </span>
        ))}
      </span>
      <span className={s.cdLabel}>{label}</span>
    </div>
  );
}

function Countdown() {
  const t = useCountdown(COUNTDOWN_ISO);
  if (!t) return <div className={s.cd} aria-hidden style={{ visibility: 'hidden' }} />;
  if (t.done) return <p className={s.cdDone}>Hari yang dinanti telah tiba.</p>;
  return (
    <div className={s.cd} role="timer" aria-label={`${t.d} hari ${t.h} jam ${t.m} menit lagi`}>
      <Digit v={t.d} label="Hari" />
      <Digit v={t.h} label="Jam" />
      <Digit v={t.m} label="Menit" />
      <Digit v={t.s} label="Detik" />
    </div>
  );
}

function CalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

export default function DaniTiaInvitation({ guest }: { guest: string }) {
  const [phase, setPhase] = useState<Phase>('cover');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [playing, setPlaying] = useState(false);
  const [stagePhoto, setStagePhoto] = useState('cover');
  const reduced = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const coverPhotoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [motionReady, setMotionReady] = useState(false);

  const isOpen = phase === 'open';
  useReveal(contentRef, phase !== 'cover');
  useScrollScene(contentRef, isOpen);
  usePointerTilt(coverPhotoRef, phase === 'cover');

  useEffect(() => setMotionReady(true), []);

  // kunci gulir selama sampul tampil
  useEffect(() => {
    const html = document.documentElement;
    if (phase === 'cover') {
      const prev = html.style.overflow;
      html.style.overflow = 'hidden';
      return () => {
        html.style.overflow = prev;
      };
    }
  }, [phase]);

  // foto panggung kiri (desktop) mengikuti seksi yang sedang dibaca
  useEffect(() => {
    if (!desktop || !isOpen) return;
    const secs = Array.from(contentRef.current?.querySelectorAll<HTMLElement>('[data-stage]') || []);
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setStagePhoto((e.target as HTMLElement).dataset.stage || 'cover');
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    secs.forEach((x) => io.observe(x));
    return () => io.disconnect();
  }, [desktop, isOpen]);

  const open = useCallback(() => {
    if (phase !== 'cover') return;
    window.scrollTo(0, 0);
    if (MUSIC_URL) {
      const a = audioRef.current || new Audio(MUSIC_URL);
      audioRef.current = a;
      a.loop = true;
      a.volume = 0.7;
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    if (reduced) {
      setPhase('open');
      return;
    }
    setPhase('opening');
    // gunungan menutup layar pada ~40% animasi; sampul diganti isi di balik gunungan
    window.setTimeout(() => setPhase('open'), 1900);
  }, [phase, reduced]);

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      a.pause();
      setPlaying(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    window.setTimeout(() => setCopied('idle'), 2600);
  };

  const stageList: { id: string; p: Photo }[] = [
    { id: 'cover', p: PHOTOS.cover },
    { id: 'hands', p: PHOTOS.hands },
    { id: 'couple', p: PHOTOS.walk },
    { id: 'ride', p: PHOTOS.ride },
    { id: 'helmet', p: PHOTOS.helmet },
    { id: 'gallery', p: PHOTOS.wide },
    { id: 'duo', p: PHOTOS.duo },
    { id: 'field', p: PHOTOS.field },
  ];

  return (
    <div ref={rootRef} className={`${s.root} ${motionReady ? s.motion : ''}`} data-phase={phase}>
      {/* ---------------------------------------------------------------- panggung kiri (desktop) */}
      {desktop && (
        <aside className={s.stage} aria-hidden>
          {stageList.map(({ id, p }) => (
            <div key={id} className={`${s.stageImg} ${stagePhoto === id ? s.stageOn : ''}`}>
              <Img p={p} sizes="60vw" eager={id === 'cover'} />
            </div>
          ))}
          <div className={s.stageShade} />
          <div className={s.stageText}>
            <Monogram light />
            <p className={s.stageNames}>
              Tia <em>&amp;</em> Dhany
            </p>
            <p className={s.stageDate}>{DATE_DOTS}</p>
          </div>
        </aside>
      )}

      {/* ---------------------------------------------------------------- sampul */}
      {phase !== 'open' && (
        <section className={s.cover} aria-label="Sampul undangan" data-leaving={phase === 'opening' ? '' : undefined}>
          <div className={s.coverPhoto} ref={coverPhotoRef}>
            <picture>
              <source media="(min-width: 900px) and (orientation: landscape)" srcSet="/assets/dani-tia/g-m1-1400.webp" />
              <img src={img(PHOTOS.cover, 0)} srcSet={srcSet(PHOTOS.cover)} sizes="100vw" alt={PHOTOS.cover.alt} className={s.coverImg} fetchPriority="high" style={{ objectPosition: PHOTOS.cover.focus }} />
            </picture>
          </div>
          <div className={s.coverShade} />
          <div className={s.coverTop}>
            <span className={s.coverIn} style={{ '--d': '100ms' } as React.CSSProperties}>
              <Monogram light />
            </span>
            <p className={`${s.coverKicker} ${s.coverIn}`} style={{ '--d': '260ms' } as React.CSSProperties}>
              The Wedding of
            </p>
            <h1 className={s.coverNames}>
              <span className={s.coverIn} style={{ '--d': '420ms' } as React.CSSProperties}>
                Tia
              </span>
              <span className={`${s.coverWith} ${s.coverIn}`} style={{ '--d': '600ms' } as React.CSSProperties}>
                with
              </span>
              <span className={s.coverIn} style={{ '--d': '760ms' } as React.CSSProperties}>
                Dhany
              </span>
            </h1>
            <p className={`${s.coverDate} ${s.coverIn}`} style={{ '--d': '920ms' } as React.CSSProperties}>
              {DATE_DOTS}
            </p>
          </div>
          <div className={`${s.coverBottom} ${s.coverIn}`} style={{ '--d': '1100ms' } as React.CSSProperties}>
            <p className={s.coverTo}>{TEXT.kepada}</p>
            {guest && <p className={s.coverGuest}>{guest}</p>}
            <button type="button" className={s.openBtn} onClick={open} disabled={phase !== 'cover'}>
              Buka Undangan
            </button>
            <p className={s.coverNote}>{TEXT.maafNama}</p>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- transisi: gunungan dikebyokkan dalang */}
      {phase === 'opening' && (
        <div className={s.curtain} aria-hidden>
          <div className={s.curtainSweep}>
            <span className={s.blencong} />
            <Gunungan className={s.kayonBig} />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- isi undangan */}
      <main ref={contentRef} className={s.col} aria-hidden={phase === 'cover' ? true : undefined} inert={phase === 'cover' ? true : undefined}>
        {/* pembuka — kelir gelap, gunungan bercahaya di balik ayat */}
        <section className={`${s.sec} ${s.kelir} ${s.secOpen}`} data-stage="cover" id="pembuka">
          <Sparks n={16} />
          <div className={s.kelirKayon} aria-hidden>
            <span className={s.kelirLamp} />
            <Gunungan className={s.kayonGlow} />
          </div>
          <Monogram light />
          <p className={`${s.salam} ${s.onDark}`} data-rv="up">
            {TEXT.salam}
          </p>
          <blockquote className={`${s.verse} ${s.verseDark}`} data-rv="up" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p>{TEXT.arRuum}</p>
            <cite>{TEXT.arRuumSrc}</cite>
          </blockquote>
        </section>
        <Batik />

        {/* mempelai — dua belahan dipertemukan oleh gulir */}
        <CoupleScene active={phase !== 'cover'} lede={TEXT.pembuka} />

        {/* an-nuur — kartu ayat menumpuk di atas foto genggaman */}
        <section className={`${s.sec} ${s.secNuur}`} data-stage="hands">
          <Plate p={PHOTOS.hands} mode="zoom-top" ratio="5 / 4" className={`${s.plateHands} ${s.plateTop}`} />
          <blockquote className={`${s.verse} ${s.verseCard}`} data-rv="tilt">
            <span className={s.cardKawung} aria-hidden />
            <p>{TEXT.anNuur}</p>
            <cite>{TEXT.anNuurSrc}</cite>
          </blockquote>
        </section>

        {/* save the date */}
        <section className={`${s.sec} ${s.secDate}`} data-stage="ride" id="tanggal">
          <Plate p={PHOTOS.ride} mode="zoom-in" amp={1} className={s.plateBg} />
          <Sparks n={10} warm />
          <div className={s.dateInner}>
            <p className={s.dateLead} data-rv="up">
              {TEXT.dilaksanakan}
            </p>
            <p className={s.dateBig} data-rv="tilt">
              {DATE_DOTS}
            </p>
            <p className={s.dateLong} data-rv="up">
              {DATE_LONG}
            </p>
            <div data-rv="up">
              <Countdown />
            </div>
            <a className={`${s.btn} ${s.btnLight}`} href={calendarUrl(EVENTS[0])} target="_blank" rel="noopener noreferrer" data-rv="up">
              <CalIcon /> Simpan Tanggal
            </a>
          </div>
        </section>

        {/* acara — linimasa satu hari */}
        <section className={`${s.sec} ${s.secEvents}`} data-stage="couple" id="acara">
          <div className={s.eventsHead}>
            <h2 className={s.secTitle} data-rv="up">
              Rangkaian Acara
            </h2>
            <p className={s.eventsDay} data-rv="up">
              {DATE_LONG}
            </p>
          </div>
          <ol className={s.timeline}>
            {EVENTS.map((e, i) => (
              <li key={e.id} className={s.tlItem} data-rv={i === 0 ? 'left' : 'right'} style={{ '--d': `${i * 140}ms` } as React.CSSProperties}>
                <span className={s.tlNode} aria-hidden>
                  <Gunungan className={s.tlKayon} />
                </span>
                <p className={s.tlTime}>{e.time.replace(' – Selesai', '')}</p>
                <article className={s.event}>
                  <h3 className={s.eventName}>{e.name}</h3>
                  <p className={s.eventTime}>Pukul {e.time}</p>
                  <p className={s.eventPlace}>{ADDRESS}</p>
                  <a className={s.linkBtn} href={calendarUrl(e)} target="_blank" rel="noopener noreferrer">
                    <CalIcon /> Simpan ke Google Calendar
                  </a>
                </article>
              </li>
            ))}
          </ol>
          <Plate p={PHOTOS.walk} mode="drift" ratio="4 / 5" className={s.plateWalk}>
            <figcaption className={s.plateCap}>Akad dan resepsi di hari dan alamat yang sama.</figcaption>
          </Plate>
        </section>

        {/* lokasi — kartu menumpuk di atas foto */}
        <section className={`${s.sec} ${s.secMap}`} data-stage="helmet" id="lokasi">
          <Plate p={PHOTOS.helmet} mode="zoom-out" ratio="4 / 3" fade />
          <div className={s.mapCard} data-rv="up">
            <Gunungan className={s.mapKayon} />
            <h2 className={s.secTitle}>Lokasi</h2>
            <p className={s.address}>{ADDRESS}</p>
            <div className={s.actions}>
              {/* PLACEHOLDER: MAPS_URL masih pencarian alamat — ganti dengan pin asli dari QR undangan */}
              <a className={s.btn} href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                <PinIcon /> Buka Google Maps
              </a>
              <button type="button" className={s.linkBtn} onClick={copyAddress}>
                {copied === 'ok' ? 'Alamat tersalin' : copied === 'fail' ? 'Gagal menyalin — tekan lama alamat di atas' : 'Salin alamat'}
              </button>
            </div>
          </div>
        </section>
        <Batik />

        {/* galeri — simpingan 3D di atas kelir */}
        <section className={`${s.sec} ${s.kelir} ${s.secGallery}`} data-stage="gallery" id="galeri">
          <Sparks n={12} />
          <h2 className={`${s.secTitle} ${s.onDark}`} data-rv="up">
            Galeri
          </h2>
          <div data-rv="zoom">
            <Simpingan onOpen={(i) => setLightbox(i)} />
          </div>
        </section>

        {/* rsvp & ucapan */}
        <section className={`${s.sec} ${s.secRsvp}`} data-stage="duo" id="rsvp">
          <Plate p={PHOTOS.duo} mode="drift" ratio="16 / 10" />
          <div className={s.rsvpCard}>
            <h2 className={s.secTitle} data-rv="up">
              Konfirmasi Kehadiran
            </h2>
            <p className={s.secLead} data-rv="up">
              Mohon kabari kami kehadiran Anda, dan titipkan doa untuk kedua mempelai.
            </p>
            <Wishes guest={guest} />
          </div>
        </section>

        {/* amplop digital — hanya tampil bila ada data rekening */}
        {GIFTS.length > 0 && (
          <section className={s.sec} id="amplop">
            <h2 className={s.secTitle}>Amplop Digital</h2>
            {GIFTS.map((g) => (
              <div key={g.number} className={s.event}>
                <h3 className={s.eventName}>{g.bank}</h3>
                <p className={s.eventTime}>{g.number}</p>
                <p className={s.eventPlace}>a.n. {g.holder}</p>
              </div>
            ))}
          </section>
        )}

        {/* penutup */}
        <section className={`${s.secClose}`} data-stage="field" id="penutup">
          <Plate p={PHOTOS.field} mode="rise" ratio="3 / 4" className={s.plateClose}>
            <figcaption className={s.closeOver}>
              <p data-rv="up">{TEXT.kehormatan}</p>
            </figcaption>
          </Plate>
          <div className={s.closeBody}>
            <p className={s.salam} data-rv="up">
              {TEXT.penutup}
            </p>
            <div className={s.tancep} data-rv="tancep">
              <Gunungan className={s.kayonClose} />
            </div>
            <p className={s.berbahagia} data-rv="up">
              {TEXT.berbahagia}
            </p>
            <ul className={s.families} data-rv="up">
              {TEXT.keluarga.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
            <div className={s.closeMono} data-rv="zoom">
              <Monogram />
            </div>
            <footer className={s.foot}>
              <p>Foto prewedding oleh @rfx.visual</p>
              <p>
                Undangan digital oleh <a href="https://www.ruanghadir.net">RuangHadir</a>
              </p>
            </footer>
          </div>
        </section>
      </main>

      {MUSIC_URL && isOpen && (
        <button type="button" className={`${s.music} ${playing ? s.musicOn : ''}`} onClick={toggleMusic} aria-label={playing ? 'Jeda musik' : 'Putar musik'}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M9 18V6l10-2v12" />
            <circle cx="6.5" cy="18" r="2.5" />
            <circle cx="16.5" cy="16" r="2.5" />
          </svg>
        </button>
      )}

      {lightbox !== null && <Lightbox index={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
