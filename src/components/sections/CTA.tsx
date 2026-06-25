'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconCheck } from '@/components/Icons';

export function CTA() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Redirect to register with email pre-filled
    router.push(`/auth?mode=register&email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl bg-gradient-rose p-8 md:p-12 overflow-hidden"
        >
          {/* Organic blob decorations */}
          <div className="absolute top-6 left-6 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white text-center mb-2">
              Siap Mewujudkan Undangan Impian?
            </h2>
            <p className="text-white/80 text-base text-center mb-8 max-w-xl mx-auto">
              Bergabunglah dengan 50.000+ pasangan bahagia yang telah
              mempercayakan hari spesial mereka bersama RUANGHADIR.
            </p>

            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-11 px-6 font-semibold"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    'Mulai Gratis'
                  )}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-white"
              >
                <IconCheck size={20} />
                <span className="text-base font-medium">
                  Terima kasih! Kami akan menghubungi Anda segera.
                </span>
              </motion.div>
            )}

            <p className="text-white/50 text-xs text-center mt-4">
              Gratis selamanya. Tanpa kartu kredit.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
