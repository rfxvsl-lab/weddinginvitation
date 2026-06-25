'use client';

import { motion, Variants } from 'framer-motion';
import { IconInvitation, IconSparkleStar, IconBroadcast } from '@/components/Icons';

const steps = [
  {
    number: '01',
    icon: IconInvitation,
    title: 'Pilih & Isi Data',
    description:
      'Pilih template favorit dan isi data acara Anda — nama, tanggal, lokasi, dan detail lainnya. Prosesnya cepat dan intuitif.',
  },
  {
    number: '02',
    icon: IconSparkleStar,
    title: 'Personalisasi',
    description:
      'Sesuaikan warna, musik, foto, dan animasi sesuai selera. Jadikan undangan Anda benar-benar unik dan personal.',
  },
  {
    number: '03',
    icon: IconBroadcast,
    title: 'Kirim & Pantau',
    description:
      'Kirim undangan ke ribuan tamu via WhatsApp dalam satu klik. Pantau RSVP dan statistik langsung dari dashboard.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Cara Kerja
          </p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-semibold">
            3 Langkah Mudah Menuju{' '}
            <span className="text-gradient-rose">Hari Bahagia</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="flex flex-col md:flex-row md:items-start gap-6 md:gap-0"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                className="relative flex-1"
              >
                {/* Connecting dashed line (desktop only, between steps) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-12 left-[calc(50%+2rem)] hidden md:block w-[calc(100%-4rem)] border-t border-dashed border-primary/20" />
                )}

                <div className="relative rounded-2xl border border-border/60 bg-card p-5 text-center">
                  {/* Faded number */}
                  <span className="absolute top-2 right-4 font-serif text-6xl font-bold leading-none text-primary/5 select-none">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-light/50 text-primary">
                    <Icon size={24} />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-base font-semibold">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
