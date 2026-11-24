"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Copy, ExternalLink } from "lucide-react";
import type {
  SaaSUser,
  WeddingData,
  Guest,
  RSVP,
  WeddingAnalytics,
} from "@/types";
import {
  isEnterpriseTier,
  PACKAGE_NAMES,
  normalizePackageId,
} from "@/lib/packageLimits";

interface DashboardOverviewProps {
  user: SaaSUser;
  weddingData: WeddingData;
  invitation: {
    id: string;
    slug?: string | null;
    themeId: string;
    isPublished: boolean;
    title?: string;
  } | null;
  guests: Guest[];
  rsvps: RSVP[];
  analytics: WeddingAnalytics;
  onNavigate: (
    segment:
      | "overview"
      | "design"
      | "settings"
      | "guests"
      | "analytics"
      | "profile"
      | "upgrade",
  ) => void;
  onPublish: () => void;
  publicSlug?: string;
}

export default function DashboardOverview({
  user,
  weddingData,
  invitation,
  guests,
  rsvps,
  analytics,
  onNavigate,
  onPublish,
  publicSlug,
}: DashboardOverviewProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const slug = publicSlug || invitation?.slug || user.activeSlug || "";
  const liveUrl = slug ? `https://ruanghadir.net/${slug}` : "";
  const published = Boolean(invitation?.isPublished);
  const groom =
    weddingData?.couple?.groom?.nickname || user.coupleGroom || "Mempelai Pria";
  const bride =
    weddingData?.couple?.bride?.nickname ||
    user.coupleBride ||
    "Mempelai Wanita";
  const checklist = [
    {
      id: "couple",
      label: "Nama kedua mempelai",
      detail: "Isi nama lengkap dan sapaan.",
      done: Boolean(
        weddingData?.couple?.groom?.fullName?.trim() &&
          weddingData?.couple?.bride?.fullName?.trim(),
      ),
      action: () => onNavigate("design"),
    },
    {
      id: "events",
      label: "Tanggal acara",
      detail: "Tambahkan jadwal akad atau resepsi.",
      done: Boolean(
        weddingData?.events?.akad?.date?.trim() ||
          weddingData?.events?.resepsi?.date?.trim(),
      ),
      action: () => onNavigate("design"),
    },
    {
      id: "gallery",
      label: "Foto galeri",
      detail: "Pilih foto yang ingin dibagikan.",
      done: (weddingData?.gallery?.length || 0) > 0,
      action: () => onNavigate("design"),
    },
    {
      id: "guests",
      label: "Daftar tamu",
      detail: "Siapkan tautan bernama untuk tamu.",
      done: guests.length > 0,
      action: () => onNavigate("guests"),
    },
    {
      id: "publish",
      label: "Terbitkan undangan",
      detail: "Periksa pratinjau sebelum membagikan.",
      done: published,
      action: onPublish,
    },
  ];
  const complete = checklist.filter((item) => item.done).length;
  const next = checklist.find((item) => !item.done);
  const percent = Math.round((complete / checklist.length) * 100);
  const copyLink = async () => {
    if (!liveUrl) return;
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };
  const metrics = [
    {
      label: "Kunjungan",
      value: analytics?.viewsCount || 0,
      note: "Total kunjungan undangan",
      target: "analytics" as const,
    },
    {
      label: "Nama tamu",
      value: guests.length,
      note: "Dalam daftar undangan",
      target: "guests" as const,
    },
    {
      label: "RSVP hadir",
      value: rsvps.filter((r) => r.status === "Hadir").length,
      note: `${analytics?.totalGuestsAttending || 0} estimasi orang`,
      target: "analytics" as const,
    },
    {
      label: "Balasan RSVP",
      value: rsvps.length,
      note: "Semua status konfirmasi",
      target: "analytics" as const,
    },
  ];

  return (
    <div className="rh-overview">
      <header className="rh-overview-heading">
        <div>
          <p className="rh-eyebrow">Ruang persiapan kalian</p>
          <h1>
            {groom} <span>&amp;</span> {bride}
          </h1>
          <p>Satu tempat untuk menyiapkan undangan dan menyambut para tamu.</p>
        </div>
        <button
          type="button"
          className="rh-action rh-action-primary"
          onClick={onPublish}
        >
          {published ? "Bagikan undangan" : "Terbitkan undangan"}
          <ArrowRight size={16} aria-hidden />
        </button>
      </header>

      <section
        className="rh-project-strip"
        aria-label="Status dan tautan undangan"
      >
        <span className={`rh-status ${published ? "is-live" : ""}`}>
          {published ? "Sudah terbit" : "Masih draft"}
        </span>
        <div className="rh-project-address">
          <span>Tautan undangan</span>
          {liveUrl ? (
            <code>{liveUrl}</code>
          ) : (
            <p>Tautan akan tersedia setelah proyek disiapkan.</p>
          )}
        </div>
        {liveUrl && (
          <div className="rh-inline-actions">
            <button type="button" className="rh-action" onClick={copyLink}>
              {copyState === "copied" ? (
                <Check size={15} aria-hidden />
              ) : (
                <Copy size={15} aria-hidden />
              )}
              {copyState === "copied" ? "Tersalin" : "Salin tautan"}
            </button>
            {published && (
              <a
                className="rh-action"
                href={`/${slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Buka
                <ExternalLink size={14} aria-hidden />
              </a>
            )}
          </div>
        )}
        <span className="sr-only" role="status" aria-live="polite">
          {copyState === "copied" ? "Tautan berhasil disalin." : ""}
        </span>
        {copyState === "error" && (
          <p className="rh-copy-error" role="alert">
            Tautan belum bisa disalin otomatis. Pilih dan salin alamat di atas.
          </p>
        )}
      </section>

      <section className="rh-metrics" aria-label="Ringkasan tamu dan aktivitas">
        {metrics.map((metric) => (
          <button
            type="button"
            key={metric.label}
            onClick={() => onNavigate(metric.target)}
          >
            <span>{metric.label}</span>
            <strong>{metric.value.toLocaleString("id-ID")}</strong>
            <small>{metric.note}</small>
          </button>
        ))}
      </section>

      <div className="rh-overview-columns">
        <section className="rh-preparation">
          <div className="rh-section-heading">
            <h2>Persiapan undangan</h2>
            <span>
              {complete}/{checklist.length} selesai
            </span>
          </div>
          <div
            className="rh-readiness"
            role="progressbar"
            aria-label="Kelengkapan persiapan"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
          {next ? (
            <div className="rh-next-step">
              <p>Langkah berikutnya</p>
              <button type="button" onClick={next.action}>
                {next.label}
                <ArrowRight size={17} aria-hidden />
              </button>
              <span>{next.detail}</span>
            </div>
          ) : (
            <div className="rh-next-step">
              <p>Semua langkah terisi</p>
              <strong>Siap menyambut kabar bahagia.</strong>
              <span>Periksa kembali jadwal dan lokasi melalui pratinjau.</span>
            </div>
          )}
          <ol className="rh-checklist">
            {checklist.map((item, index) => (
              <li key={item.id}>
                <span
                  className={`rh-step-number ${item.done ? "is-done" : ""}`}
                  aria-label={item.done ? "Selesai" : "Belum selesai"}
                >
                  {item.done ? <Check size={14} aria-hidden /> : index + 1}
                </span>
                <div>
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                </div>
                <button
                  type="button"
                  onClick={item.action}
                  aria-label={`${item.done ? "Edit" : "Lengkapi"} ${item.label}`}
                >
                  {item.done ? "Edit" : "Lengkapi"}
                </button>
              </li>
            ))}
          </ol>
          <div className="rh-preparation-footer">
            <button type="button" onClick={() => onNavigate("settings")}>
              Jelajahi koleksi tema
              <ArrowRight size={15} aria-hidden />
            </button>
          </div>
        </section>

        <div className="rh-overview-aside">
          <section className="rh-replies">
            <div className="rh-section-heading">
              <h2>Kabar dari tamu</h2>
              <button type="button" onClick={() => onNavigate("analytics")}>
                Lihat semua
              </button>
            </div>
            {rsvps.length === 0 ? (
              <div className="rh-empty">
                <span>Belum ada balasan</span>
                <p>
                  Setelah undangan dibagikan, konfirmasi kehadiran dan ucapan
                  akan muncul di sini.
                </p>
                <button
                  type="button"
                  className="rh-action"
                  onClick={() => onNavigate("guests")}
                >
                  Siapkan daftar tamu
                </button>
              </div>
            ) : (
              <ul className="rh-reply-list">
                {rsvps.slice(0, 4).map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{entry.guestName}</strong>
                      <span
                        className={`rh-rsvp-state ${entry.status === "Hadir" ? "is-attending" : ""}`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    {entry.wishes && <p>{entry.wishes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rh-plan-note">
            <p>Paket kalian</p>
            <h2>{PACKAGE_NAMES[normalizePackageId(user.packageId)]}</h2>
            <p>
              {isEnterpriseTier(user.packageId)
                ? "Akses organisasi sesuai kesepakatan layanan."
                : "Semua tema dan tamu tanpa batas. Tanpa watermark."}
            </p>
            <button type="button" onClick={() => onNavigate("upgrade")}>
              Lihat detail paket
              <ArrowRight size={15} aria-hidden />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
