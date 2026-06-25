'use client';

import { motion, Variants } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Apakah RUANGHADIR benar-benar gratis?',
    answer:
      'Ya! Paket Gratis sepenuhnya gratis tanpa biaya tersembunyi. Anda bisa membuat 1 undangan aktif dengan 3 pilihan template dan mengundang hingga 50 tamu.',
  },
  {
    question: 'Berapa lama membuat undangan?',
    answer:
      'Rata-rata 15-30 menit. Template siap pakai, tinggal isi data. Editor drag-and-drop mudah digunakan tanpa keahlian desain.',
  },
  {
    question: 'Apakah tamu perlu install aplikasi?',
    answer:
      'Tidak perlu! Undangan diakses langsung via browser. Desain responsif memastikan tampilan sempurna di semua perangkat.',
  },
  {
    question: 'Cara mengirim undangan ke tamu?',
    answer:
      'Via WhatsApp masal, email, media sosial, atau salin link. Fitur kirim masal WhatsApp paling populer.',
  },
  {
    question: 'Apakah data saya aman?',
    answer:
      'Prioritas utama kami. Data dienkripsi standar tinggi, undangan dilindungi kode akses unik, dan tidak dibagikan ke pihak ketiga.',
  },
  {
    question: 'Metode pembayaran apa saja?',
    answer:
      'Transfer bank (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, DANA, ShopeePay), dan minimarket.',
  },
  {
    question: 'Bisa batalkan langganan?',
    answer:
      'Ya, kapan saja tanpa penalti. Kembali ke versi gratis di akhir periode. Undangan tetap bisa diakses.',
  },
  {
    question: 'Bisa request desain kustom?',
    answer:
      'Paket Ultimate menyediakan desain kustom oleh tim desainer profesional. Konsultasi langsung untuk wujudkan konsep impian Anda.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
            FAQ
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            Pertanyaan yang{' '}
            <span className="text-gradient-rose">Sering Ditanyakan</span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border/40 rounded-2xl px-5 data-[state=open]:bg-card data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
