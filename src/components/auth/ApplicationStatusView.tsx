"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ENTERPRISE_CONTACT_EMAIL } from "@/lib/packageLimits";
import type { AccountApplication } from "@/hooks/useAuth";

export default function ApplicationStatusView({
  application,
  onCheckAgain,
}: {
  application: AccountApplication | null;
  onCheckAgain: () => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const rejected = application?.accountStatus === "rejected";
  useEffect(() => {
    titleRef.current?.focus();
  }, [application?.accountStatus]);
  return (
    <section
      className="w-full max-w-[480px] space-y-6 px-4 py-6"
      aria-labelledby="application-heading"
    >
      <Logo isLink height="h-8" />
      <p className="text-[12px] font-semibold tracking-wide text-[var(--rh-primary)]">
        AKSES AWAL RUANGHADIR
      </p>
      <h1
        id="application-heading"
        ref={titleRef}
        tabIndex={-1}
        className="text-[32px] leading-tight tracking-tight text-[var(--rh-ink)] focus:outline-none"
      >
        {rejected
          ? "Pendaftaran belum disetujui."
          : application
            ? "Pendaftaran kalian sudah kami terima."
            : "Periksa status pendaftaran kalian."}
      </h1>
      <div className="space-y-4 text-[15px] leading-relaxed text-[var(--rh-ink-2)]">
        {application ? (
          <>
            <p>
              {rejected
                ? "Saat ini akun belum mendapatkan Akses Awal. Hubungi tim RuangHadir jika kalian ingin menanyakan pendaftaran ini."
                : "Tim RuangHadir akan meninjau pendaftaran terlebih dahulu. Dashboard dapat digunakan setelah akun disetujui."}
            </p>
            {application.application?.email && (
              <p className="break-words border-y border-[var(--rh-line)] py-4">
                <span className="block text-[12px] text-[var(--rh-muted)]">
                  Email pendaftaran
                </span>
                {application.application.email}
              </p>
            )}
          </>
        ) : (
          <p>
            Masuk dengan email dan password atau akun Google yang dipakai saat
            mendaftar. Kami akan menampilkan status pendaftaran atau membuka
            dashboard jika akun sudah disetujui.
          </p>
        )}
        {!rejected && application && (
          <p>
            Kami akan mengabari melalui kontak pendaftaran setelah ditinjau.
            Kalian juga bisa masuk kembali untuk memeriksa statusnya.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onCheckAgain}
        className="saas-btn-primary w-full !min-h-[48px]"
      >
        Masuk untuk periksa status
      </button>
      <p className="text-[13px] leading-relaxed text-[var(--rh-muted)]">
        Ada yang ingin ditanyakan?{" "}
        <a
          className="underline underline-offset-4"
          href={`mailto:${ENTERPRISE_CONTACT_EMAIL}`}
        >
          {ENTERPRISE_CONTACT_EMAIL}
        </a>
      </p>
      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-[var(--rh-primary)]"
      >
        Kembali ke beranda
      </Link>
    </section>
  );
}
