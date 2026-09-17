import React from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { SaasNav } from "@/components/saas/SaasNav";
import { SaasFooter } from "@/components/saas/SaasClosing";

export default function NotFound() {
  return (
    <div className="saas-scope flex min-h-screen flex-col">
      <SaasNav />
      <main className="saas-shell flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="saas-kicker">404 — Halaman tidak ditemukan</p>
        <h1 className="mt-5 text-[56px] leading-none sm:text-[84px]">
          Halaman ini{" "}
          <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>mungkin hilang</span>.
        </h1>
        <p className="mt-6 max-w-[48ch] text-[15px] leading-[1.75]" style={{ color: "var(--saas-ink-2)" }}>
          Tautannya bisa jadi salah ketik, atau halamannya sudah dipindah. Mari kembali ke jalur yang benar.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="saas-btn-primary"><ArrowLeft size={16} /> Kembali ke Beranda</Link>
          <Link href="/preview" className="saas-btn-outline"><LayoutGrid size={15} /> Lihat Katalog Tema</Link>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12.5px] font-semibold" style={{ color: "var(--saas-muted)" }}>
          <Link href="/#harga" className="hover:underline">Harga</Link>
          <Link href="/#faq" className="hover:underline">FAQ</Link>
          <Link href="/contact" className="hover:underline">Kontak</Link>
          <Link href="/auth" className="hover:underline">Masuk</Link>
        </div>
      </main>
      <SaasFooter />
    </div>
  );
}