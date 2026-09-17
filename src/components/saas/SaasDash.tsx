"use client";
import React from "react";
import { Search, Bell, Palette, PenLine, Users } from "lucide-react";
import { BarChart3, UserCircle, Sparkles } from "lucide-react";

export function SaasShell({ sidebar, children }: { sidebar?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="saas-scope min-h-screen p-3 sm:p-5">
      <div className="mx-auto grid max-w-[1280px] gap-4 lg:grid-cols-[248px_1fr]">
        {sidebar}
        <div className="min-w-0 space-y-4">{children}</div>
      </div>
    </div>
  );
}

export function SaasTopbar({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="saas-card flex flex-wrap items-center gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[19px] font-extrabold">{title}</h1>
        {sub && <p className="truncate text-[13px]" style={{ color: "var(--saas-muted)" }}>{sub}</p>}
      </div>
      <span className="hidden items-center gap-2 rounded-full border px-3 py-2 text-[13px] md:flex" style={{ borderColor: "var(--saas-line)", background: "#fff", color: "var(--saas-faint)" }}>
        <Search size={15} /> Cari tamu, tema…
      </span>
      <span className="relative rounded-full border p-2.5" style={{ borderColor: "var(--saas-line)", background: "#fff", color: "var(--saas-ink-2)" }}>
        <Bell size={16} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: "var(--saas-wine)" }} />
      </span>
    </div>
  );
}

export function SaasSideNav({ active, onNav, user, onPublish }: {
  active: string; onNav: (id: string) => void;
  user?: { name?: string; email?: string; pkg?: string } | null;
  onPublish?: () => void;
}) {
  const items = [
    { id: "settings", label: "Pilih Tema", icon: Palette },
    { id: "design", label: "Desain Undangan", icon: PenLine },
    { id: "guests", label: "Daftar Tamu", icon: Users },
    { id: "analytics", label: "Statistik RSVP", icon: BarChart3 },
    { id: "profile", label: "Profil Anda", icon: UserCircle },
    { id: "upgrade", label: "Upgrade Akun", icon: Sparkles },
  ];
  return (
    <aside className="saas-card flex h-fit flex-col p-4 lg:sticky lg:top-5">
      <span className="flex items-center gap-2.5 px-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-extrabold text-[#FFF6F1]" style={{ background: "linear-gradient(135deg,#9A3A52,#7E2A3F)" }}>RH</span>
        <span className="text-[14.5px] font-extrabold" style={{ color: "var(--saas-ink)" }}>RuangHadir<span className="font-semibold" style={{ color: "var(--saas-muted)" }}> Studio</span></span>
      </span>
      <nav className="mt-4 space-y-1">
        {items.map((it) => (
          <button key={it.id} onClick={() => onNav(it.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold"
            style={active === it.id ? { background: "var(--saas-wine-soft)", color: "var(--saas-wine)" } : { color: "var(--saas-muted)" }}>
            <it.icon size={17} /> {it.label}
          </button>
        ))}
      </nav>
      <button onClick={onPublish} className="saas-btn-primary mt-4 w-full !py-3">Publish Undangan</button>
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border p-3" style={{ borderColor: "var(--saas-line)" }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-extrabold text-[#FFF6F1]" style={{ background: "linear-gradient(135deg,#9A3A52,#7E2A3F)" }}>
          {(user?.name || "RH").slice(0, 2).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-extrabold" style={{ color: "var(--saas-ink)" }}>{user?.name || "Pengguna"}</span>
          <span className="block truncate text-[11.5px]" style={{ color: "var(--saas-muted)" }}>{user?.pkg || "Demo"}{user?.email ? ` • ${user.email}` : ""}</span>
        </span>
      </div>
    </aside>
  );
}
