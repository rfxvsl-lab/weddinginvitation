'use client';

import { motion, Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconInvitation,
  IconBroadcast,
  IconRSVP,
  IconMelody,
  IconPinDrop,
  IconEnvelopeGift,
  IconShieldHeart,
  IconDeviceFlow,
} from '@/components/Icons';

const features = [
  {
    icon: IconInvitation,
    title: 'Template Premium',
    description:
      '50+ template eksklusif yang dirancang desainer profesional. Dari klasik hingga modern, semua bisa disesuaikan.',
  },
  {
    icon: IconBroadcast,
    title: 'Kirim Masal WhatsApp',
    description:
      'Kirim ke ribuan tamu sekaligus via WhatsApp. Hemat waktu dan biaya tanpa undangan fisik.',
  },
  {
    icon: IconRSVP,
    title: 'Manajemen RSVP',
    description:
      'Pantau konfirmasi kehadiran real-time. Kelola daftar tamu tanpa repot menghubungi satu per satu.',
  },
  {
    icon: IconMelody,
    title: 'Musik & Animasi',
    description:
      'Tambahkan musik latar dan animasi indah. Buat undangan lebih hidup dan berkesan.',
  },
  {
    icon: IconPinDrop,
    title: 'Peta Interaktif',
    description:
      'Integrasi Google Maps untuk tamu mudah menemukan lokasi. Lengkap dengan navigasi langsung.',
  },
  {
    icon: IconEnvelopeGift,
    title: 'Amplop Digital',
    description:
      'Terima ucapan dan hadiah digital secara aman. Tamu kirim doa dan amplop langsung via undangan.',
  },
  {
    icon: IconShieldHeart,
    title: 'Aman & Privat',
    description:
      'Dilindungi kode akses unik dan enkripsi tingkat tinggi. Privasi data Anda terjaga.',
  },
  {
    icon: IconDeviceFlow,
    title: 'Responsif Sempurna',
    description:
      'Tampilan sempurna di semua perangkat. Dari smartphone hingga laptop, pengalaman tetap optimal.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};


const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function Features() {
  return (
    <section id="fitur" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Fitur Unggulan
          </p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-semibold">
            Semua yang Anda Butuhkan{' '}
            <span className="text-gradient-rose">dalam Satu Platform</span>
          </h2>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={cardVariants}>
                <Card className="group rounded-2xl border border-border/60 py-5 px-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-light/50 text-primary">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-serif text-base font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
