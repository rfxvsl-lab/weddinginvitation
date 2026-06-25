'use client';

import { motion, Variants } from 'framer-motion';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconCheck } from '@/components/Icons';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
  variant: 'outline' | 'filled';
}

const tiers: PricingTier[] = [
  {
    name: 'Demo',
    price: 'Rp 0',
    period: '3 hari aktif',
    features: [
      '1 proyek undangan',
      '2 tema pilihan',
      '20 tamu maksimal',
      'Preview saja (tidak bisa publish)',
      'Watermark besar RUANGHADIR',
    ],
    cta: 'Coba Gratis',
    variant: 'outline',
  },
  {
    name: 'Reguler',
    price: 'Rp 35rb',
    period: '20 hari aktif',
    features: [
      '1 proyek undangan',
      '3 tema pilihan',
      '100 tamu maksimal',
      'Publish undangan',
      'Watermark kecil',
      'Export CSV tamu',
      '6 foto galeri',
    ],
    cta: 'Pilih Reguler',
    variant: 'outline',
  },
  {
    name: 'Premium',
    price: 'Rp 90rb',
    period: '2 bulan aktif',
    features: [
      '2 proyek undangan',
      'Semua tema tersedia',
      '500 tamu maksimal',
      'Tanpa watermark',
      'QR Code check-in',
      'Export CSV & PDF',
      '20 foto galeri',
      'Upload musik sendiri',
      'Statistik lengkap',
    ],
    cta: 'Pilih Premium',
    popular: true,
    variant: 'filled',
  },
  {
    name: 'Luxury',
    price: 'Rp 150rb',
    period: '3 bulan aktif',
    features: [
      '3 proyek undangan',
      'Semua tema + kustomisasi',
      'Tamu tak terbatas',
      'Tanpa watermark',
      'Galeri tak terbatas',
      'Semua fitur premium',
      'Ganti slug tanpa batas',
      'Support prioritas',
    ],
    cta: 'Pilih Luxury',
    variant: 'outline',
  },
];


const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function Pricing() {
  return (
    <section id="harga" className="py-16 md:py-20">
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
            Harga
          </p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-semibold">
            Pilih Paket yang <span className="text-gradient-rose">Tepat</span>
          </h2>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {tiers.map((tier) => (
            <motion.div key={tier.name} variants={cardVariants}>
              <Card
                className={`relative flex flex-col rounded-2xl py-0 shadow-sm ${
                  tier.popular
                    ? 'border-primary ring-1 ring-primary/20 md:-translate-y-3 shadow-lg'
                    : 'border-border/60'
                }`}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-rose text-white border-0 px-3 py-1 text-xs font-medium">
                      Paling Populer
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-0">
                  <h3 className="font-serif text-lg font-semibold">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-semibold">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pt-4">
                  <ul className="space-y-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <IconCheck
                          size={18}
                          className="mt-0.5 shrink-0 text-primary"
                        />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-2">
                  {tier.variant === 'filled' ? (
                    <Link href="/auth?mode=register" className="w-full">
                      <Button className="w-full rounded-full bg-gradient-rose text-white hover:opacity-90 transition-opacity">
                        {tier.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth?mode=register" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
