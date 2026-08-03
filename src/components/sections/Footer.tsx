'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  IconLogoMark,
  IconInstagram,
  IconTwitter,
  IconMail,
  IconPhone,
  IconMapPin,
} from '@/components/Icons';

const footerColumns = {
  Produk: ['Template', 'Fitur', 'Harga', 'Integrasi', 'Changelog', 'Roadmap'],
  Perusahaan: ['Tentang', 'Blog', 'Karir', 'Press Kit', 'Partner', 'Kontak'],
  'Sumber Daya': ['Pusat Bantuan', 'Panduan', 'Komunitas', 'API Docs', 'Status', 'Tutorial Video'],
  Legal: ['Privasi', 'Syarat & Ketentuan', 'Cookie', 'GDPR', 'SLA'],
};

export function Footer() {
  return (
    <footer>
      {/* CTA Strip */}
      <section className="bg-gradient-rose py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-white font-semibold mb-3">
            Siap membuat undangan impian?
          </h2>
          <p className="text-white/80 text-sm md:text-base mb-8 max-w-md mx-auto">
            Bergabung dengan ribuan pasangan yang telah mempercayakan momen spesial mereka kepada kami.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-primary rounded-full hover:bg-white/90 font-medium px-8"
            >
              Mulai Gratis
            </Button>
            <a
              href="#"
              className="text-sm text-white/80 hover:text-white underline underline-offset-4 transition-colors"
            >
              Hubungi Sales
            </a>
          </div>
        </div>
      </section>

      {/* Main Footer — Dark */}
      <section className="bg-foreground text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
            {/* Column 1 — Brand (spans 2 on lg) */}
            <div className="col-span-2">
              <a href="#" className="flex items-center gap-2 mb-4">
                <IconLogoMark size={28} className="text-white" />
                <span className="text-lg tracking-tight font-semibold">
                  Ruang<span className="font-serif text-white">Undang</span><span className="text-[0.6em] text-primary-foreground/50 font-normal align-super">.net</span>
                </span>
              </a>

              <p className="text-sm text-primary-foreground/60 leading-relaxed mb-6 max-w-xs">
                Platform undangan pernikahan digital terbaik di Indonesia.
                Wujudkan hari bahagia Anda dengan undangan yang elegan dan berkesan.
              </p>

              {/* Contact info */}
              <div className="space-y-2 mb-6">
                <a
                  href="tel:+6281234567890"
                  className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  <IconPhone size={14} />
                  <span>+62 812 3456 7890</span>
                </a>
                <a
                  href="mailto:hello@RUANGHADIR.id"
                  className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  <IconMail size={14} />
                  <span>hello@RUANGHADIR.id</span>
                </a>
                <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
                  <IconMapPin size={14} className="shrink-0" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3 mb-6">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                >
                  <IconInstagram size={14} />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                >
                  <IconTwitter size={14} />
                </a>
                <a
                  href="#"
                  aria-label="Email"
                  className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                >
                  <IconMail size={14} />
                </a>
              </div>

              {/* App store badges */}
              <div className="flex items-center gap-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors"
                >
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" className="text-primary-foreground/80">
                    <path d="M8.4 1.4C7.6.6 6.8.2 6.2 0c-.2.8 0 1.8.6 2.6.6.8 1.4 1.2 2.2 1.2.2-.8 0-1.6-.6-2.4zM10 6.2c-.6 0-1.2.2-1.6.6-.2.2-.4.2-.6.2-.2 0-.4 0-.6-.2C6.6 6.4 6 6.2 5.4 6.2c-1.2 0-2 .8-2.6 1.8C2 9.2 2 11.2 3.2 12.6c.6.8 1.4 1.2 2 1.4h.2c.4 0 .8-.2 1.2-.6.4-.2.6-.2.8-.2.2 0 .4 0 .8.2.4.4.8.6 1.2.6h.2c.8-.2 1.6-.8 2.2-1.8 1-1.4 1.2-3.2.6-4.6-.6-1.2-1.6-1.6-2.4-1.6z" fill="currentColor"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] text-primary-foreground/50">Unduh di</div>
                    <div className="text-[11px] text-primary-foreground/80 font-medium">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors"
                >
                  <svg width="11" height="12" viewBox="0 0 11 12" fill="none" className="text-primary-foreground/80">
                    <path d="M1 0v12l2.8-2.2L5.8 12l1-2.6-2.6-1.8h3.6V0H1z" fill="currentColor"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] text-primary-foreground/50">Dapatkan di</div>
                    <div className="text-[11px] text-primary-foreground/80 font-medium">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerColumns).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/40 mb-4">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <Separator className="bg-primary-foreground/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-primary-foreground/50">
              © 2026 ruanghadir.net. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Language selector */}
              <div className="flex items-center gap-1 text-xs text-primary-foreground/50">
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors font-medium text-primary-foreground/70"
                >
                  ID
                </a>
                <span className="text-primary-foreground/30">|</span>
                <a
                  href="#"
                  className="hover:text-primary-foreground transition-colors"
                >
                  EN
                </a>
              </div>
              {/* Social icons for mobile */}
              <div className="flex items-center gap-2 sm:hidden">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
                >
                  <IconInstagram size={14} />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
                >
                  <IconTwitter size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
