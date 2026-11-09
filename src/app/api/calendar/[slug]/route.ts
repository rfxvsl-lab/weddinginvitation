import { NextRequest } from 'next/server';
import { getInvitationBySlug } from '@/lib/api';

export const dynamic = 'force-dynamic';

function toIcsDate(dateStr: string, timeStr: string, fallbackHour = 9): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return null;
  const parts = (timeStr || '').split(':');
  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}${pad(m)}${pad(d)}T${pad(Number.isFinite(hh) ? hh : fallbackHour)}${pad(Number.isFinite(mm) ? mm : 0)}00`;
}

function escapeIcs(text: string) {
  return (text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inv = await getInvitationBySlug(slug);
  if (!inv) return new Response('Undangan tidak ditemukan', { status: 404 });

  const data = inv.weddingData as any;
  const groom = data?.couple?.groom?.nickname || 'Mempelai';
  const bride = data?.couple?.bride?.nickname || 'Mempelai';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ruanghadir.net';
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ruanghadir.net//Wedding Invitation//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  const events = [
    { key: 'akad', label: 'Akad Nikah', ev: data?.events?.akad },
    { key: 'resepsi', label: 'Resepsi', ev: data?.events?.resepsi },
  ];

  for (const { key, label, ev } of events) {
    if (!ev || ev.enabled === false) continue;
    const start = toIcsDate(ev.date, ev.timeStart, key === 'akad' ? 8 : 11);
    if (!start) continue;
    const end = toIcsDate(ev.date, ev.timeEnd, key === 'akad' ? 10 : 14) || start;
    const location = [ev.venueName, ev.address].filter(Boolean).join(', ');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${inv.id}-${key}@ruanghadir.net`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Asia/Jakarta:${start}`,
      `DTEND;TZID=Asia/Jakarta:${end}`,
      `SUMMARY:${escapeIcs(`${label} ${groom} & ${bride}`)}`,
      `LOCATION:${escapeIcs(location)}`,
      `DESCRIPTION:${escapeIcs(`Undangan digital: ${appUrl}/${slug}`)}`,
      ev.googleMapsUrl ? `URL:${escapeIcs(ev.googleMapsUrl)}` : '',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Besok acara pernikahan',
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return new Response(lines.filter(Boolean).join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="undangan-${slug}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
