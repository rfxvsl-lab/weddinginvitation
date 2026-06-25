'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  IconLogoMark,
  IconMenu,
} from '@/components/Icons';

const navLinks = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Template', href: '#template' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Harga', href: '#harga' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
];

interface NavbarProps {
  onAuthOpen?: () => void;
}

export function Navbar({ onAuthOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-14 ${
        scrolled
          ? 'glass-strong border-b border-border/40 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 shrink-0">
          <IconLogoMark size={28} className="text-primary" />
          <span className="text-base tracking-tight">
            Ruang<span className="font-serif text-primary">Undang</span><span className="text-[0.65em] text-muted-foreground font-normal align-super">.net</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right side buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/auth">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
            >
              Masuk
            </Button>
          </Link>
          <Link href="/auth?mode=register">
            <Button
              size="sm"
              className="bg-gradient-rose text-white rounded-full hover:opacity-90"
            >
              Buat Undangan
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <IconMenu size={20} />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Logo at top */}
                <div className="flex items-center gap-2 px-5 pt-6 pb-4 border-b border-border/40">
                  <IconLogoMark size={24} className="text-primary" />
                  <span className="text-base tracking-tight">
                    Ruang<span className="font-serif text-primary">Undang</span><span className="text-[0.65em] text-muted-foreground font-normal align-super">.net</span>
                  </span>
                </div>

                {/* Nav links */}
                <div className="flex-1 overflow-y-auto px-2 py-3">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={closeMobile}
                      className="block px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                {/* Bottom buttons */}
                <div className="p-4 border-t border-border/40 space-y-2.5">
                  <Link href="/auth" onClick={closeMobile} className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/auth?mode=register" onClick={closeMobile} className="block w-full">
                    <Button className="w-full bg-gradient-rose text-white rounded-full hover:opacity-90">
                      Buat Undangan
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
