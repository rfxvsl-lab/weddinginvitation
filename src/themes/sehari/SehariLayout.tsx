'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Guest, RSVP, WeddingData, EventDetails } from '../../types';
import { convertGoogleDriveUrl } from '../../utils/googleDrive';
import s from './sehari.module.css';

interface Props {
  data: WeddingData; guest?: Guest; embedded?: boolean;
  rsvps: RSVP[]; onAddRSVP: (rsvp: RSVP) => void | Promise<void>;
  extras?: React.ReactNode;
}
const date = (value: string) => {
  const d = new Date(`${value.slice(0, 10)}T12:00:00+07:00`);
  return Number.isNaN(+d) ? '' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
};
const web = (value?: string) => {
  try { const u = new URL(value || ''); return ['https:', 'http:'].includes(u.protocol) ? u.href : undefined; } catch { return undefined; }
};
function Photo({ url, alt, ...props }: { url?: string; alt: string; className?: string; loading?: 'lazy' | 'eager' }) {
  const src = web(convertGoogleDriveUrl(url || ''));
  const [failed, fail] = useState(false);
  useEffect(() => fail(false), [src]);
  return src && !failed ? <img {...props} src={src} alt={alt} onError={() => fail(true)} /> : <div className={`${s.placeholder} ${props.className || ''}`} role="img" aria-label={alt}>Sebuah cerita tentang kita.</div>;
}
function Countdown({ until }: { until: string }) {
  const [diff, setDiff] = useState<number | null>(null);
  useEffect(() => { const tick = () => setDiff(Math.max(0, +new Date(until) - Date.now()) || 0); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, [until]);
  const values = diff === null ? ['—', '—', '—', '—'] : [Math.floor(diff / 864e5), Math.floor(diff / 36e5) % 24, Math.floor(diff / 6e4) % 60, Math.floor(diff / 1000) % 60];
  return <div className={s.countdown} aria-label={diff === 0 ? 'Hari bahagia telah tiba' : 'Menuju hari bahagia'}>{values.map((v, i) => <div key={i}><strong>{v}</strong><span>{['Hari', 'Jam', 'Menit', 'Detik'][i]}</span></div>)}</div>;
}
function calendar(ev: EventDetails, couple: string) {
  const compact = (v: string) => v.replaceAll('-', '');
  const day = compact(ev.date.slice(0, 10));
  if (!/^\d{8}$/.test(day) || Number.isNaN(+new Date(`${ev.date.slice(0, 10)}T12:00:00Z`))) return undefined;
  const params = new URLSearchParams({ action: 'TEMPLATE', text: `${ev.name} — ${couple}`, dates: `${day}/${compact(new Date(new Date(`${ev.date.slice(0, 10)}T12:00:00Z`).getTime() + 864e5).toISOString().slice(0, 10))}`, details: `${ev.timeStart}–${ev.timeEnd} WIB`, location: `${ev.venueName}, ${ev.address}`, ctz: 'Asia/Jakarta' });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** One independent composition; the existing kit and existing themes are untouched. */
export default function SehariLayout({ data, guest, embedded = false, rsvps, onAddRSVP, extras }: Props) {
  const [opened, setOpened] = useState(embedded);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const hero = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [photo, setPhoto] = useState(0);
  const [name, setName] = useState(guest?.name || '');
  const [status, setStatus] = useState<RSVP['status']>('Hadir');
  const [pax, setPax] = useState(1);
  const [wish, setWish] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const { groom, bride } = data.couple;
  const names = `${groom.nickname || groom.fullName} & ${bride.nickname || bride.fullName}`;
  const events = Object.values(data.events).filter(ev => ev.enabled !== false && (ev.date || ev.venueName));
  const photos = data.gallery.filter(u => web(convertGoogleDriveUrl(u)));
  const mainDate = events[0]?.date || data.countdownDate;
  const heroPhoto = data.bgImageUrl || photos[0] || groom.photoUrl;
  const limit = Math.max(1, guest?.paxLimit || 10);
  useEffect(() => { if (opened && !embedded) hero.current?.focus({ preventScroll: true }); }, [opened, embedded]);
  // srcdoc resolves plain #fragments against the parent URL. Keep section jumps
  // inside the document that owns the clicked link, including nested previews.
  function navigateSection(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const id = e.currentTarget.getAttribute('href')?.slice(1);
    if (id) e.currentTarget.ownerDocument.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  async function music() {
    if (!audio.current) return;
    if (playing) { audio.current.pause(); setPlaying(false); }
    else { try { await audio.current.play(); setPlaying(true); } catch { setPlaying(false); } }
  }
  async function open() { setOpened(true); if (data.musicUrl) { try { await audio.current?.play(); setPlaying(true); } catch { setPlaying(false); } } }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (busy) return;
    if (!name.trim() || !wish.trim()) { setMessage('Isi nama dan ucapan terlebih dahulu.'); return; }
    setBusy(true); setMessage('');
    try {
      await onAddRSVP({ id: `rsvp-${crypto.randomUUID()}`, guestId: guest?.id, guestName: name.trim(), status, paxCount: status === 'Hadir' ? Math.min(limit, Math.max(1, pax)) : 0, wishes: wish.trim(), timestamp: new Date().toISOString() });
      setMessage('Ucapan diteruskan ke halaman undangan.'); setWish('');
    } catch { setMessage('Ucapan belum berhasil diteruskan. Silakan coba lagi.'); }
    finally { setBusy(false); }
  }
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setCopyStatus('Nomor berhasil disalin.'); } catch { setCopyStatus('Belum bisa menyalin otomatis. Tekan dan tahan nomor untuk menyalinnya.'); } }
  return <div className={s.theme}>
    {data.musicUrl && <audio ref={audio} src={web(data.musicUrl)} loop preload="none" />}
    {!opened ? <section className={s.cover} aria-label="Sampul undangan">
      <Photo url={data.ogImageUrl || heroPhoto} alt={`Potret ${names}`} className={s.coverPhoto} loading="eager" />
      <div className={s.coverPaper}><p className={s.eyebrow}>Sebuah hari, sebuah awal</p><h1>{groom.nickname || groom.fullName}<em>&</em>{bride.nickname || bride.fullName}</h1><p>{date(mainDate)}</p><div className={s.guest}><small>Kepada yang terkasih</small><p>{guest?.name || 'Tamu Undangan'}</p></div><button data-kit-open onClick={open}>Buka undangan <span aria-hidden>↗</span></button></div>
    </section> : <>
      <nav className={s.nav} aria-label="Bagian undangan"><a href="#sehari-couple" onClick={navigateSection}>Mempelai</a><a href="#sehari-events" onClick={navigateSection}>Acara</a><a href="#sehari-rsvp" onClick={navigateSection}>Kehadiran</a></nav>
      <main>
        <section ref={hero} tabIndex={-1} className={s.hero} id="sehari-home"><div className={s.heroTitle}><p className={s.eyebrow}>Kami mengundangmu merayakan</p><h1>{groom.nickname || groom.fullName}<em>dan</em>{bride.nickname || bride.fullName}</h1><p>{date(mainDate)} <span aria-hidden>·</span> {events[0]?.venueName}</p></div><Photo url={heroPhoto} alt={`Kebersamaan ${names}`} className={s.heroPhoto} loading="eager" /><p className={s.caption}>Sehari untuk dirayakan. Selamanya untuk dijalani.</p></section>
        {data.quoteText && <section className={s.quote}><p className={s.eyebrow}>Tentang sebuah janji</p><blockquote>{data.quoteText}</blockquote>{data.quoteSource && <cite>{data.quoteSource}</cite>}</section>}
        <section className={s.section} id="sehari-couple"><p className={s.eyebrow}>01 / Dua nama, satu cerita</p><h2>Kita, mulai hari ini.</h2>{[groom, bride].map((person, i) => <article className={`${s.person} ${i ? s.personSecond : ''}`} key={i}><Photo url={person.photoUrl} alt={person.fullName} loading="lazy" /><div><span className={s.number}>0{i + 1}</span><h3>{person.fullName}</h3><p>{i ? 'Putri dari' : 'Putra dari'}<br />{person.fatherName}<br />& {person.motherName}</p>{person.about && <p className={s.about}>{person.about}</p>}{person.instagram && <a href={`https://www.instagram.com/${encodeURIComponent(person.instagram.replace(/^@/, ''))}/`} target="_blank" rel="noreferrer">{person.instagram} ↗</a>}</div></article>)}</section>
        <section className={s.dateSection} id="sehari-events"><p className={s.eyebrow}>02 / Lingkari tanggalnya</p><h2>Satu hari.<br /><em>Banyak bahagia.</em></h2><p>{date(mainDate)}</p><Countdown until={data.countdownDate} />{events.map((ev, i) => <article className={s.event} key={i}><span className={s.eyebrow}>0{i + 1}</span><h3>{ev.name}</h3><p>{date(ev.date)}<br />{ev.timeStart}{ev.timeEnd ? `–${ev.timeEnd}` : ''} WIB</p><h4>{ev.venueName}</h4><p>{ev.address}</p><div className={s.links}>{web(ev.googleMapsUrl) && <a href={web(ev.googleMapsUrl)} target="_blank" rel="noreferrer">Petunjuk arah ↗</a>}{calendar(ev, names) && <a href={calendar(ev, names)} target="_blank" rel="noreferrer">Simpan tanggal ↗</a>}</div></article>)}{web(data.liveStreamUrl) && <a className={s.liveLink} href={web(data.liveStreamUrl)} target="_blank" rel="noreferrer">{data.liveStreamLabel || 'Saksikan siaran langsung'} ↗</a>}</section>
        {data.showLoveStories !== false && data.loveStories.length > 0 && <section className={s.section}><p className={s.eyebrow}>03 / Sebelum hari ini</p><h2>Hal-hal kecil<br />yang membawa kita.</h2>{data.loveStories.map(story => <article className={s.story} key={story.id}><p className={s.year}>{story.year}</p>{story.imageUrl && <Photo url={story.imageUrl} alt={story.title} loading="lazy" />}<h3>{story.title}</h3><p>{story.story}</p></article>)}</section>}
        {photos.length > 0 && <section className={s.gallerySection}><div className={s.sectionHeading}><p className={s.eyebrow}>04 / Yang ingin kami ingat</p><h2>Sekilas kita.</h2></div><div className={s.gallery}>{photos.map((url, i) => <button key={`${url}-${i}`} type="button" aria-label={`Lihat foto ${i + 1}`} onClick={() => { setPhoto(i); dialog.current?.showModal(); }}><Photo url={url} alt={`Kenangan ${names}, foto ${i + 1}`} loading="lazy" /><span>0{i + 1}</span></button>)}</div></section>}
        {data.gifts.length > 0 && <section className={s.section}><p className={s.eyebrow}>05 / Sebentuk perhatian</p><h2>Tanda kasih.</h2><p>Kehadiran dan doamu sudah sangat berarti bagi kami.</p><details className={s.gifts}><summary>Lihat informasi tanda kasih</summary>{data.gifts.map(gift => <article key={gift.id}><h3>{gift.name}</h3><p className={s.account}>{gift.accountNumber}</p><p>{gift.accountHolder}</p>{gift.type !== 'address' && <button type="button" onClick={() => copy(gift.accountNumber)}>Salin nomor</button>}</article>)}<p role="status">{copyStatus}</p></details></section>}
        <section className={s.rsvp} id="sehari-rsvp"><p className={s.eyebrow}>06 / Sampai bertemu</p><h2>Ada tempat<br /><em>untukmu.</em></h2><p>Kabarkan kehadiranmu dan titipkan doa untuk hari baru kami.</p><form onSubmit={submit}><label>Nama<input value={name} onChange={e => setName(e.target.value)} required maxLength={160} autoComplete="name" /></label><label>Kehadiran<select value={status} onChange={e => setStatus(e.target.value as RSVP['status'])}><option>Hadir</option><option>Tidak Hadir</option><option>Ragu-ragu</option></select></label>{status === 'Hadir' && <label>Jumlah yang hadir<input type="number" min={1} max={limit} value={pax} onChange={e => setPax(Number(e.target.value))} required /></label>}<label>Doa & ucapan<textarea value={wish} onChange={e => setWish(e.target.value)} required maxLength={2000} rows={4} /></label><button disabled={busy} type="submit">{busy ? 'Meneruskan…' : 'Kirim ucapan'} <span aria-hidden>↗</span></button><p role="status">{message}</p></form>{rsvps.length > 0 && <div className={s.wishes}><h3>Doa yang menghangatkan.</h3>{rsvps.map(r => <article key={r.id}><strong>{r.guestName}</strong><p>{r.wishes}</p></article>)}</div>}</section>
        <section className={s.closing}><Photo url={photos[1] || heroPhoto} alt={`Salam bahagia dari ${names}`} loading="lazy" /><div><p className={s.eyebrow}>Terima kasih sudah menjadi bagian cerita kami</p><h2>Sehari,<br /><em>selamanya.</em></h2><p>{names}</p></div></section>
        <div className={s.extras}>{extras}</div><footer className={s.footer}>Undangan oleh RuangHadir</footer>
      </main>
      {data.musicUrl && <button className={s.music} type="button" onClick={music} aria-pressed={playing}>{playing ? 'Jeda musik' : 'Putar musik'}</button>}
      <dialog ref={dialog} className={s.lightbox} aria-label="Galeri foto" onKeyDown={e => { if (e.key === 'ArrowRight') setPhoto((photo + 1) % photos.length); if (e.key === 'ArrowLeft') setPhoto((photo - 1 + photos.length) % photos.length); }}><button type="button" onClick={() => dialog.current?.close()}>Tutup</button><Photo url={photos[photo]} alt={`Foto ${photo + 1} dari ${photos.length}`} /><div><button type="button" onClick={() => setPhoto((photo - 1 + photos.length) % photos.length)}>Sebelumnya</button><span>{photo + 1} / {photos.length}</span><button type="button" onClick={() => setPhoto((photo + 1) % photos.length)}>Berikutnya</button></div></dialog>
    </>}
  </div>;
}
