'use client';

import { motion, Variants } from 'framer-motion';
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials';

export function Testimonials() {
  return (
    <section id="testimoni" className="py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
            Testimoni
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            Kata Mereka tentang{' '}
            <span className="text-gradient-rose">RUANGHADIR</span>
          </h2>
        </motion.div>

        {/* Stagger testimonials carousel */}
        <StaggerTestimonials />
      </div>
    </section>
  );
}
