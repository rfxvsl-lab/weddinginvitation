"use client";
import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { SITE } from "@/lib/site";
import { PACKAGE_PRICES, PACKAGE_LIMITS, PACKAGE_NAMES, formatActiveDays, formatLimit } from "@/lib/packageLimits";

const ORDER: ("demo" | "reguler" | "premium" | "luxury")[] = ["demo", "reguler", "premium", "luxury"];

export function SaasPricing() {
  return (
    <section id="harga" className="saas-shell pt-24">
      <div className="max-w-[620px]">
        <h2 className="text-[32px] sm:text-[40px]">Bayar sekali, tanpa langganan</h2>
        <p className="mt-4 text-[14.5px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>
          Harga di bawah untuk undangan yang kalian susun sendiri. Paket bisa dinaikkan kapan saja dan data
          undangan tetap tersimpan.
        </p>
      </div>

      <div className="mt-10 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ORDER.map((id) => {
          const lim = PACKAGE_LIMITS[id];
          const popular = id === "premium";
          const feats = [
            `${formatLimit(lim.maxProjects)} proyek undangan`,
            lim.maxGuests === Infinity ? "Tamu tak terbatas" : `${formatLimit(lim.maxGuests)} tamu maks`,
            lim.maxGallery === Infinity ? "Galeri tak terbatas" : `${formatLimit(lim.maxGallery)} foto galeri`,
            lim.canPublish ? "Publish undangan penuh" : "Preview saja",
            lim.canQR ? "QR check-in tamu" : lim.canExportCSV ? "Export CSV tamu" : "Watermark besar",
          ];
          return (
            <div
              key={id}
              className={`saas-card flex flex-col p-6 ${popular ? "saas-dark-panel" : "saas-card-hover"}`}
              style={popular ? { borderColor: "rgba(185,138,68,.45)" } : undefined}
            >
              {popular ? (
                <span className="saas-badge mb-3 self-start" style={{ background: "var(--saas-gold)", color: "#241505" }}>Rekomendasi kami</span>
              ) : (
                <span className="mb-3 block h-6" />
              )}
              <h3 className="text-[15px] font-extrabold">{PACKAGE_NAMES[id]}</h3>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-[13px] font-bold" style={{ color: popular ? "#D8C3B4" : "var(--saas-muted)" }}>Rp</span>
                <span className={`tabular text-[30px] font-extrabold ${popular ? "text-white" : ""}`}>
                  {PACKAGE_PRICES[id].mandiri.toLocaleString("id-ID")}
                </span>
              </p>
              <p className="text-[12px] font-semibold" style={{ color: popular ? "#D8C3B4" : "var(--saas-muted)" }}>
                {formatActiveDays(lim.activeDays)} masa aktif
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {feats.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] font-medium">
                    <span
                      className="saas-check mt-0.5"
                      style={popular ? { background: "rgba(255,255,255,.14)", color: "var(--saas-gold-2)" } : undefined}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span style={popular ? { color: "#EFE4DA" } : { color: "var(--saas-ink-2)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              {id === "demo" ? (
                <Link href="/preview" className="saas-btn-outline mt-6 w-full !py-3">
                  Lihat contoh tema
                </Link>
              ) : popular ? (
                <Link
                  href={`/auth?mode=register&package=${id}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-extrabold"
                  style={{ background: "#FFF6F1", color: "var(--saas-wine)" }}
                >
                  Pilih {PACKAGE_NAMES[id]}
                </Link>
              ) : (
                <Link href={`/auth?mode=register&package=${id}`} className="saas-btn-outline mt-6 w-full !py-3">
                  Pilih {PACKAGE_NAMES[id]}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[13px]" style={{ color: "var(--saas-ink-2)" }}>
        Semua paket berbayar bergaransi uang kembali {SITE.refundDays} hari sejak pembayaran dikonfirmasi.{" "}
        <Link href="/refund-policy" className="font-semibold underline underline-offset-2" style={{ color: "var(--saas-wine)" }}>
          Baca syaratnya
        </Link>
        .
      </p>
    </section>
  );
}
